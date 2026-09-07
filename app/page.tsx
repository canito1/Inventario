'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, AlertTriangle, TrendingUp, Tags } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardHeader from '@/components/DashboardHeader'
import InventoryDataTable from '@/components/InventoryDataTable'
import { ProductDialog } from '@/components/ProductDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { ProductDetailsDialog } from '@/components/ProductDetailsDialog'
import { useAuth } from '@/contexts/AuthContext'
import { Item, itemsService } from '@/lib/items'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    categories: 0,
  })

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Item | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [productToView, setProductToView] = useState<Item | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) loadInventoryData()
  }, [user, authLoading, router])

  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) loadInventoryData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, loading])

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      const response = await itemsService.getItems({ limit: 100 })
      setItems(response.items)

      const totalValue = response.items.reduce((sum, item) => {
        const currency = item.currency || 'PEN'
        const priceInPEN = currency === 'USD' ? item.price * 3.75 : item.price
        return sum + priceInPEN * item.quantity
      }, 0)
      const lowStock = response.items.filter((i) => i.quantity <= i.minStock).length
      const categories = new Set(response.items.map((i) => i.category._id)).size

      setStats({ totalItems: response.totalItems, lowStockItems: lowStock, totalValue, categories })
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product: Item) => {
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }
  const handleDeleteProduct = (product: Item) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }
  const handleViewDetails = (product: Item) => {
    setProductToView(product)
    setDetailsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    try {
      setDeleteLoading(true)
      await itemsService.deleteItem(productToDelete._id)
      toast({
        title: '✅ Producto eliminado',
        description: `${productToDelete.name} ha sido eliminado correctamente`,
      })
      await loadInventoryData()
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error: any) {
      toast({
        title: '❌ Error al eliminar',
        description: error.response?.data?.message || 'No se pudo eliminar el producto',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-svh bg-background flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-border border-t-primary border-solid animate-spin" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return null

  const statCards = [
    {
      label: 'Total Productos',
      value: stats.totalItems.toString(),
      icon: Package,
      accent: true,
    },
    {
      label: 'Stock Bajo',
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      danger: stats.lowStockItems > 0,
    },
    {
      label: 'Valor del Inventario',
      value: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
        stats.totalValue
      ),
      icon: TrendingUp,
    },
    {
      label: 'Categorías',
      value: stats.categories.toString(),
      icon: Tags,
    },
  ]

  return (
    <div className="flex min-h-svh bg-background font-sans text-foreground">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main column — flex-1 fills space after the sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader title="Dashboard" subtitle="Resumen del inventario" />

        {/* Page content */}
        <main className="flex-1 p-4 overflow-y-auto space-y-6">

          {/* Stats grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-3 rounded-[8px] border border-border bg-surface p-4 transition-all duration-150"
              >
                {/* Icon row */}
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[6px] border border-border",
                    card.accent ? "bg-primary" : "bg-background"
                  )}>
                    <card.icon
                      size={18}
                      className={cn(
                        card.accent ? "text-primary-foreground" :
                        card.danger ? "text-destructive" : "text-primary"
                      )}
                    />
                  </div>
                  {loading && (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                  )}
                </div>

                {/* Label + value */}
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={cn(
                    "text-xl font-semibold leading-none",
                    card.danger ? "text-destructive" : "text-foreground"
                  )}>
                    {loading ? '—' : card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Inventory table card */}
          <div className="overflow-hidden rounded-[8px] border border-border bg-surface">
            <div className="p-1">
              <InventoryDataTable
                data={items}
                loading={loading}
                showHeader={false}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onSuccess={loadInventoryData}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que quieres eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
      <ProductDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        product={productToView}
      />
    </div>
  )
}