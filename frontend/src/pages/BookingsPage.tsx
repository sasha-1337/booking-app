import React from 'react'
import { Link } from 'react-router-dom'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { formatPriceUAH } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, RefreshCw, CalendarX, ArrowRight, ShieldCheck, Tag } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function BookingsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings()

  const formatBookingDate = (isoString: string) => {
    try {
      const date = parseISO(isoString)
      return format(date, 'EEEE, MMMM d, yyyy')
    } catch {
      return isoString.split('T')[0] || isoString
    }
  }

  const formatBookingTime = (isoString: string, durationHours: number) => {
    try {
      const start = parseISO(isoString)
      const startTime = format(start, 'HH:mm')
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
      const endTime = format(end, 'HH:mm')
      return `${startTime} – ${endTime} (${durationHours}h)`
    } catch {
      return `${isoString} (${durationHours}h)`
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            My Reservations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            History of all confirmed conference room bookings and invoices.
          </p>
        </div>
        {!isLoading && !isError && bookings && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent text-accent-foreground border border-primary/20">
            {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'}
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-subtle"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-destructive">Failed to Load Reservations</h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Could not fetch your bookings.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && bookings && bookings.length === 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-12 text-center space-y-5 max-w-md mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mx-auto">
            <CalendarX className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">No bookings yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You haven&apos;t reserved any conference halls yet. Check available rooms and book your ideal slot now.
            </p>
          </div>
          <Button asChild size="default" className="shadow-md shadow-primary/20">
            <Link to="/">
              Browse Available Rooms
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Bookings List / Table */}
      {!isLoading && !isError && bookings && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-subtle hover:border-primary/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">
                      {booking.roomName}
                    </h3>
                    <Badge variant="success" className="text-xs font-semibold">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: #{booking.id}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Total Paid
                  </span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatPriceUAH(booking.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Booking schedule & metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Date</span>
                    <span className="font-medium text-foreground">
                      {formatBookingDate(booking.startAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Time & Duration</span>
                    <span className="font-medium text-foreground">
                      {formatBookingTime(booking.startAt, booking.durationHours)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Tag className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">Add-on Services</span>
                    <span className="font-medium text-foreground">
                      {booking.serviceIds && booking.serviceIds.length > 0 ? (
                        <span className="text-xs">
                          {booking.serviceIds.length} {booking.serviceIds.length === 1 ? 'service included' : 'services included'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
