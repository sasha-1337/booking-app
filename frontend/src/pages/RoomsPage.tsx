import React, { useState, useMemo } from 'react'
import { FiltersBar, FilterState } from '@/features/rooms/components/FiltersBar'
import { RoomCard } from '@/features/rooms/components/RoomCard'
import { RoomBookingSheet } from '@/features/rooms/components/RoomBookingSheet'
import { useAvailableRooms } from '@/features/rooms/hooks/useAvailableRooms'
import { Room } from '@/types/domain'
import { calculateDurationHours } from '@/lib/pricing'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Sparkles, Building2 } from 'lucide-react'

// Default date: today
const getTodayString = () => new Date().toISOString().split('T')[0]

export function RoomsPage() {
  const [filters, setFilters] = useState<FilterState>({
    date: getTodayString(),
    from: '09:00',
    to: '13:00',
    capacity: 0,
    sort: 'price-asc',
  })

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const durationHours = calculateDurationHours(filters.from, filters.to)
  const isTimeRangeValid = durationHours > 0

  const {
    data: rooms,
    isLoading,
    isError,
    error,
    refetch,
  } = useAvailableRooms({
    date: filters.date,
    from: filters.from,
    to: filters.to,
    capacity: filters.capacity,
  })

  // Sort rooms client-side based on user sort selection
  const sortedRooms = useMemo(() => {
    if (!rooms) return []
    const list = [...rooms]

    switch (filters.sort) {
      case 'price-asc':
        return list.sort((a, b) => a.basePricePerHour - b.basePricePerHour)
      case 'price-desc':
        return list.sort((a, b) => b.basePricePerHour - a.basePricePerHour)
      case 'capacity-asc':
        return list.sort((a, b) => a.capacity - b.capacity)
      case 'capacity-desc':
        return list.sort((a, b) => b.capacity - a.capacity)
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return list
    }
  }, [rooms, filters.sort])

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsSheetOpen(true)
  }

  const handleResetFilters = () => {
    setFilters({
      date: getTodayString(),
      from: '09:00',
      to: '13:00',
      capacity: 0,
      sort: 'price-asc',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter Bar */}
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        isTimeRangeValid={isTimeRangeValid}
      />

      {/* Header with Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Available Conference Halls
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select a room to review add-on services and reserve your slot.
          </p>
        </div>
        {!isLoading && !isError && rooms && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent text-accent-foreground border border-primary/20">
            {rooms.length} {rooms.length === 1 ? 'room found' : 'rooms found'}
          </span>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-card p-4 space-y-4 shadow-subtle"
            >
              <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-destructive">Failed to Load Available Rooms</h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred while fetching rooms.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Query
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && sortedRooms.length === 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-12 text-center space-y-4 max-w-md mx-auto shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">No rooms available for this time</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All conference rooms are either booked or don&apos;t meet the selected capacity criteria for {filters.date}. Try adjusting your time or capacity filter.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Grid of Room Cards (2 cols desktop, 1 col mobile) */}
      {!isLoading && !isError && sortedRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={handleSelectRoom}
            />
          ))}
        </div>
      )}

      {/* Right Slide-in Booking Panel */}
      <RoomBookingSheet
        room={selectedRoom}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        date={filters.date}
        from={filters.from}
        to={filters.to}
        onBookingSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
