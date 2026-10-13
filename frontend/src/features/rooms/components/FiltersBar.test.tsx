import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FiltersBar, FilterState } from './FiltersBar'

describe('FiltersBar Component', () => {
  const mockFilters: FilterState = {
    date: '2026-09-24',
    from: '09:00',
    to: '13:00',
    capacity: 20,
    sort: 'price-asc',
  }

  it('renders date, time, and capacity filter inputs with correct initial values', () => {
    const onChange = vi.fn()
    render(
      <FiltersBar
        filters={mockFilters}
        onChange={onChange}
        isTimeRangeValid={true}
      />
    )

    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.value).toBe('2026-09-24')

    const fromInput = screen.getByLabelText(/from time/i) as HTMLInputElement
    expect(fromInput.value).toBe('09:00')

    const toInput = screen.getByLabelText(/to time/i) as HTMLInputElement
    expect(toInput.value).toBe('13:00')

    const capacityInput = screen.getByLabelText(/min capacity/i) as HTMLInputElement
    expect(capacityInput.value).toBe('20')
  })

  it('calls onChange when user updates input fields', () => {
    const onChange = vi.fn()
    render(
      <FiltersBar
        filters={mockFilters}
        onChange={onChange}
        isTimeRangeValid={true}
      />
    )

    const capacityInput = screen.getByLabelText(/min capacity/i)
    fireEvent.change(capacityInput, { target: { value: '50' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 50,
      })
    )
  })

  it('displays validation alert when time range is invalid (end <= start)', () => {
    const onChange = vi.fn()
    render(
      <FiltersBar
        filters={mockFilters}
        onChange={onChange}
        isTimeRangeValid={false}
      />
    )

    expect(
      screen.getByText(/end time must be later than the start time/i)
    ).toBeInTheDocument()
  })
})
