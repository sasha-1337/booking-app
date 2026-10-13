import { Room, Booking, Service } from '@/types/domain'

export const DEFAULT_SERVICES: Service[] = [
  { id: 'srv-1', name: 'Projector (4K Laser)', price: 500 },
  { id: 'srv-2', name: 'High-Speed Wi-Fi (1 Gbps)', price: 300 },
  { id: 'srv-3', name: 'Sound System & Microphones', price: 700 },
]

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Hall A (Innovation Suite)',
    capacity: 50,
    basePricePerHour: 2000,
    photoUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
    services: [
      { id: 'srv-1', name: 'Projector (4K Laser)', price: 500 },
      { id: 'srv-2', name: 'High-Speed Wi-Fi (1 Gbps)', price: 300 },
      { id: 'srv-3', name: 'Sound System & Microphones', price: 700 },
    ],
  },
  {
    id: 'room-2',
    name: 'Hall B (Executive Grand Hall)',
    capacity: 100,
    basePricePerHour: 3500,
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    services: [
      { id: 'srv-1', name: 'Projector (4K Laser)', price: 500 },
      { id: 'srv-2', name: 'High-Speed Wi-Fi (1 Gbps)', price: 300 },
      { id: 'srv-3', name: 'Sound System & Microphones', price: 700 },
    ],
  },
  {
    id: 'room-3',
    name: 'Hall C (Creative Workshop)',
    capacity: 30,
    basePricePerHour: 1500,
    photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    services: [
      { id: 'srv-1', name: 'Projector (4K Laser)', price: 500 },
      { id: 'srv-2', name: 'High-Speed Wi-Fi (1 Gbps)', price: 300 },
    ],
  },
]

// Current date formatted as YYYY-MM-DD for dynamic initial bookings
const today = new Date().toISOString().split('T')[0]

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-101',
    roomId: 'room-1',
    roomName: 'Hall A (Innovation Suite)',
    startAt: `${today}T14:00:00`,
    durationHours: 3,
    serviceIds: ['srv-1', 'srv-2'],
    totalPrice: 6800, // 2000*3 + 500 + 300
  },
  {
    id: 'bkg-102',
    roomId: 'room-2',
    roomName: 'Hall B (Executive Grand Hall)',
    startAt: `${today}T09:00:00`,
    durationHours: 4,
    serviceIds: ['srv-1', 'srv-2', 'srv-3'],
    totalPrice: 15500, // 3500*4 + 500 + 300 + 700
  },
]
