namespace BookingApp.Models;

public class Booking
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public ConferenceRoom Room { get; set; } = null!;

    public DateTime StartTimeUtc { get; set; }
    public DateTime EndTimeUtc { get; set; }
    public DateTime HoldExpiresAtUtc { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public decimal RoomRentalCost { get; set; }
    public decimal ServicesCost { get; set; }
    public decimal TotalCost { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<BookingService> BookedServices { get; set; } = new List<BookingService>();
}
