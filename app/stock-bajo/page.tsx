'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Package, Search, RefreshCw, Grid, List, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useMediaQuery } from '@/hooks/use-media-query'
import { itemsService } from '@/lib/items'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LowStockMobileCard } from '@/components/LowStockMobileCard'
import { RestockDialog } from '@/components/RestockDialog'
import { ProductDetailsDialog } from '@/components/ProductDetailsDialog'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { AppSidebar } from '@/components/AppSidebar'
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
import { useAuth } from '@/contexts/AuthContext'
import { Item } from '@/lib/items'

export default function StockBajoPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'out'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 640px)') // Updated to match responsive table breakpoint

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchLowStockProducts()
    }
  }, [user, authLoading, router])

  const fetchLowStockProducts = async () => {
    try {
      const lowStockItems = await itemsService.getLowStockItems()
      setProducts(lowStockItems)
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos con stock bajo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRestock = async (productId: string, quantity: number, cost: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setProducts(prev => prev.map(product => {
        if (product._id === productId) {
          const newStock = product.quantity + quantity
          return {
            ...product,
            quantity: newStock
          }
        }
        return product
      }))

      toast({
        title: "Reabastecimiento exitoso",
        description: `Se agregaron ${quantity} unidades al inventario`,
      })
    } catch (error) {
      console.error('Error restocking product:', error)
      toast({
        title: "Error",
        description: "No se pudo completar el reabastecimiento",
        variant: "destructive",
      })
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return 'out'
    if (minStock <= 0) return 'normal'
    if (quantity <= Math.floor(minStock * 0.2)) return 'critical'
    if (quantity <= minStock) return 'low'
    return 'normal'
  }

  const handleViewDetails = (productId: string) => {
    const product = products.find(p => p._id === productId)
    if (product) {
      setSelectedProduct(product)
      setDetailsDialogOpen(true)
    }
  }

  const handleRestockClick = (productId: string) => {
    const product = products.find(p => p._id === productId)
    if (product) {
      setSelectedProduct(product)
      setRestockDialogOpen(true)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof product.category === 'string' ? product.category : product.category.name).toLowerCase().includes(searchTerm.toLowerCase())

    const stockStatus = getStockStatus(product.quantity, product.minStock)
    const matchesFilter = filter === 'all' || stockStatus === filter

    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: 'out' | 'critical' | 'low' | 'normal') => {
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Sin Stock</Badge>
      case 'critical':
        return <Badge variant="secondary" className="copilot-bg-warning/10 copilot-text-warning copilot-border copilot-border-warning/20">Mínimo</Badge>
      case 'low':
        return <Badge variant="outline" className="copilot-border-warning/30 copilot-text-warning">Bajo</Badge>
      default:
        return <Badge variant="default">Normal</Badge>
    }
  }

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    critical: products.filter(p => getStockStatus(p.quantity, p.minStock) === 'critical').length,
    low: products.filter(p => getStockStatus(p.quantity, p.minStock) === 'low').length
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

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="copilot-flex copilot-items-center copilot-justify-center copilot-h-64">
            <div className="text-center">
              <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin mx-auto copilot-mb-4"></div>
              <p className="copilot-text-sm copilot-text-muted">Cargando productos...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                <BreadcrumbPage className="copilot-text-sm">Stock Bajo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
      {/* Header */}
      <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
        <div>
          <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0 copilot-flex copilot-items-center copilot-gap-2">
            <AlertTriangle className="copilot-h-6 copilot-w-6 copilot-text-warning" />
            Stock Bajo
          </h1>
          <p className="copilot-text-muted">
            Productos que requieren reabastecimiento
          </p>
        </div>
        <Button onClick={fetchLowStockProducts} variant="outline" className="copilot-w-full sm:copilot-w-auto copilot-h-10 copilot-rounded-copilot">
          <RefreshCw className="copilot-h-4 copilot-w-4 copilot-mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Alert */}
      {stats.outOfStock > 0 && (
        <Alert className="copilot-border-destructive/30 copilot-bg-destructive/10">
          <AlertTriangle className="copilot-h-4 copilot-w-4 copilot-text-destructive" />
          <AlertDescription className="copilot-text-destructive">
            Tienes {stats.outOfStock} producto{stats.outOfStock > 1 ? 's' : ''} sin stock que requiere{stats.outOfStock > 1 ? 'n' : ''} atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 lg:copilot-grid-cols-4 copilot-gap-4">
        <Card className="copilot-border copilot-border-border">
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Total Alertas</CardTitle>
            <AlertTriangle className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="copilot-border copilot-border-border">
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Sin Stock</CardTitle>
            <Package className="copilot-h-4 copilot-w-4 copilot-text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold copilot-text-destructive">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        <Card className="copilot-border copilot-border-border">
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Stock Mínimo</CardTitle>
            <Package className="copilot-h-4 copilot-w-4 copilot-text-warning" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold copilot-text-warning">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="copilot-border copilot-border-border">
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Stock Bajo</CardTitle>
            <Package className="copilot-h-4 copilot-w-4 copilot-text-warning" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold copilot-text-warning">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="copilot-flex copilot-flex-col copilot-gap-4">
        <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-gap-4">
          <div className="copilot-relative copilot-flex-1">
            <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted copilot-h-4 copilot-w-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="copilot-pl-10 copilot-h-10 copilot-rounded-copilot"
            />
          </div>
          <div className="copilot-flex copilot-gap-2">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="copilot-h-10 copilot-rounded-copilot"
              >
                {viewMode === 'table' ? <Grid className="copilot-h-4 copilot-w-4" /> : <List className="copilot-h-4 copilot-w-4" />}
              </Button>
            )}
          </div>
        </div>

        <div className="copilot-flex copilot-flex-wrap copilot-gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className="copilot-h-10 copilot-rounded-copilot"
          >
            Todos ({stats.total})
          </Button>
          <Button
            variant={filter === 'out' ? 'default' : 'outline'}
            onClick={() => setFilter('out')}
            size="sm"
            className="copilot-h-10 copilot-rounded-copilot"
          >
            Sin Stock ({stats.outOfStock})
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            onClick={() => setFilter('critical')}
            size="sm"
            className="copilot-h-10 copilot-rounded-copilot"
          >
            Mínimo ({stats.critical})
          </Button>
          <Button
            variant={filter === 'low' ? 'default' : 'outline'}
            onClick={() => setFilter('low')}
            size="sm"
            className="copilot-h-10 copilot-rounded-copilot"
          >
            Bajo ({stats.low})
          </Button>
        </div>
      </div>

      {/* Products Content */}
      {viewMode === 'grid' || isMobile ? (
        /* Mobile/Grid View */
        <div className="copilot-space-y-4">
          <div className="copilot-flex copilot-justify-between copilot-items-center">
            <h2 className="copilot-text-lg copilot-font-semibold">
              Productos con Stock Bajo ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="copilot-border copilot-border-border">
              <CardContent className="copilot-text-center copilot-py-12">
                <Package className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mx-auto copilot-mb-4" />
                <h3 className="copilot-text-lg copilot-font-medium copilot-mb-2">
                  {searchTerm || filter !== 'all'
                    ? 'No se encontraron productos'
                    : '¡Excelente! No hay productos con stock bajo'
                  }
                </h3>
                <p className="copilot-text-muted">
                  {searchTerm || filter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Todos tus productos tienen stock suficiente'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 lg:copilot-grid-cols-3 copilot-gap-4">
              {filteredProducts.map((product) => (
                <LowStockMobileCard
                  key={product._id}
                  product={product}
                  onRestock={handleRestockClick}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <Card className="copilot-border copilot-border-border">
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
            <CardDescription>
              Lista de productos que necesitan reabastecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="copilot-overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="copilot-font-medium">{product.name}</TableCell>
                      <TableCell className="copilot-text-muted">{product.barcode || product._id.slice(-8)}</TableCell>
                      <TableCell>{typeof product.category === 'string' ? product.category : product.category.name}</TableCell>
                      <TableCell className="text-right">
                        <span className={product.quantity === 0 ? 'copilot-text-destructive copilot-font-medium' : ''}>
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right copilot-text-muted">
                        {product.minStock}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(getStockStatus(product.quantity, product.minStock))}
                      </TableCell>
                      <TableCell className="text-right copilot-font-medium">
                        <CurrencyDisplay
                          amount={product.price}
                          currency={product.currency || 'PEN'}
                          showConverter={true}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="copilot-flex copilot-gap-1 copilot-justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(product._id)}
                            className="copilot-h-10 copilot-rounded-copilot"
                          >
                            <Eye className="copilot-h-3 copilot-w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRestockClick(product._id)}
                            className="copilot-h-10 copilot-rounded-copilot"
                          >
                            <ShoppingCart className="copilot-h-3 copilot-w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="copilot-text-center copilot-py-12">
                <Package className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mx-auto copilot-mb-4" />
                <h3 className="copilot-text-lg copilot-font-medium copilot-mb-2">
                  {searchTerm || filter !== 'all'
                    ? 'No se encontraron productos'
                    : '¡Excelente! No hay productos con stock bajo'
                  }
                </h3>
                <p className="copilot-text-muted">
                  {searchTerm || filter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Todos tus productos tienen stock suficiente'
                  }
                </p>
              </div>
            )}
          </CardContent></Card>
      )}

      {/* Dialogs */}
      <RestockDialog
        product={selectedProduct}
        open={restockDialogOpen}
        onOpenChange={setRestockDialogOpen}
        onRestock={handleRestock}
      />

      <ProductDetailsDialog
        product={selectedProduct}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}