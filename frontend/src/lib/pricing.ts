import { Room, Service } from '@/types/domain'

/**
 * Calculates the total booking cost.
 * Formula: total = basePricePerHour * durationHours + sum(selected service prices)
 * 
 * @param room Room object containing basePricePerHour and available services
 * @param durationHours Duration of the booking in hours
 * @param selectedServiceIds Array of service IDs chosen by the user
 * @returns Total calculated price in UAH
 */
export function calculateTotal(
  room: Pick<Room, 'basePricePerHour' | 'services'>,
  durationHours: number,
  selectedServiceIds: string[]
): number {
  if (durationHours <= 0) {
    return 0
  }

  const roomCost = room.basePricePerHour * durationHours

  // Map services for O(1) lookups
  const servicePriceMap = new Map<string, number>()
  for (const s of room.services) {
    servicePriceMap.set(s.id, s.price)
  }

  const servicesCost = selectedServiceIds.reduce((sum, id) => {
    const price = servicePriceMap.get(id) ?? 0
    return sum + price
  }, 0)

  return roomCost + servicesCost
}

/**
 * Calculates duration in hours between two "HH:mm" time strings.
 * Returns 0 or negative if to <= from.
 */
export function calculateDurationHours(fromTime: string, toTime: string): number {
  if (!fromTime || !toTime) return 0

  const [fromH, fromM] = fromTime.split(':').map(Number)
  const [toH, toM] = toTime.split(':').map(Number)

  if (
    Number.isNaN(fromH) ||
    Number.isNaN(fromM) ||
    Number.isNaN(toH) ||
    Number.isNaN(toM)
  ) {
    return 0
  }

  const fromMinutes = fromH * 60 + fromM
  const toMinutes = toH * 60 + toM

  const diffMinutes = toMinutes - fromMinutes
  if (diffMinutes <= 0) return 0

  return Number((diffMinutes / 60).toFixed(2))
}

/**
 * Resolves full Service objects for given IDs.
 */
export function getSelectedServices(services: Service[], selectedIds: string[]): Service[] {
  const set = new Set(selectedIds)
  return services.filter((s) => set.has(s.id))
}
