'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/AppSidebar'
import HistoryDataTable, { HistoryEntry } from '@/components/HistoryDataTable'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { StockEntry, stockEntriesService } from '@/lib/stock-entries'
import { StockExit, stockExitsService } from '@/lib/stock-exits'
import { useToast } from '@/hooks/use-toast'

export default function HistorialPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchHistory()
    }
  }, [user, authLoading, router])

  // Recargar datos cuando la página vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        fetchHistory()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, loading])

  const fetchHistory = async () => {
    try {
      setLoading(true)

      // Fetch entries and exits in parallel
      const [entriesResponse, exitsResponse] = await Promise.all([
        stockEntriesService.getStockEntries({ limit: 100 }),
        stockExitsService.getStockExits({ limit: 100 })
      ])

      // Transform entries to history format
      const entriesHistory: HistoryEntry[] = entriesResponse.entries.map((entry: StockEntry) => ({
        id: entry._id,
        type: 'entrada' as const,
        productName: entry.item.name,
        productSku: entry.item.barcode || entry.item._id.slice(-8),
        quantity: entry.quantity,
        unitCost: entry.unitCost,
        totalCost: entry.totalCost,
        reason: entry.reason,
        supplier: entry.supplier,
        notes: entry.notes,
        createdAt: entry.createdAt,
        createdBy: entry.createdBy.name
      }))

      // Transform exits to history format
      const exitsHistory: HistoryEntry[] = exitsResponse.exits.map((exit: StockExit) => ({
        id: exit._id,
        type: 'salida' as const,
        productName: exit.item.name,
        productSku: exit.item.barcode || exit.item._id.slice(-8),
        quantity: exit.quantity,
        unitCost: exit.unitCost,
        totalCost: exit.totalCost,
        reason: exit.reason,
        destination: exit.destination,
        notes: exit.notes,
        createdAt: exit.createdAt,
        createdBy: exit.createdBy.name
      }))

      // Combine and sort by date (most recent first)
      const combinedHistory = [...entriesHistory, ...exitsHistory].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setHistory(combinedHistory)
    } catch (error) {
      console.error('Error fetching history:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="copilot-flex copilot-items-center copilot-justify-center copilot-min-h-screen">
        <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="copilot-flex copilot-h-14 sm:copilot-h-16 copilot-shrink-0 copilot-items-center copilot-gap-2 copilot-border-b copilot-px-2 sm:copilot-px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="copilot-flex-1 copilot-min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/" className="copilot-text-sm">Sistema de Inventario</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="copilot-text-sm">Historial</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div>
              <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Historial de Movimientos</h1>
              <p className="copilot-text-muted">Registro completo de entradas y salidas de inventario</p>
            </div>

            {/* History Data Table */}
            <HistoryDataTable data={history} loading={loading} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}