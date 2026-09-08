'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

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
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4">
        {/* Left — title */}
        <div className="min-w-0 flex-none">
          <h1 className="font-heading text-heading-6 font-semibold leading-none tracking-tight text-[--foreground] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[--muted-foreground]">{subtitle}</p>
          )}
        </div>

        {/* Center — search */}
        <div className="flex-1 max-w-xs flex items-center relative">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Bell */}
          <button
            aria-label="Notificaciones"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-transparent bg-transparent text-[--muted-foreground] transition-colors hover:bg-[--sidebar-accent] hover:text-[--foreground] hover:border-[--border]"
          >
            <Bell size={16} />
          </button>

          {/* User avatar */}
          {user && (
            <div
              title={user.name}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--primary] border border-[--border] text-[--primary-foreground] font-bold text-sm cursor-pointer select-none"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}