import { AvailableRoomsParams } from '@/types/domain'

export const queryKeys = {
  rooms: {
    all: ['rooms'] as const,
    available: (params: AvailableRoomsParams) => ['rooms', 'available', params] as const,
  },
  bookings: {
    all: ['bookings'] as const,
  },
}
