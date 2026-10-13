import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RoomBookingSheet } from './RoomBookingSheet'
import { Room } from '@/types/domain'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockMutate = vi.fn()
vi.mock('@/features/bookings/hooks/useCreateBooking', () => ({
  useCreateBooking: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}))

describe('RoomBookingSheet Component', () => {
  const queryClient = new QueryClient()

  beforeEach(() => {
    mockMutate.mockClear()
  })

  const mockRoom: Room = {
    id: 'room-1',
    name: 'Hall A (Innovation Suite)',
    capacity: 50,
    basePricePerHour: 2000,
    services: [
      { id: 'srv-1', name: 'Projector (4K Laser)', price: 500 },
      { id: 'srv-2', name: 'High-Speed Wi-Fi', price: 300 },
    ],
  }

  const renderSheet = (open = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RoomBookingSheet
          room={mockRoom}
          open={open}
          onOpenChange={vi.fn()}
          date="2026-09-24"
          from="09:00"
          to="13:00"
        />
      </QueryClientProvider>
    )
  }

  it('renders room details and initial live base price (2000 x 4h = 8000 UAH)', () => {
    renderSheet(true)

    expect(screen.getByText('Hall A (Innovation Suite)')).toBeInTheDocument()
    expect(screen.getAllByText(/4h/).length).toBeGreaterThan(0)

    // Base room rental: 2000 x 4 = 8000 UAH
    expect(screen.getAllByText(/8\s*000/).length).toBeGreaterThan(0)
  })

  it('updates live total when service rows are toggled', () => {
    renderSheet(true)

    const projectorRow = screen.getByText('Projector (4K Laser)')
    fireEvent.click(projectorRow)

    // 8000 + 500 = 8500
    expect(screen.getAllByText(/8\s*500/).length).toBeGreaterThan(0)

    const wifiRow = screen.getByText('High-Speed Wi-Fi')
    fireEvent.click(wifiRow)

    // 8500 + 300 = 8800
    expect(screen.getAllByText(/8\s*800/).length).toBeGreaterThan(0)
  })

  it('triggers createBooking mutation with correct payload on form submit', () => {
    renderSheet(true)

    const projectorRow = screen.getByText('Projector (4K Laser)')
    fireEvent.click(projectorRow)

    const bookButton = screen.getByRole('button', { name: /Book Room/i })
    fireEvent.click(bookButton)

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: 'room-1',
        startAt: '2026-09-24T09:00:00',
        durationHours: 4,
        serviceIds: ['srv-1'],
      }),
      expect.any(Object)
    )
  })
})
