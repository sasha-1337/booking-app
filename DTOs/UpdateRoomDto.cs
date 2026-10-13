using System.ComponentModel.DataAnnotations;

namespace BookingApp.DTOs;

public class UpdateRoomDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 1000)]
    public int Capacity { get; set; }

    [Range(0, 100000)]
    public decimal BaseHourlyRate { get; set; }

    public List<Guid> ServiceIds { get; set; } = new();
}
