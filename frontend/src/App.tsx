import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
})

function ToasterWithTheme() {
  const { theme } = useTheme()
  return (
    <Toaster
      position="top-right"
      theme={theme}
      richColors
      closeButton
      duration={4000}
    />
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <RouterProvider router={router} />
        <ToasterWithTheme />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
