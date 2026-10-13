using System.ComponentModel.DataAnnotations;
using BookingApp.Models;

namespace BookingApp.DTOs;

public class CreateBookingDto
{
    [Required]
    public Guid RoomId { get; set; }

    [Required]
    public DateTime StartTimeUtc { get; set; }

    [Required]
    public DateTime EndTimeUtc { get; set; }

    public List<Guid> ServiceIds { get; set; } = new();
}

public class CalculateQuoteDto
{
    [Required]
    public Guid RoomId { get; set; }

    [Required]
    public DateTime StartTimeUtc { get; set; }

    [Required]
    public DateTime EndTimeUtc { get; set; }

    public List<Guid> ServiceIds { get; set; } = new();
}

public class BookingQuoteDto
{
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public DateTime StartTimeUtc { get; set; }
    public DateTime EndTimeUtc { get; set; }
    public decimal RoomRentalCost { get; set; }
    public decimal ServicesCost { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime? HoldExpiresAtUtc { get; set; }
    public List<ServiceDto> Services { get; set; } = new();
}

public class BookingDetailsDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public DateTime StartTimeUtc { get; set; }
    public DateTime EndTimeUtc { get; set; }
    public DateTime HoldExpiresAtUtc { get; set; }
    public BookingStatus Status { get; set; }
    public decimal RoomRentalCost { get; set; }
    public decimal ServicesCost { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public List<BookedServiceDto> Services { get; set; } = new();
}

public class BookedServiceDto
{
    public Guid ServiceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceAtBooking { get; set; }
}
