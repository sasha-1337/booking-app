import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RoomsPage } from '@/pages/RoomsPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { AdminRoomsPage } from '@/pages/AdminRoomsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RoomsPage />,
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'admin/rooms',
        element: <AdminRoomsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
