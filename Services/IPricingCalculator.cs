namespace BookingApp.Services;

public interface IPricingCalculator
{
    decimal CalculateRoomRentalCost(decimal baseHourlyRate, DateTime startTime, DateTime endTime);
    decimal CalculateServicesCost(IEnumerable<decimal> servicePrices);
}
