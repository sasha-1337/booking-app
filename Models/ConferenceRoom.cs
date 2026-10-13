namespace BookingApp.Models;

public class ConferenceRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public decimal BaseHourlyRate { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation property
    public ICollection<RoomService> RoomServices { get; set; } = new List<RoomService>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
