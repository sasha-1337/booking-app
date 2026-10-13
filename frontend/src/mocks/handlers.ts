import { http, HttpResponse } from 'msw'
import { Room, Booking, CreateBookingPayload, CreateRoomPayload, UpdateRoomPayload } from '@/types/domain'
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from './seedData'
import { calculateTotal } from '@/lib/pricing'

const ROOMS_KEY = 'roomreserve_rooms'
const BOOKINGS_KEY = 'roomreserve_bookings'

function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem(ROOMS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load rooms from localStorage', e)
  }
  return [...INITIAL_ROOMS]
}

function saveRooms(rooms: Room[]) {
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  } catch (e) {
    console.warn('Failed to save rooms to localStorage', e)
  }
}

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load bookings from localStorage', e)
  }
  return [...INITIAL_BOOKINGS]
}

function saveBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  } catch (e) {
    console.warn('Failed to save bookings to localStorage', e)
  }
}

export function resetMockStorage() {
  localStorage.removeItem(ROOMS_KEY)
  localStorage.removeItem(BOOKINGS_KEY)
}

/**
 * Checks whether two time intervals on the same day overlap.
 * start1, end1 and start2, end2 are Date objects or timestamps.
 */
function isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1
}

export const handlers = [
  // GET /api/rooms/available?date=YYYY-MM-DD&from=HH:mm&to=HH:mm&capacity=N
  http.get('*/api/rooms/available', ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const capacityParam = url.searchParams.get('capacity')
    const minCapacity = capacityParam ? parseInt(capacityParam, 10) : 0

    const rooms = loadRooms()
    const bookings = loadBookings()

    let queryStart: Date | null = null
    let queryEnd: Date | null = null

    if (date && from && to) {
      queryStart = new Date(`${date}T${from}:00`)
      queryEnd = new Date(`${date}T${to}:00`)
    }

    const availableRooms = rooms.filter((room) => {
      // 1. Capacity filter
      if (minCapacity > 0 && room.capacity < minCapacity) {
        return false
      }

      // 2. Conflict filter if date range is specified
      if (queryStart && queryEnd && !isNaN(queryStart.getTime()) && !isNaN(queryEnd.getTime())) {
        const hasConflict = bookings.some((b) => {
          if (b.roomId !== room.id) return false
          const bStart = new Date(b.startAt)
          const bEnd = new Date(bStart.getTime() + b.durationHours * 60 * 60 * 1000)
          return isOverlapping(queryStart!, queryEnd!, bStart, bEnd)
        })

        if (hasConflict) {
          return false
        }
      }

      return true
    })

    return HttpResponse.json(availableRooms, { status: 200 })
  }),

  // GET /api/rooms (all rooms for admin)
  http.get('*/api/rooms', () => {
    const rooms = loadRooms()
    return HttpResponse.json(rooms, { status: 200 })
  }),

  // POST /api/rooms (create room)
  http.post('*/api/rooms', async ({ request }) => {
    const payload = (await request.json()) as CreateRoomPayload

    if (!payload.name || !payload.capacity || !payload.basePricePerHour) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Validation Error',
          status: 400,
          detail: 'Name, capacity, and base price are required.',
        },
        { status: 400 }
      )
    }

    const newId = `room-${Date.now()}`
    const newRoom: Room = {
      id: newId,
      name: payload.name,
      capacity: Number(payload.capacity),
      basePricePerHour: Number(payload.basePricePerHour),
      photoUrl: payload.photoUrl || 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      services: (payload.services || []).map((s, idx) => ({
        id: ('id' in s && s.id) ? s.id : `srv-${Date.now()}-${idx}`,
        name: s.name,
        price: Number(s.price),
      })),
    }

    const rooms = loadRooms()
    rooms.push(newRoom)
    saveRooms(rooms)

    return HttpResponse.json({ id: newId }, { status: 201 })
  }),

  // PUT /api/rooms/:id (update room)
  http.put('*/api/rooms/:id', async ({ params, request }) => {
    const { id } = params
    const payload = (await request.json()) as UpdateRoomPayload
    const rooms = loadRooms()
    const index = rooms.findIndex((r) => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Room with ID ${id} was not found.`,
        },
        { status: 404 }
      )
    }

    const current = rooms[index]
    const updated: Room = {
      ...current,
      name: payload.name ?? current.name,
      capacity: payload.capacity ? Number(payload.capacity) : current.capacity,
      basePricePerHour: payload.basePricePerHour ? Number(payload.basePricePerHour) : current.basePricePerHour,
      photoUrl: payload.photoUrl ?? current.photoUrl,
      services: payload.services
        ? payload.services.map((s, idx) => ({
            id: ('id' in s && s.id) ? s.id : `srv-${Date.now()}-${idx}`,
            name: s.name,
            price: Number(s.price),
          }))
        : current.services,
    }

    rooms[index] = updated
    saveRooms(rooms)

    return HttpResponse.json(updated, { status: 200 })
  }),

  // DELETE /api/rooms/:id
  http.delete('*/api/rooms/:id', ({ params }) => {
    const { id } = params
    const rooms = loadRooms()
    const index = rooms.findIndex((r) => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Room with ID ${id} was not found.`,
        },
        { status: 404 }
      )
    }

    rooms.splice(index, 1)
    saveRooms(rooms)

    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/bookings
  http.get('*/api/bookings', () => {
    const bookings = loadBookings()
    // Sort latest bookings first
    bookings.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    return HttpResponse.json(bookings, { status: 200 })
  }),

  // POST /api/bookings
  http.post('*/api/bookings', async ({ request }) => {
    const body = (await request.json()) as CreateBookingPayload
    const { roomId, startAt, durationHours, serviceIds } = body

    const rooms = loadRooms()
    const room = rooms.find((r) => r.id === roomId)

    if (!room) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Room with ID ${roomId} was not found.`,
        },
        { status: 404 }
      )
    }

    const bookings = loadBookings()
    const newStart = new Date(startAt)
    const newEnd = new Date(newStart.getTime() + durationHours * 60 * 60 * 1000)

    // Check for conflict
    const hasConflict = bookings.some((b) => {
      if (b.roomId !== roomId) return false
      const bStart = new Date(b.startAt)
      const bEnd = new Date(bStart.getTime() + b.durationHours * 60 * 60 * 1000)
      return isOverlapping(newStart, newEnd, bStart, bEnd)
    })

    if (hasConflict) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
          title: 'Conflict',
          status: 409,
          detail: `The room "${room.name}" is already booked for the selected time slot.`,
        },
        { status: 409 }
      )
    }

    // Backend calculates official total price
    const totalPrice = calculateTotal(room, durationHours, serviceIds || [])
    const newBookingId = `bkg-${Date.now()}`

    const newBooking: Booking = {
      id: newBookingId,
      roomId: room.id,
      roomName: room.name,
      startAt: startAt,
      durationHours: durationHours,
      serviceIds: serviceIds || [],
      totalPrice: totalPrice,
    }

    bookings.unshift(newBooking)
    saveBookings(bookings)

    return HttpResponse.json(
      {
        bookingId: newBookingId,
        totalPrice: totalPrice,
      },
      { status: 201 }
    )
  }),
]
