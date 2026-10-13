import { describe, it, expect } from 'vitest'
import { calculateTotal, calculateDurationHours } from './pricing'
import { Room } from '@/types/domain'

describe('calculateTotal', () => {
  const sampleRoom: Pick<Room, 'basePricePerHour' | 'services'> = {
    basePricePerHour: 2000,
    services: [
      { id: 'srv-proj', name: 'Projector', price: 500 },
      { id: 'srv-wifi', name: 'High-speed Wi-Fi', price: 300 },
      { id: 'srv-sound', name: 'Sound System', price: 700 },
    ],
  }

  it('matches specification example: 2000 x 4h + 500 + 300 = 8800 UAH', () => {
    const total = calculateTotal(sampleRoom, 4, ['srv-proj', 'srv-wifi'])
    expect(total).toBe(8800)
  })

  it('calculates room price correctly with no services selected', () => {
    const total = calculateTotal(sampleRoom, 3, [])
    expect(total).toBe(6000)
  })

  it('calculates correctly with all services selected', () => {
    // 2000 * 2 + 500 + 300 + 700 = 4000 + 1500 = 5500
    const total = calculateTotal(sampleRoom, 2, ['srv-proj', 'srv-wifi', 'srv-sound'])
    expect(total).toBe(5500)
  })

  it('returns 0 when duration is 0 or negative', () => {
    expect(calculateTotal(sampleRoom, 0, ['srv-proj'])).toBe(0)
    expect(calculateTotal(sampleRoom, -2, ['srv-proj'])).toBe(0)
  })

  it('safely ignores non-existent service IDs without error', () => {
    const total = calculateTotal(sampleRoom, 1, ['srv-proj', 'unknown-id'])
    expect(total).toBe(2500)
  })
})

describe('calculateDurationHours', () => {
  it('calculates whole hours correctly', () => {
    expect(calculateDurationHours('09:00', '13:00')).toBe(4)
    expect(calculateDurationHours('10:00', '18:00')).toBe(8)
  })

  it('calculates fractional hours accurately', () => {
    expect(calculateDurationHours('09:00', '10:30')).toBe(1.5)
    expect(calculateDurationHours('14:15', '15:45')).toBe(1.5)
  })

  it('returns 0 if end time is equal to or earlier than start time', () => {
    expect(calculateDurationHours('14:00', '14:00')).toBe(0)
    expect(calculateDurationHours('17:00', '12:00')).toBe(0)
  })

  it('returns 0 for malformed time strings', () => {
    expect(calculateDurationHours('', '12:00')).toBe(0)
    expect(calculateDurationHours('abc', 'def')).toBe(0)
  })
})
