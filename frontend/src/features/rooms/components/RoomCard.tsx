import React, { useState } from 'react'
import { Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { Room } from '@/types/domain'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPriceUAH } from '@/lib/utils'

interface RoomCardProps {
  room: Room
  onSelect: (room: Room) => void
}

export function RoomCard({ room, onSelect }: RoomCardProps) {
  const [imageError, setImageError] = useState(false)

  const fallbackPhoto = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
  const displayPhoto = (!imageError && room.photoUrl) ? room.photoUrl : fallbackPhoto

  return (
    <Card
      onClick={() => onSelect(room)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
      tabIndex={0}
      role="button"
      aria-label={`Select ${room.name} with capacity of ${room.capacity} people`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(room)
        }
      }}
    >
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={displayPhoto}
            alt={room.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Badges on top of image */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-white/10 font-semibold shadow-sm">
              <Users className="w-3.5 h-3.5 mr-1 text-primary" />
              Up to {room.capacity} guests
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="bg-card/90 backdrop-blur-md border border-border/60 px-3 py-1.5 rounded-xl shadow-lg flex items-baseline gap-1">
              <span className="text-base font-extrabold text-foreground tracking-tight">
                {formatPriceUAH(room.basePricePerHour)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">/ hour</span>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
              {room.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Fully equipped & soundproofed
            </p>
          </div>

          {/* Services Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
              Available Add-ons
            </span>
            <div className="flex flex-wrap gap-1.5">
              {room.services && room.services.length > 0 ? (
                room.services.map((service) => (
                  <span
                    key={service.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-accent/70 text-accent-foreground border border-primary/10"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                    {service.name} (+{formatPriceUAH(service.price)})
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No extra services</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Action Bar */}
      <div className="p-5 sm:p-6 pt-0 mt-2 flex items-center justify-between border-t border-border/50 pt-4">
        <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
          Reserve this hall
        </span>
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Card>
  )
}
