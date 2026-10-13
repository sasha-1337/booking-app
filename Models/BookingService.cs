namespace BookingApp.Models;

public class BookingService
{
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    public decimal PriceAtBooking { get; set; }
}
