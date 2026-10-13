import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBooking } from '@/api/bookings'
import { CreateBookingPayload, CreateBookingResponse } from '@/types/domain'
import { ApiError } from '@/api/client'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation<CreateBookingResponse, ApiError, CreateBookingPayload>({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate both available rooms and bookings lists
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
