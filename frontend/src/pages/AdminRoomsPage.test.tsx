import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdminRoomsPage } from './AdminRoomsPage'
import { Room } from '@/types/domain'

const mockRoomsData: Room[] = [
  {
    id: 'room-1',
    name: 'Hall A (Innovation Suite)',
    capacity: 50,
    basePricePerHour: 2000,
    services: [
      { id: 'srv-1', name: 'Projector', price: 500 },
    ],
  },
]

vi.mock('@/features/rooms/hooks/useRooms', () => ({
  useRooms: () => ({
    data: mockRoomsData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/admin/hooks/useAdminRoomMutations', () => ({
  useAdminRoomMutations: () => ({
    createMutation: { mutate: vi.fn(), isPending: false },
    updateMutation: { mutate: vi.fn(), isPending: false },
    deleteMutation: { mutate: vi.fn(), isPending: false },
  }),
}))

describe('AdminRoomsPage Component', () => {
  it('renders room management table with rooms and actions', () => {
    render(<AdminRoomsPage />)

    expect(screen.getByText('Conference Room Management')).toBeInTheDocument()
    expect(screen.getByText('Hall A (Innovation Suite)')).toBeInTheDocument()
    expect(screen.getByText(/50 people/i)).toBeInTheDocument()
    expect(screen.getByText(/2\s*000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Room/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit Hall A/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete Hall A/i })).toBeInTheDocument()
  })
})
