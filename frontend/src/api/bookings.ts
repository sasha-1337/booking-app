import { apiClient } from './client'
import { Booking, CreateBookingPayload, CreateBookingResponse } from '@/types/domain'

export async function getBookings(): Promise<Booking[]> {
  return apiClient.get<Booking[]>('bookings')
}

export async function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  return apiClient.post<CreateBookingResponse>('bookings', payload)
}
