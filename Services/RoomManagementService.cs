using BookingApp.Data;
using BookingApp.DTOs;
using BookingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Services;

public class RoomManagementService : IRoomManagementService
{
    private readonly AppDbContext _context;

    public RoomManagementService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
    {
        var rooms = await _context.ConferenceRooms
            .Where(r => !r.IsDeleted)
            .Include(r => r.RoomServices)
                .ThenInclude(rs => rs.Service)
            .ToListAsync();

        return rooms.Select(MapToDto);
    }

    public async Task<RoomDto?> GetRoomByIdAsync(Guid id)
    {
        var room = await _context.ConferenceRooms
            .Where(r => !r.IsDeleted)
            .Include(r => r.RoomServices)
                .ThenInclude(rs => rs.Service)
            .FirstOrDefaultAsync(r => r.Id == id);

        return room == null ? null : MapToDto(room);
    }

    public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime, int minCapacity = 0)
    {
        var now = DateTime.UtcNow;

        var availableRooms = await _context.ConferenceRooms
            .Where(r => !r.IsDeleted && r.Capacity >= minCapacity)
            .Where(r => !r.Bookings.Any(b =>
                (b.Status == BookingStatus.Confirmed || (b.Status == BookingStatus.Pending && b.HoldExpiresAtUtc > now)) &&
                b.StartTimeUtc < endTime &&
                b.EndTimeUtc > startTime))
            .Include(r => r.RoomServices)
                .ThenInclude(rs => rs.Service)
            .ToListAsync();

        return availableRooms.Select(MapToDto);
    }

    public async Task<Guid> CreateRoomAsync(CreateRoomDto createDto)
    {
        var room = new ConferenceRoom
        {
            Name = createDto.Name,
            Capacity = createDto.Capacity,
            BaseHourlyRate = createDto.BaseHourlyRate
        };

        if (createDto.ServiceIds != null && createDto.ServiceIds.Any())
        {
            var validServiceIds = await _context.Services
                .Where(s => createDto.ServiceIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            room.RoomServices = validServiceIds.Select(id => new RoomService
            {
                ServiceId = id
            }).ToList();
        }

        _context.ConferenceRooms.Add(room);
        await _context.SaveChangesAsync();

        return room.Id;
    }

    public async Task<bool> UpdateRoomAsync(Guid id, UpdateRoomDto updateDto)
    {
        var room = await _context.ConferenceRooms
            .Include(r => r.RoomServices)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if (room == null)
            return false;

        room.Name = updateDto.Name;
        room.Capacity = updateDto.Capacity;
        room.BaseHourlyRate = updateDto.BaseHourlyRate;

        // Update services
        _context.RoomServices.RemoveRange(room.RoomServices);
        
        if (updateDto.ServiceIds != null && updateDto.ServiceIds.Any())
        {
            var validServiceIds = await _context.Services
                .Where(s => updateDto.ServiceIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            room.RoomServices = validServiceIds.Select(serviceId => new RoomService
            {
                RoomId = room.Id,
                ServiceId = serviceId
            }).ToList();
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoomAsync(Guid id)
    {
        var room = await _context.ConferenceRooms.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        if (room == null)
            return false;

        room.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private static RoomDto MapToDto(ConferenceRoom room)
    {
        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            BaseHourlyRate = room.BaseHourlyRate,
            Services = room.RoomServices.Select(rs => new ServiceDto
            {
                Id = rs.Service.Id,
                Name = rs.Service.Name,
                Price = rs.Service.Price
            }).ToList()
        };
    }
}
