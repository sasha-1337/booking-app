namespace BookingApp.Models;

public class RoomService
{
    public Guid RoomId { get; set; }
    public ConferenceRoom Room { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}
