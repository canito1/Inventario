'use client'

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  mobileBreakpoint?: string
}

interface ResponsiveTableContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const ResponsiveTableContext = React.createContext<ResponsiveTableContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
})

export const useResponsiveTable = () => {
  const context = React.useContext(ResponsiveTableContext)
  if (!context) {
    throw new Error('useResponsiveTable must be used within ResponsiveTableProvider')
  }
  return context
}

export function ResponsiveTableProvider({ 
  children, 
  className,
  mobileBreakpoint = "(max-width: 640px)" 
}: ResponsiveTableProps) {
  const isMobile = useMediaQuery(mobileBreakpoint)
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const isDesktop = useMediaQuery("(min-width: 1025px)")

  const value = React.useMemo(() => ({
    isMobile,
    isTablet,
    isDesktop
  }), [isMobile, isTablet, isDesktop])

  return (
    <ResponsiveTableContext.Provider value={value}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </ResponsiveTableContext.Provider>
  )
}

// Mobile-first table wrapper that automatically switches between table and card views
interface MobileFirstTableProps {
  data: any[]
  columns: any[]
  table: any
  renderMobileCard: (item: any, index: number) => React.ReactNode
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function MobileFirstTable({
  data,
  columns,
  table,
  renderMobileCard,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className
}: MobileFirstTableProps) {
  const { isMobile } = useResponsiveTable()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--primary]"></div>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-muted-foreground text-sm">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card View - Priority */}
      {isMobile && (
        <div className="space-y-3">
          {table.getRowModel().rows.map((row: any, index: number) => (
            <div key={row.id || index}>
              {renderMobileCard(row.original, index)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!isMobile && (
        <div className={cn("rounded-md border overflow-x-auto", className)}>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <TableHead 
                      key={header.id}
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : React.createElement(
                            'div',
                            { className: 'flex items-center space-x-2' },
                            header.column.getCanSort() 
                              ? React.createElement(
                                  'button',
                                  {
                                    className: 'flex items-center space-x-1 hover:text-foreground',
                                    onClick: header.column.getToggleSortingHandler()
                                  },
                                  typeof header.column.columnDef.header === 'function'
                                    ? header.column.columnDef.header(header.getContext())
                                    : header.column.columnDef.header
                                )
                              : typeof header.column.columnDef.header === 'function'
                                ? header.column.columnDef.header(header.getContext())
                                : header.column.columnDef.header
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell 
                      key={cell.id}
                      className="py-2 px-4"
                    >
                      {React.createElement(
                        'div',
                        { className: 'min-w-0' },
                        typeof cell.column.columnDef.cell === 'function'
                          ? cell.column.columnDef.cell(cell.getContext())
                          : cell.getValue()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

// Enhanced mobile card base component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  selected?: boolean
  onClick?: () => void
}

export function MobileCard({
  children,
  className,
  selected = false,
  onClick
}: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-[--surface] border border-[--border] rounded-copilot p-4 transition-copilot",
        "hover:border-[--muted]",
        selected && "border-[--primary] bg-[--primary]/10",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Mobile card header component
interface MobileCardHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
}

export function MobileCardHeader({
  title,
  subtitle,
  badge,
  actions,
  icon
}: MobileCardHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="break-words text-sm font-medium leading-5 text-[--foreground] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"
            title={typeof title === 'string' ? title : ''}
          >
              {title}
          </h3>
          {badge && (
            <div className="mt-1 flex max-w-full flex-wrap items-center gap-1">
              {badge}
            </div>
          )}
          {subtitle && (
            <p className="mt-1 break-words text-xs leading-4 text-[--muted-foreground] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden" title={typeof subtitle === 'string' ? subtitle : ''}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="ml-1 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

// Mobile card content sections
interface MobileCardSectionProps {
  children: React.ReactNode
  className?: string
}

export function MobileCardSection({ children, className }: MobileCardSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

// Mobile card field component
interface MobileCardFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function MobileCardField({ label, value, className }: MobileCardFieldProps) {
  return (
    <div className={cn("flex justify-between items-center text-xs", className)}>
      <span className="text-[--muted-foreground] font-medium">{label}:</span>
      <span className="font-medium text-right text-[--foreground]">{value}</span>
    </div>
  )
}

// Mobile card actions footer
interface MobileCardActionsProps {
  children: React.ReactNode
  className?: string
}

export function MobileCardActions({ children, className }: MobileCardActionsProps) {
  return (
    <div className={cn("flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-[--border]", className)}>
      {children}
    </div>
  )
}