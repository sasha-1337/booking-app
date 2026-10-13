namespace BookingApp.Models;

public class Service
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    // Navigation property
    public ICollection<RoomService> RoomServices { get; set; } = new List<RoomService>();
    public ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();
}
