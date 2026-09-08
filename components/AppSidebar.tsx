'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Package,
  BarChart3,
  Users,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Tags,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  FileBarChart,
  DollarSign,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

const navSections = [
  {
    title: "Inventario",
    icon: Package,
    items: [
      { title: "Dashboard",   url: "/",            icon: LayoutDashboard },
      { title: "Inventario",  url: "/inventario",  icon: Boxes },
      { title: "Productos",   url: "/productos",   icon: ShoppingBag },
      { title: "Categorías",  url: "/categorias",  icon: Tags },
      { title: "Stock Bajo",  url: "/stock-bajo",  icon: AlertTriangle },
    ],
  },
  {
    title: "Movimientos",
    icon: TrendingUp,
    items: [
      { title: "Entradas",  url: "/entradas", icon: ArrowDownCircle },
      { title: "Salidas",   url: "/salidas",  icon: ArrowUpCircle },
      { title: "Historial", url: "/historial", icon: History },
    ],
  },
  {
    title: "Reportes",
    icon: BarChart3,
    items: [
      { title: "Inventario",  url: "/reportes/inventario",  icon: FileBarChart },
      { title: "Valoración",  url: "/reportes/valoracion",  icon: DollarSign },
      { title: "Rotación",    url: "/reportes/rotacion",    icon: RefreshCw },
    ],
  },
  {
    title: "Administración",
    icon: Users,
    items: [
      { title: "Usuarios",       url: "/usuarios",      icon: Users },
      { title: "Configuración",  url: "/configuracion", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map((s) => [s.title, true]))
  )

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url)

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <>
      {isMobile && openMobile && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-svh flex-col bg-[--sidebar-background] border-r border-[--sidebar-border] font-body transition-[width,transform] duration-200 ease-linear md:sticky md:top-0 md:z-auto md:self-start",
        isMobile
          ? (openMobile ? "w-[18rem] translate-x-0" : "w-[18rem] -translate-x-full")
          : (state === "collapsed" ? "w-[3rem]" : "w-[16rem]")
      )}
      data-sidebar="sidebar"
      data-state={state}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-[--sidebar-border] p-4",
          state === "collapsed" && !isMobile ? "justify-center px-1" : ""
        )}
        data-sidebar="header"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--primary]"
        >
          <Package size={16} color="#000000" />
        </div>
        <span className={cn(
          "font-heading text-heading-6 font-semibold tracking-tight text-[--sidebar-foreground]",
          state === "collapsed" && !isMobile ? "sr-only" : ""
        )}>
          Inventario
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" data-sidebar="content">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1" data-sidebar="group">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.title)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[--sidebar-foreground]/70 transition-colors hover:bg-[--sidebar-accent] hover:text-[--sidebar-accent-foreground] focus-visible:ring-2 focus-visible:ring-[--sidebar-ring]"
              data-sidebar="group-label"
            >
              <span className="flex items-center gap-2">
                <section.icon size={12} />
                <span className={state === "collapsed" && !isMobile ? "sr-only" : ""}>{section.title}</span>
              </span>
              {openSections[section.title] && (state !== "collapsed" || isMobile) ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>

            {/* Section items */}
            {openSections[section.title] && (
              <div className="mt-1 ml-1" data-sidebar="group-content">
                {section.items.map((item) => {
                  const active = isActive(item.url)
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        active
                          ? "bg-[--sidebar-accent] text-[--sidebar-primary] font-medium"
                          : "text-[--sidebar-foreground] hover:bg-[--sidebar-accent] hover:text-[--sidebar-accent-foreground]",
                        "data-[active=true]:bg-[--sidebar-accent] data-[active=true]:text-[--sidebar-accent-foreground]"
                      )}
                      data-sidebar="menu-button"
                      data-active={active}
                    >
                      <item.icon size={14} />
                      <span className={state === "collapsed" && !isMobile ? "sr-only" : ""}>{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div
          className="border-t border-[--sidebar-border] p-2"
          data-sidebar="footer"
        >
          {/* User info */}
          <div className="flex items-center gap-3 rounded-md px-3 py-2 bg-[--sidebar-accent] mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--primary] text-[--primary-foreground] font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={cn("min-w-0 flex-1", state === "collapsed" && !isMobile ? "sr-only" : "")}>
              <div className="text-sm font-medium text-[--sidebar-foreground] truncate">
                {user.name}
              </div>
              <div className="text-xs text-[--muted-foreground] capitalize">
                {user.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[--destructive] transition-colors hover:bg-[--sidebar-accent] hover:text-[--destructive]"
            data-sidebar="menu-button"
            onClick={() => { logout(); closeMobileSidebar() }}
          >
            <LogOut size={14} />
            <span className={state === "collapsed" && !isMobile ? "sr-only" : ""}>Cerrar Sesión</span>
          </button>
        </div>
      )}
      </aside>
    </>
  )
}