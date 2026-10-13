import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, RotateCcw, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Button } from '@/components/ui/button'
import { resetMockStorage } from '@/mocks/handlers'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const queryClient = useQueryClient()

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Available Conference Rooms'
    if (location.pathname === '/bookings') return 'My Bookings & Reservations'
    if (location.pathname.startsWith('/admin')) return 'Room Administration'
    return 'RoomReserve'
  }

  const handleResetData = () => {
    resetMockStorage()
    queryClient.invalidateQueries()
    toast.success('Demo data restored to initial seed state!')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Sheet / Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 w-72 max-w-[85vw] h-full bg-card shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute right-3 top-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileOpen(false)}
              onNavigateMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top bar Header */}
        <header className="h-16 shrink-0 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetData}
              className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground"
              title="Reset mock data to initial seeds"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Demo Data
            </Button>

            {/* Dark/Light mode toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="rounded-xl h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
              )}
            </Button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
