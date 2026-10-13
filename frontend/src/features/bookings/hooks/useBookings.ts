import { useQuery } from '@tanstack/react-query'
import { getBookings } from '@/api/bookings'
import { queryKeys } from '@/api/queryKeys'

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: getBookings,
    staleTime: 1000 * 30,
  })
}
