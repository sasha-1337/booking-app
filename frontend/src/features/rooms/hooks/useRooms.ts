import { useQuery } from '@tanstack/react-query'
import { getAllRooms } from '@/api/rooms'
import { queryKeys } from '@/api/queryKeys'

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: getAllRooms,
    staleTime: 1000 * 60,
  })
}
