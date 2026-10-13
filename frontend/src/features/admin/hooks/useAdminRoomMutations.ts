import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRoom, updateRoom, deleteRoom } from '@/api/rooms'
import { CreateRoomPayload, UpdateRoomPayload, Room } from '@/types/domain'
import { ApiError } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'

export function useAdminRoomMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation<{ id: string }, ApiError, CreateRoomPayload>({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })

  const updateMutation = useMutation<Room, ApiError, { id: string; payload: UpdateRoomPayload }>({
    mutationFn: ({ id, payload }) => updateRoom(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
