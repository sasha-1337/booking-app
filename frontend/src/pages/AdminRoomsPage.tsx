import React, { useState } from 'react'
import { useRooms } from '@/features/rooms/hooks/useRooms'
import { useAdminRoomMutations } from '@/features/admin/hooks/useAdminRoomMutations'
import { RoomFormDialog, RoomFormData } from '@/features/admin/components/RoomFormDialog'
import { Room } from '@/types/domain'
import { formatPriceUAH } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, ShieldCheck, AlertCircle, RefreshCw, Users, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function AdminRoomsPage() {
  const { data: rooms, isLoading, isError, error, refetch } = useRooms()
  const { createMutation, updateMutation, deleteMutation } = useAdminRoomMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)

  const handleOpenCreate = () => {
    setEditingRoom(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room)
    setDialogOpen(true)
  }

  const handleOpenDelete = (room: Room) => {
    setRoomToDelete(room)
    setDeleteConfirmOpen(true)
  }

  const handleFormSubmit = (data: RoomFormData) => {
    if (editingRoom) {
      updateMutation.mutate(
        {
          id: editingRoom.id,
          payload: {
            name: data.name,
            capacity: data.capacity,
            basePricePerHour: data.basePricePerHour,
            photoUrl: data.photoUrl || undefined,
            services: data.services,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Room "${data.name}" updated successfully!`)
            setDialogOpen(false)
          },
          onError: (err) => {
            toast.error(err.title || 'Update Failed', {
              description: err.detail || 'Could not update room.',
            })
          },
        }
      )
    } else {
      createMutation.mutate(
        {
          name: data.name,
          capacity: data.capacity,
          basePricePerHour: data.basePricePerHour,
          photoUrl: data.photoUrl || undefined,
          services: data.services,
        },
        {
          onSuccess: () => {
            toast.success(`Room "${data.name}" created successfully!`)
            setDialogOpen(false)
          },
          onError: (err) => {
            toast.error(err.title || 'Creation Failed', {
              description: err.detail || 'Could not create room.',
            })
          },
        }
      )
    }
  }

  const handleConfirmDelete = () => {
    if (!roomToDelete) return

    deleteMutation.mutate(roomToDelete.id, {
      onSuccess: () => {
        toast.success(`Room "${roomToDelete.name}" deleted successfully.`)
        setDeleteConfirmOpen(false)
        setRoomToDelete(null)
      },
      onError: (err) => {
        toast.error(err.title || 'Deletion Failed', {
          description: err.detail || 'Could not delete room.',
        })
      },
    })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Conference Room Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure hall capacities, base hourly pricing, and equipment add-ons.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-md shadow-primary/20 shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Room
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-subtle">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/40">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16 rounded-lg" />
                <Skeleton className="h-9 w-16 rounded-lg" />
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
            <h3 className="text-base font-bold text-destructive">Failed to Load Rooms</h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Could not fetch rooms list.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Rooms Table */}
      {!isLoading && !isError && rooms && (
        <div className="rounded-2xl border border-border/80 bg-card shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-4">Room Name</th>
                  <th scope="col" className="px-6 py-4">Capacity</th>
                  <th scope="col" className="px-6 py-4">Rate / Hour</th>
                  <th scope="col" className="px-6 py-4">Configured Add-ons</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        {room.photoUrl && (
                          <img
                            src={room.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-border/60 shrink-0"
                          />
                        )}
                        <div>
                          <div className="leading-tight">{room.name}</div>
                          <span className="text-[11px] font-normal text-muted-foreground font-mono">
                            {room.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{room.capacity} people</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {formatPriceUAH(room.basePricePerHour)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {room.services && room.services.length > 0 ? (
                          room.services.map((s) => (
                            <Badge
                              key={s.id}
                              variant="outline"
                              className="text-[11px] font-normal bg-accent/30 py-0.5"
                            >
                              <Sparkles className="w-2.5 h-2.5 mr-1 text-primary" />
                              {s.name} ({formatPriceUAH(s.price)})
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(room)}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-2.5"
                          aria-label={`Edit ${room.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(room)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5"
                          aria-label={`Delete ${room.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editingRoom}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the room &quot;{roomToDelete?.name}&quot; and remove it from available bookings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
