using BookingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ConferenceRoom> ConferenceRooms { get; set; } = null!;
    public DbSet<Service> Services { get; set; } = null!;
    public DbSet<RoomService> RoomServices { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<BookingService> BookingServices { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Many-to-Many for RoomService
        modelBuilder.Entity<RoomService>()
            .HasKey(rs => new { rs.RoomId, rs.ServiceId });

        modelBuilder.Entity<RoomService>()
            .HasOne(rs => rs.Room)
            .WithMany(r => r.RoomServices)
            .HasForeignKey(rs => rs.RoomId);

        modelBuilder.Entity<RoomService>()
            .HasOne(rs => rs.Service)
            .WithMany(s => s.RoomServices)
            .HasForeignKey(rs => rs.ServiceId);

        // Configure Booking
        modelBuilder.Entity<Booking>()
            .Property(b => b.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Booking>()
            .Property(b => b.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId);

        // Configure Many-to-Many for BookingService
        modelBuilder.Entity<BookingService>()
            .HasKey(bs => new { bs.BookingId, bs.ServiceId });

        modelBuilder.Entity<BookingService>()
            .HasOne(bs => bs.Booking)
            .WithMany(b => b.BookedServices)
            .HasForeignKey(bs => bs.BookingId);

        modelBuilder.Entity<BookingService>()
            .HasOne(bs => bs.Service)
            .WithMany(s => s.BookingServices)
            .HasForeignKey(bs => bs.ServiceId);

        // Configure Guid defaults
        modelBuilder.Entity<ConferenceRoom>()
            .Property(r => r.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Service>()
            .Property(s => s.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        // Data Seeding
        var projectorId = Guid.NewGuid();
        var wifiId = Guid.NewGuid();
        var soundId = Guid.NewGuid();

        modelBuilder.Entity<Service>().HasData(
            new Service { Id = projectorId, Name = "Проєктор", Price = 500 },
            new Service { Id = wifiId, Name = "Wi-Fi", Price = 300 },
            new Service { Id = soundId, Name = "Звук", Price = 700 }
        );

        var roomAId = Guid.NewGuid();
        var roomBId = Guid.NewGuid();
        var roomCId = Guid.NewGuid();

        modelBuilder.Entity<ConferenceRoom>().HasData(
            new ConferenceRoom { Id = roomAId, Name = "Зал А", Capacity = 50, BaseHourlyRate = 2000, IsDeleted = false },
            new ConferenceRoom { Id = roomBId, Name = "Зал Б", Capacity = 100, BaseHourlyRate = 3500, IsDeleted = false },
            new ConferenceRoom { Id = roomCId, Name = "Зал В", Capacity = 30, BaseHourlyRate = 1500, IsDeleted = false }
        );
        
        // Seed RoomServices (Optional: let's assign Wi-Fi to all, Projector to A and B, Sound to B and C)
        // Wait, the prompt didn't specify which services belong to which seeded room, only to seed them.
        // It's probably better to just leave them unassigned or assign some defaults. Let's just create them.
    }
}
