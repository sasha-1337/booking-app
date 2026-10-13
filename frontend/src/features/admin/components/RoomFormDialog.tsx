import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Room } from '@/types/domain'
import { Plus, Trash2, Sparkles, Building2 } from 'lucide-react'

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Service name is required'),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
})

const roomFormSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacity is required' })
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be greater than 0'),
  basePricePerHour: z.coerce
    .number({ invalid_type_error: 'Price is required' })
    .min(1, 'Price per hour must be greater than 0'),
  photoUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  services: z.array(serviceSchema),
})

export type RoomFormData = z.infer<typeof roomFormSchema>

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null // If present, Edit mode; otherwise, Create mode
  onSubmit: (data: RoomFormData) => void
  isSubmitting: boolean
}

export function RoomFormDialog({
  open,
  onOpenChange,
  room,
  onSubmit,
  isSubmitting,
}: RoomFormDialogProps) {
  const isEdit = Boolean(room)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: '',
      capacity: 50,
      basePricePerHour: 2000,
      photoUrl: '',
      services: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  // Prefill or reset values on dialog open
  useEffect(() => {
    if (open) {
      if (room) {
        reset({
          name: room.name,
          capacity: room.capacity,
          basePricePerHour: room.basePricePerHour,
          photoUrl: room.photoUrl || '',
          services: room.services.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
          })),
        })
      } else {
        reset({
          name: '',
          capacity: 50,
          basePricePerHour: 2000,
          photoUrl: '',
          services: [
            { name: 'Projector', price: 500 },
            { name: 'Wi-Fi', price: 300 },
          ],
        })
      }
    }
  }, [open, room, reset])

  const handleFormSubmit = (data: RoomFormData) => {
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {isEdit ? 'Edit Conference Room' : 'Add New Conference Room'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the room specifications, hourly price, and extra equipment.'
              : 'Create a new conference room available for booking.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 py-2">
          {/* Room Name */}
          <div className="space-y-1.5">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="e.g. Hall D (Boardroom)"
              {...register('name')}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Capacity */}
            <div className="space-y-1.5">
              <Label htmlFor="room-capacity">Capacity (guests)</Label>
              <Input
                id="room-capacity"
                type="number"
                min="1"
                placeholder="50"
                {...register('capacity')}
                className={errors.capacity ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive font-medium">{errors.capacity.message}</p>
              )}
            </div>

            {/* Base Price Per Hour */}
            <div className="space-y-1.5">
              <Label htmlFor="room-price">Base Price / Hour (UAH)</Label>
              <Input
                id="room-price"
                type="number"
                min="1"
                placeholder="2000"
                {...register('basePricePerHour')}
                className={errors.basePricePerHour ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.basePricePerHour && (
                <p className="text-xs text-destructive font-medium">{errors.basePricePerHour.message}</p>
              )}
            </div>
          </div>

          {/* Photo URL */}
          <div className="space-y-1.5">
            <Label htmlFor="room-photo">Photo URL (optional)</Label>
            <Input
              id="room-photo"
              placeholder="https://images.unsplash.com/..."
              {...register('photoUrl')}
              className={errors.photoUrl ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.photoUrl && (
              <p className="text-xs text-destructive font-medium">{errors.photoUrl.message}</p>
            )}
          </div>

          {/* Dynamic Services List */}
          <div className="space-y-3 pt-2 border-t border-border/80">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Available Services & Equipment
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure flat-rate services clients can add during reservation.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', price: 0 })}
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No services added. Click &quot;Add Service&quot; above to include options like Projector, Wi-Fi, etc.
              </p>
            ) : (
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Service name (e.g. Laser Projector)"
                        {...register(`services.${index}.name` as const)}
                        className={errors.services?.[index]?.name ? 'border-destructive' : ''}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Price UAH"
                        {...register(`services.${index}.price` as const)}
                        className={errors.services?.[index]?.price ? 'border-destructive' : ''}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Remove service row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="shadow-md shadow-primary/20"
            >
              {isEdit ? 'Save Changes' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
