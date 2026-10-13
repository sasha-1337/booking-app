namespace BookingApp.DTOs;

public class RoomDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public decimal BaseHourlyRate { get; set; }
    public List<ServiceDto> Services { get; set; } = new();
}
