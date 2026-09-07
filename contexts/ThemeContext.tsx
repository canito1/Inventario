'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // On mount, read persisted preference or system preference
  useEffect(() => {
    setThemeState('light')
    setMounted(true)
  }, [])

  // Apply class to <html> whenever theme changes
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add('light')
    localStorage.setItem('theme', 'light')
  }, [theme, mounted])

  const setTheme = (_t: Theme) => setThemeState('light')
  const toggleTheme = () => setThemeState('light')

  // Render children immediately — the inline script in layout prevents flash
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
