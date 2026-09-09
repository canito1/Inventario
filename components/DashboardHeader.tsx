'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
}

export default function DashboardHeader({
  title = "Dashboard",
  subtitle,
}: DashboardHeaderProps) {
  const { user } = useAuth()
  const [searchValue, setSearchValue] = useState('')

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[--border] bg-[--background] font-body",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.15)]"
      )}
    >
      <div className="grid min-h-14 w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-3 py-2 sm:grid-cols-[1fr_minmax(240px,360px)_1fr] sm:gap-6 sm:px-5 sm:py-0">
        {/* Left — title */}
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger
            aria-label="Abrir menú de navegación"
            title="Abrir menú"
            className="shrink-0 sm:hidden"
          />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-heading-6 font-semibold leading-none tracking-tight text-[--foreground]">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-[--muted-foreground]">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center — search */}
        <div className="relative order-3 col-span-2 flex min-w-0 w-full items-center sm:order-none sm:col-span-1 sm:w-auto">
          <Search
            size={14}
            className="absolute left-3 text-[--muted-foreground] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex h-8 w-full rounded-copilot border border-[--border] bg-[--background] px-8 py-1.5 pl-9 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Right — actions */}
        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-1 sm:col-start-3 sm:row-start-1 sm:gap-2">
          <button
            aria-label="Notificaciones"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-transparent bg-transparent text-[--muted-foreground] transition-colors hover:bg-[--sidebar-accent] hover:text-[--foreground] hover:border-[--border]"
          >
            <Bell size={16} />
          </button>
          {user && (
            <div
              title={user.name}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--border] bg-[--primary] text-sm font-bold text-[--primary-foreground]"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}