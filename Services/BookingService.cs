using System.Data;
using BookingApp.Data;
using BookingApp.DTOs;
using BookingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _context;
    private readonly IPricingCalculator _pricingCalculator;
    private readonly ILogger<BookingService> _logger;

    public const int HoldDurationMinutes = 15;

    public BookingService(
        AppDbContext context, 
        IPricingCalculator pricingCalculator, 
        ILogger<BookingService> logger)
    {
        _context = context;
        _pricingCalculator = pricingCalculator;
        _logger = logger;
    }

    public async Task<BookingQuoteDto> CalculateQuoteAsync(CalculateQuoteDto dto)
    {
        ValidateTimeRange(dto.StartTimeUtc, dto.EndTimeUtc);

        var room = await _context.ConferenceRooms
            .Include(r => r.RoomServices)
                .ThenInclude(rs => rs.Service)
            .FirstOrDefaultAsync(r => r.Id == dto.RoomId && !r.IsDeleted);

        if (room == null)
        {
            throw new KeyNotFoundException($"Conference room with ID '{dto.RoomId}' was not found.");
        }

        var selectedServices = await ResolveServicesAsync(room, dto.ServiceIds);

        var roomRentalCost = _pricingCalculator.CalculateRoomRentalCost(room.BaseHourlyRate, dto.StartTimeUtc, dto.EndTimeUtc);
        var servicesCost = _pricingCalculator.CalculateServicesCost(selectedServices.Select(s => s.Price));
        var totalCost = roomRentalCost + servicesCost;

        return new BookingQuoteDto
        {
            RoomId = room.Id,
            RoomName = room.Name,
            StartTimeUtc = dto.StartTimeUtc,
            EndTimeUtc = dto.EndTimeUtc,
            RoomRentalCost = roomRentalCost,
            ServicesCost = servicesCost,
            TotalCost = totalCost,
            HoldExpiresAtUtc = DateTime.UtcNow.AddMinutes(HoldDurationMinutes),
            Services = selectedServices.Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Price = s.Price
            }).ToList()
        };
    }

    public async Task<BookingDetailsDto> CreateBookingAsync(CreateBookingDto dto)
    {
        ValidateTimeRange(dto.StartTimeUtc, dto.EndTimeUtc);

        if (dto.StartTimeUtc < DateTime.UtcNow.AddMinutes(-10))
        {
            throw new ArgumentException("Booking cannot be scheduled in the past.");
        }

        // Use serializable transaction to prevent race condition / double-booking
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var room = await _context.ConferenceRooms
            .Include(r => r.RoomServices)
                .ThenInclude(rs => rs.Service)
            .FirstOrDefaultAsync(r => r.Id == dto.RoomId && !r.IsDeleted);

        if (room == null)
        {
            throw new KeyNotFoundException($"Conference room with ID '{dto.RoomId}' was not found.");
        }

        var now = DateTime.UtcNow;

        // Check for active overlapping bookings
        var hasOverlap = await _context.Bookings.AnyAsync(b =>
            b.RoomId == dto.RoomId &&
            (b.Status == BookingStatus.Confirmed || (b.Status == BookingStatus.Pending && b.HoldExpiresAtUtc > now)) &&
            b.StartTimeUtc < dto.EndTimeUtc &&
            b.EndTimeUtc > dto.StartTimeUtc);

        if (hasOverlap)
        {
            throw new InvalidOperationException("The conference room is already booked for the specified timeframe.");
        }

        var selectedServices = await ResolveServicesAsync(room, dto.ServiceIds);

        var roomRentalCost = _pricingCalculator.CalculateRoomRentalCost(room.BaseHourlyRate, dto.StartTimeUtc, dto.EndTimeUtc);
        var servicesCost = _pricingCalculator.CalculateServicesCost(selectedServices.Select(s => s.Price));
        var totalCost = roomRentalCost + servicesCost;
        var holdExpiresAtUtc = now.AddMinutes(HoldDurationMinutes);

        var booking = new Booking
        {
            RoomId = room.Id,
            Room = room,
            StartTimeUtc = dto.StartTimeUtc,
            EndTimeUtc = dto.EndTimeUtc,
            HoldExpiresAtUtc = holdExpiresAtUtc,
            Status = BookingStatus.Pending,
            RoomRentalCost = roomRentalCost,
            ServicesCost = servicesCost,
            TotalCost = totalCost,
            CreatedAtUtc = now,
            BookedServices = selectedServices.Select(s => new BookingApp.Models.BookingService
            {
                ServiceId = s.Id,
                Service = s,
                PriceAtBooking = s.Price
            }).ToList()
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        _logger.LogInformation("Created pending booking {BookingId} for room {RoomId}. Hold expires at {HoldExpiresAtUtc}",
            booking.Id, room.Id, holdExpiresAtUtc);

        return MapToDetailsDto(booking);
    }

    public async Task<BookingDetailsDto?> ConfirmBookingAsync(Guid bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.BookedServices)
                .ThenInclude(bs => bs.Service)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            return null;
        }

        if (booking.Status == BookingStatus.Confirmed)
        {
            return MapToDetailsDto(booking);
        }

        if (booking.Status != BookingStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot confirm booking with status '{booking.Status}'.");
        }

        var now = DateTime.UtcNow;
        if (booking.HoldExpiresAtUtc <= now)
        {
            booking.Status = BookingStatus.Expired;
            await _context.SaveChangesAsync();
            throw new InvalidOperationException("The booking hold has expired and cannot be confirmed.");
        }

        booking.Status = BookingStatus.Confirmed;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Confirmed booking {BookingId} for room {RoomId}", booking.Id, booking.RoomId);

        return MapToDetailsDto(booking);
    }

    public async Task<BookingDetailsDto?> GetBookingByIdAsync(Guid bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.BookedServices)
                .ThenInclude(bs => bs.Service)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            return null;
        }

        // Auto-update status if pending and expired
        if (booking.Status == BookingStatus.Pending && booking.HoldExpiresAtUtc <= DateTime.UtcNow)
        {
            booking.Status = BookingStatus.Expired;
            await _context.SaveChangesAsync();
        }

        return MapToDetailsDto(booking);
    }

    private static void ValidateTimeRange(DateTime startTimeUtc, DateTime endTimeUtc)
    {
        if (startTimeUtc >= endTimeUtc)
        {
            throw new ArgumentException("StartTimeUtc must be earlier than EndTimeUtc.");
        }

        if ((endTimeUtc - startTimeUtc).TotalDays > 30)
        {
            throw new ArgumentException("Booking duration cannot exceed 30 days.");
        }
    }

    private async Task<List<Service>> ResolveServicesAsync(ConferenceRoom room, List<Guid>? serviceIds)
    {
        if (serviceIds == null || !serviceIds.Any())
        {
            return new List<Service>();
        }

        var distinctIds = serviceIds.Distinct().ToList();

        // If the room has specific services linked, validate against those
        if (room.RoomServices.Any())
        {
            var roomServiceMap = room.RoomServices.ToDictionary(rs => rs.ServiceId, rs => rs.Service);
            var result = new List<Service>();

            foreach (var id in distinctIds)
            {
                if (!roomServiceMap.TryGetValue(id, out var service))
                {
                    throw new ArgumentException($"Service with ID '{id}' is not available for room '{room.Name}'.");
                }
                result.Add(service);
            }

            return result;
        }

        // Otherwise, fetch directly from Services table
        var dbServices = await _context.Services
            .Where(s => distinctIds.Contains(s.Id))
            .ToListAsync();

        if (dbServices.Count != distinctIds.Count)
        {
            var missingIds = distinctIds.Except(dbServices.Select(s => s.Id));
            throw new ArgumentException($"Service(s) not found: {string.Join(", ", missingIds)}");
        }

        return dbServices;
    }

    private static BookingDetailsDto MapToDetailsDto(Booking booking)
    {
        return new BookingDetailsDto
        {
            Id = booking.Id,
            RoomId = booking.RoomId,
            RoomName = booking.Room?.Name ?? string.Empty,
            StartTimeUtc = booking.StartTimeUtc,
            EndTimeUtc = booking.EndTimeUtc,
            HoldExpiresAtUtc = booking.HoldExpiresAtUtc,
            Status = booking.Status,
            RoomRentalCost = booking.RoomRentalCost,
            ServicesCost = booking.ServicesCost,
            TotalCost = booking.TotalCost,
            CreatedAtUtc = booking.CreatedAtUtc,
            Services = booking.BookedServices.Select(bs => new BookedServiceDto
            {
                ServiceId = bs.ServiceId,
                Name = bs.Service?.Name ?? string.Empty,
                PriceAtBooking = bs.PriceAtBooking
            }).ToList()
        };
    }
}
