'use client'

import { useState } from 'react'
import { Menu, X, Package, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Package },
  { name: 'Productos', href: '#', icon: Package },
  { name: 'Categorías', href: '#', icon: Package },
  { name: 'Reportes', href: '#', icon: Package },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center pb-4 border-b">
            <Logo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          {user && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-sm truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}