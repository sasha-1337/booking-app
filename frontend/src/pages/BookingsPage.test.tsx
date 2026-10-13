import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BookingsPage } from './BookingsPage'
import { MemoryRouter } from 'react-router-dom'
import { Booking } from '@/types/domain'

let mockBookingsData: Booking[] | null = null
let mockIsLoading = false
let mockIsError = false

vi.mock('@/features/bookings/hooks/useBookings', () => ({
  useBookings: () => ({
    data: mockBookingsData,
    isLoading: mockIsLoading,
    isError: mockIsError,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('BookingsPage Component', () => {
  it('renders reservations list when bookings exist', () => {
    mockBookingsData = [
      {
        id: 'bkg-1',
        roomId: 'room-1',
        roomName: 'Hall A (Innovation Suite)',
        startAt: '2026-09-24T10:00:00',
        durationHours: 3,
        serviceIds: ['srv-1'],
        totalPrice: 6500,
      },
    ]
    mockIsLoading = false
    mockIsError = false

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Hall A (Innovation Suite)')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText(/6\s*500/)).toBeInTheDocument()
    expect(screen.getByText(/#bkg-1/)).toBeInTheDocument()
  })

  it('renders empty state when there are no bookings', () => {
    mockBookingsData = []
    mockIsLoading = false
    mockIsError = false

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/no bookings yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse available rooms/i })).toBeInTheDocument()
  })
})
