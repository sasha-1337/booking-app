import React from 'react'
import { Calendar, Clock, Users, ArrowUpDown, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'capacity-asc'
  | 'capacity-desc'
  | 'name-asc'

export interface FilterState {
  date: string
  from: string
  to: string
  capacity: number
  sort: SortOption
}

interface FiltersBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  isTimeRangeValid: boolean
}

export function FiltersBar({ filters, onChange, isTimeRangeValid }: FiltersBarProps) {
  const handleFieldChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="bg-card/90 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-subtle backdrop-blur-md transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Date input */}
        <div className="space-y-1.5">
          <Label htmlFor="filter-date" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Date
          </Label>
          <Input
            id="filter-date"
            type="date"
            value={filters.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className="h-10 text-sm font-medium"
          />
        </div>

        {/* Start Time */}
        <div className="space-y-1.5">
          <Label htmlFor="filter-from" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            From Time
          </Label>
          <Input
            id="filter-from"
            type="time"
            value={filters.from}
            onChange={(e) => handleFieldChange('from', e.target.value)}
            className="h-10 text-sm font-medium"
          />
        </div>

        {/* End Time */}
        <div className="space-y-1.5">
          <Label htmlFor="filter-to" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            To Time
          </Label>
          <Input
            id="filter-to"
            type="time"
            value={filters.to}
            onChange={(e) => handleFieldChange('to', e.target.value)}
            className={`h-10 text-sm font-medium ${!isTimeRangeValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>

        {/* Minimum Capacity */}
        <div className="space-y-1.5">
          <Label htmlFor="filter-capacity" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            Min Capacity
          </Label>
          <Input
            id="filter-capacity"
            type="number"
            min="0"
            placeholder="Any capacity"
            value={filters.capacity > 0 ? filters.capacity : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              handleFieldChange('capacity', isNaN(val) ? 0 : Math.max(0, val))
            }}
            className="h-10 text-sm font-medium"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
            Sort By
          </Label>
          <Select
            value={filters.sort}
            onValueChange={(val: SortOption) => handleFieldChange('sort', val)}
          >
            <SelectTrigger className="h-10 text-sm font-medium">
              <SelectValue placeholder="Sort rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="capacity-desc">Capacity: High to Low</SelectItem>
              <SelectItem value="capacity-asc">Capacity: Low to High</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation alert if end <= start */}
      {!isTimeRangeValid && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>The end time must be later than the start time.</span>
        </div>
      )}
    </div>
  )
}
