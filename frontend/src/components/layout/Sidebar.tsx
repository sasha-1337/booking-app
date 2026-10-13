import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutGrid, CalendarCheck, ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNavigateMobile?: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse, onNavigateMobile }: SidebarProps) {
  const navItems = [
    {
      to: '/',
      label: 'Rooms',
      sublabel: 'Find & book halls',
      icon: LayoutGrid,
    },
    {
      to: '/bookings',
      label: 'My Bookings',
      sublabel: 'View reservations',
      icon: CalendarCheck,
    },
    {
      to: '/admin/rooms',
      label: 'Admin Panel',
      sublabel: 'Manage rooms & rates',
      icon: ShieldCheck,
    },
  ]

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'relative flex flex-col h-full bg-card/95 border-r border-border transition-all duration-300 ease-in-out z-20 shadow-sm backdrop-blur-md',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Main Navigation"
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/25 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate animate-fade-in">
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  Room<span className="text-primary">Reserve</span>
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Conference Hub
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const linkContent = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigateMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )
                }
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110')} />
                {!isCollapsed && (
                  <div className="flex flex-col truncate animate-fade-in text-left">
                    <span className="leading-tight">{item.label}</span>
                    <span className="text-[11px] font-normal opacity-70 group-hover:opacity-90">
                      {item.sublabel}
                    </span>
                  </div>
                )}
              </NavLink>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>

        {/* Collapse toggle button on desktop */}
        <div className="p-3 border-t border-border/80 hidden md:flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground px-2 font-medium">Collapse menu</span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            className={cn(
              'p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all',
              isCollapsed && 'w-full flex justify-center'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
