using BookingApp.Data;
using BookingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.Services;

public class ExpiredBookingCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiredBookingCleanupService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(1);

    public ExpiredBookingCleanupService(
        IServiceProvider serviceProvider, 
        ILogger<ExpiredBookingCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ExpiredBookingCleanupService is starting.");

        using var timer = new PeriodicTimer(_period);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
                await CleanupExpiredBookingsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while cleaning up expired bookings.");
            }
        }

        _logger.LogInformation("ExpiredBookingCleanupService is stopping.");
    }

    private async Task CleanupExpiredBookingsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        var updatedCount = await dbContext.Bookings
            .Where(b => b.Status == BookingStatus.Pending && b.HoldExpiresAtUtc <= now)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.Status, BookingStatus.Expired), stoppingToken);

        if (updatedCount > 0)
        {
            _logger.LogInformation("Marked {Count} expired booking(s) as Expired at {Timestamp}", updatedCount, now);
        }
    }
}
