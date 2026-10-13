using BookingApp.DTOs;

namespace BookingApp.Services;

public interface IBookingService
{
    Task<BookingQuoteDto> CalculateQuoteAsync(CalculateQuoteDto dto);
    Task<BookingDetailsDto> CreateBookingAsync(CreateBookingDto dto);
    Task<BookingDetailsDto?> ConfirmBookingAsync(Guid bookingId);
    Task<BookingDetailsDto?> GetBookingByIdAsync(Guid bookingId);
}
