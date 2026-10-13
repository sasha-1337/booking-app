namespace BookingApp.Services;

public class PricingCalculator : IPricingCalculator
{
    private static readonly int[] BreakpointHours = { 6, 9, 12, 14, 18, 23 };

    public decimal CalculateRoomRentalCost(decimal baseHourlyRate, DateTime startTime, DateTime endTime)
    {
        if (startTime >= endTime || baseHourlyRate <= 0)
        {
            return 0m;
        }

        decimal totalCost = 0m;
        DateTime current = startTime;

        while (current < endTime)
        {
            DateTime nextBreakpoint = GetNextBreakpoint(current);
            DateTime segmentEnd = nextBreakpoint < endTime ? nextBreakpoint : endTime;

            decimal multiplier = GetMultiplier(current.Hour);
            decimal segmentHours = (decimal)(segmentEnd - current).TotalHours;

            totalCost += segmentHours * baseHourlyRate * multiplier;
            current = segmentEnd;
        }

        return Math.Round(totalCost, 2, MidpointRounding.AwayFromZero);
    }

    public decimal CalculateServicesCost(IEnumerable<decimal> servicePrices)
    {
        return servicePrices.Sum();
    }

    private static DateTime GetNextBreakpoint(DateTime current)
    {
        DateTime currentDate = current.Date;

        foreach (var hour in BreakpointHours)
        {
            DateTime bp = currentDate.AddHours(hour);
            if (bp > current)
            {
                return bp;
            }
        }

        // If after 23:00, next breakpoint is midnight (start of next day)
        return currentDate.AddDays(1);
    }

    private static decimal GetMultiplier(int hour)
    {
        // 06:00 - 09:00: 10% discount
        if (hour >= 6 && hour < 9)
        {
            return 0.90m;
        }

        // 12:00 - 14:00: 15% markup
        if (hour >= 12 && hour < 14)
        {
            return 1.15m;
        }

        // 18:00 - 23:00: 20% discount
        if (hour >= 18 && hour < 23)
        {
            return 0.80m;
        }

        // Other times: base rate
        return 1.00m;
    }
}
