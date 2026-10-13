import { apiClient } from './client'
import { Room, AvailableRoomsParams, CreateRoomPayload, UpdateRoomPayload } from '@/types/domain'

export async function getAvailableRooms(params: AvailableRoomsParams): Promise<Room[]> {
  const query = new URLSearchParams()
  if (params.date) query.set('date', params.date)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.capacity !== undefined && params.capacity > 0) {
    query.set('capacity', params.capacity.toString())
  }

  return apiClient.get<Room[]>(`rooms/available?${query.toString()}`)
}

export async function getAllRooms(): Promise<Room[]> {
  return apiClient.get<Room[]>('rooms')
}

export async function createRoom(payload: CreateRoomPayload): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>('rooms', payload)
}

export async function updateRoom(id: string, payload: UpdateRoomPayload): Promise<Room> {
  return apiClient.put<Room>(`rooms/${id}`, payload)
}

export async function deleteRoom(id: string): Promise<void> {
  return apiClient.delete<void>(`rooms/${id}`)
}
