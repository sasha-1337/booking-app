import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RoomCard } from './RoomCard'
import { Room } from '@/types/domain'

describe('RoomCard Component', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Hall A (Innovation Suite)',
    capacity: 50,
    basePricePerHour: 2000,
    services: [
      { id: 'srv-1', name: 'Projector', price: 500 },
      { id: 'srv-2', name: 'Wi-Fi', price: 300 },
    ],
  }

  it('renders room details including name, capacity, and hourly rate', () => {
    const onSelect = vi.fn()
    render(<RoomCard room={mockRoom} onSelect={onSelect} />)

    expect(screen.getByText('Hall A (Innovation Suite)')).toBeInTheDocument()
    expect(screen.getByText(/up to 50 guests/i)).toBeInTheDocument()
    expect(screen.getByText(/2\s*000/)).toBeInTheDocument()
    expect(screen.getByText(/Projector/)).toBeInTheDocument()
    expect(screen.getByText(/Wi-Fi/)).toBeInTheDocument()
  })

  it('calls onSelect with room object when clicked or enter key pressed', () => {
    const onSelect = vi.fn()
    render(<RoomCard room={mockRoom} onSelect={onSelect} />)

    const card = screen.getByRole('button', { name: /select Hall A/i })
    fireEvent.click(card)

    expect(onSelect).toHaveBeenCalledWith(mockRoom)

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledTimes(2)
  })
})
