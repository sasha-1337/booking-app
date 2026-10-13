import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Room } from '@/types/domain'
import { calculateTotal, calculateDurationHours } from '@/lib/pricing'
import { formatPriceUAH } from '@/lib/utils'
import { useCreateBooking } from '@/features/bookings/hooks/useCreateBooking'
import { toast } from 'sonner'
import { Users, Clock, Calendar, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { ApiError } from '@/api/client'

interface RoomBookingSheetProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  from: string
  to: string
  onBookingSuccess?: () => void
}

export function RoomBookingSheet({
  room,
  open,
  onOpenChange,
  date,
  from,
  to,
  onBookingSuccess,
}: RoomBookingSheetProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [conflictError, setConflictError] = useState<string | null>(null)

  const { mutate: createBooking, isPending } = useCreateBooking()

  // Reset selected services and errors when room changes or modal opens
  useEffect(() => {
    if (open) {
      setSelectedServiceIds([])
      setConflictError(null)
    }
  }, [open, room])

  if (!room) return null

  const durationHours = calculateDurationHours(from, to)
  const isTimeValid = durationHours > 0

  // Live price calculation for instant feedback
  const liveTotal = calculateTotal(room, durationHours, selectedServiceIds)
  const baseRoomTotal = room.basePricePerHour * durationHours

  const handleToggleService = (serviceId: string) => {
    setConflictError(null)
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isTimeValid) return
    setConflictError(null)

    // ISO start timestamp
    const startAt = `${date}T${from}:00`

    createBooking(
      {
        roomId: room.id,
        startAt,
        durationHours,
        serviceIds: selectedServiceIds,
      },
      {
        onSuccess: (data) => {
          // Requirement: "After a successful booking: toast with the total from the server, close the panel, invalidate queries."
          toast.success(
            `Booking confirmed for ${room.name}! Total: ${formatPriceUAH(data.totalPrice)}`,
            {
              description: `Reservation ID: #${data.bookingId}`,
              duration: 5000,
            }
          )
          onOpenChange(false)
          onBookingSuccess?.()
        },
        onError: (err: ApiError) => {
          // Requirement: "Handle 409 (conflict) with an inline error in the panel."
          if (err.status === 409) {
            setConflictError(
              err.detail || 'This conference room is already booked for the selected time slot.'
            )
          } else {
            toast.error(err.title || 'Booking failed', {
              description: err.detail || 'Please check your inputs and try again.',
            })
          }
        },
      }
    )
  }

  const fallbackPhoto = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col h-full overflow-hidden"
        aria-describedby="booking-sheet-description"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto">
            {/* Header Image */}
            <div className="relative aspect-[16/9] w-full bg-muted">
              <img
                src={room.photoUrl || fallbackPhoto}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <Badge className="bg-primary/90 text-primary-foreground font-semibold mb-2">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Capacity: {room.capacity} people
                </Badge>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                  {room.name}
                </h2>
              </div>
            </div>

            <SheetHeader className="px-6 pt-4 pb-2">
              <SheetTitle className="sr-only">{room.name} Booking</SheetTitle>
              <SheetDescription id="booking-sheet-description" className="text-xs text-muted-foreground">
                Configure additional equipment and confirm your conference room reservation.
              </SheetDescription>
            </SheetHeader>

            <div className="p-6 space-y-6">
              {/* Selected Slot Information */}
              <div className="rounded-xl border border-border/70 bg-accent/30 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Booking Schedule</span>
                  <Badge variant="outline" className="text-xs bg-background/80">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" />
                    Instant Confirmation
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>{from} – {to} ({durationHours}h)</span>
                  </div>
                </div>
                {!isTimeValid && (
                  <p className="text-xs text-destructive font-medium">
                    Invalid time range: End time must be later than start time.
                  </p>
                )}
              </div>

              {/* 409 Conflict Inline Error */}
              {conflictError && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive space-y-1 animate-scale-in"
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Booking Conflict (409)</span>
                  </div>
                  <p className="text-xs text-destructive/90 pl-6 leading-relaxed">
                    {conflictError}
                  </p>
                </div>
              )}

              {/* Services Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Extra Services & Equipment
                  </label>
                  <span className="text-xs text-muted-foreground">Flat pricing</span>
                </div>

                {room.services && room.services.length > 0 ? (
                  <div className="space-y-2">
                    {room.services.map((service) => {
                      const isChecked = selectedServiceIds.includes(service.id)
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleToggleService(service.id)}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault()
                              handleToggleService(service.id)
                            }
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/80 hover:border-border hover:bg-accent/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={isChecked}
                              tabIndex={-1}
                              className="pointer-events-none"
                              aria-hidden="true"
                            />
                            <span className="text-sm font-medium text-foreground select-none">
                              {service.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            +{formatPriceUAH(service.price)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No optional services available for this room.
                  </p>
                )}
              </div>

              {/* Live Cost Breakdown */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Cost Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  {/* Room Base × Hours */}
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      Room rental ({formatPriceUAH(room.basePricePerHour)} × {durationHours}h)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPriceUAH(baseRoomTotal)}
                    </span>
                  </div>

                  {/* Selected Services Breakdown */}
                  {selectedServiceIds.map((id) => {
                    const s = room.services.find((item) => item.id === id)
                    if (!s) return null
                    return (
                      <div key={id} className="flex justify-between text-muted-foreground">
                        <span>{s.name}</span>
                        <span className="font-medium text-foreground">
                          {formatPriceUAH(s.price)}
                        </span>
                      </div>
                    )
                  })}

                  <div className="border-t border-border pt-2 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-extrabold text-foreground">Total Estimated</span>
                      <p className="text-[11px] text-muted-foreground">Final price confirmed upon booking</p>
                    </div>
                    <span className="text-xl font-extrabold text-primary">
                      {formatPriceUAH(liveTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sheet Footer Action Button */}
          <SheetFooter>
            <Button
              type="submit"
              size="lg"
              disabled={!isTimeValid || isPending}
              loading={isPending}
              className="w-full text-base font-bold shadow-lg shadow-primary/25"
            >
              <CheckCircle2 className="w-5 h-5 mr-1" />
              {isPending ? 'Processing Reservation...' : `Book Room • ${formatPriceUAH(liveTotal)}`}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
