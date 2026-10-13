import { useQuery } from '@tanstack/react-query'
import { getAvailableRooms } from '@/api/rooms'
import { queryKeys } from '@/api/queryKeys'
import { AvailableRoomsParams } from '@/types/domain'

export function useAvailableRooms(params: AvailableRoomsParams) {
  return useQuery({
    queryKey: queryKeys.rooms.available(params),
    queryFn: () => getAvailableRooms(params),
    staleTime: 1000 * 30, // 30 seconds
  })
}
