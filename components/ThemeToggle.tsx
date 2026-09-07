'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
      className="
        flex h-8 w-8 items-center justify-center
        rounded-[8px] border border-transparent
        bg-transparent text-[--muted-foreground]
        transition-colors duration-150
        hover:bg-[--sidebar-accent] hover:text-[--foreground] hover:border-[--border]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]
      "
    >
      {theme === 'dark' ? (
        <Sun size={16} aria-hidden />
      ) : (
        <Moon size={16} aria-hidden />
      )}
    </button>
  )
}
