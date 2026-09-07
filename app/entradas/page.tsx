'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, PackagePlus, Package, Calendar, ArrowUpCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/contexts/AuthContext'
import { Item, itemsService } from '@/lib/items'
import { StockEntry, stockEntriesService, CreateStockEntryData } from '@/lib/stock-entries'
import { useToast } from '@/hooks/use-toast'

export default function EntradasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [products, setProducts] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
    supplier: '',
    reason: 'purchase',
    notes: ''
  })

  const reasons = [
    { value: 'purchase', label: '🛒 Compra', icon: '🛒' },
    { value: 'return', label: '↩️ Devolución', icon: '↩️' },
    { value: 'adjustment', label: '⚖️ Ajuste de inventario', icon: '⚖️' },
    { value: 'transfer', label: '🔄 Transferencia', icon: '🔄' },
    { value: 'exit', label: '📤 Salida', icon: '📤' }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchEntries()
      fetchProducts()
    }
  }, [user, authLoading, router])

  // Recargar datos cuando la página vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        fetchEntries()
        fetchProducts()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, loading])

  const fetchEntries = async () => {
    try {
      const response = await stockEntriesService.getStockEntries({ limit: 100 })
      setEntries(response.entries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await itemsService.getItems({ limit: 100 })
      setProducts(response.items)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const filteredEntries = entries.filter(entry =>
    entry.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.item.barcode && entry.item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.supplier && entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateEntry = async () => {
    try {
      const quantity = parseInt(formData.quantity)
      const unitCost = formData.unitCost ? parseFloat(formData.unitCost) : 0

      const entryData: CreateStockEntryData = {
        itemId: formData.productId,
        quantity,
        unitCost,
        supplier: formData.supplier || undefined,
        reason: formData.reason as 'purchase' | 'return' | 'adjustment' | 'transfer',
        notes: formData.notes || undefined
      }

      const newEntry = await stockEntriesService.createStockEntry(entryData)
      setEntries([newEntry, ...entries])
      // Recargar productos porque el stock cambió
      await fetchProducts()
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: '✅ Entrada creada',
        description: 'La entrada de inventario se ha registrado correctamente',
      })
    } catch (error: any) {
      console.error('Error creating entry:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo crear la entrada',
        variant: 'destructive'
      })
    }
  }

  const handleEditEntry = (entry: StockEntry) => {
    setEditingEntry(entry)
    setFormData({
      productId: entry.item._id,
      quantity: entry.quantity.toString(),
      unitCost: entry.unitCost.toString(),
      supplier: entry.supplier || '',
      reason: entry.reason,
      notes: entry.notes || ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleUpdateEntry = async () => {
    if (!editingEntry) return

    try {
      const quantity = parseInt(formData.quantity)
      const unitCost = formData.unitCost ? parseFloat(formData.unitCost) : 0

      const updateData: Partial<CreateStockEntryData> = {
        quantity,
        unitCost,
        supplier: formData.supplier || undefined,
        reason: formData.reason as 'purchase' | 'return' | 'adjustment' | 'transfer',
        notes: formData.notes || undefined
      }

      const updatedEntry = await stockEntriesService.updateStockEntry(editingEntry._id, updateData)
      setEntries(entries.map(e => e._id === updatedEntry._id ? updatedEntry : e))
      await fetchProducts()
      setIsCreateDialogOpen(false)
      setEditingEntry(null)
      resetForm()
      toast({
        title: '✅ Entrada actualizada',
        description: 'La entrada se ha actualizado correctamente',
      })
    } catch (error: any) {
      console.error('Error updating entry:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo actualizar la entrada',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteClick = (entryId: string) => {
    setDeletingEntryId(entryId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingEntryId) return

    try {
      await stockEntriesService.deleteStockEntry(deletingEntryId)
      setEntries(entries.filter(e => e._id !== deletingEntryId))
      await fetchProducts()
      setIsDeleteDialogOpen(false)
      setDeletingEntryId(null)
      toast({
        title: '✅ Entrada eliminada',
        description: 'La entrada se ha eliminado correctamente',
      })
    } catch (error: any) {
      console.error('Error deleting entry:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo eliminar la entrada',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitCost: '',
      supplier: '',
      reason: 'purchase',
      notes: ''
    })
    setEditingEntry(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      resetForm()
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

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="copilot-flex copilot-items-center copilot-justify-center copilot-h-64">
            <div className="text-center">
              <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin mx-auto copilot-mb-4"></div>
              <p className="copilot-text-sm copilot-text-muted">Cargando entradas...</p>
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
                <BreadcrumbPage className="copilot-text-sm">Entradas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            {/* Header */}
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <div className="copilot-flex copilot-items-center copilot-gap-3 copilot-mb-2">
                  <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-4 copilot-py-2 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-success copilot-text-white copilot-border-0">
                    <PackagePlus className="copilot-h-4 copilot-w-4" />
                    Entrada
                  </div>
                  <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">
                    Entradas de Inventario
                  </h1>
                </div>
                <p className="copilot-text-muted">
                  Registro de ingresos de productos al inventario
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="copilot-w-full sm:copilot-w-auto">
                <Plus className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                Nueva Entrada
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 lg:copilot-grid-cols-4 copilot-gap-4">
              <Card className="copilot-border copilot-border-border">
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Entradas Hoy</CardTitle>
                  <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-3 copilot-py-1 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-success copilot-text-white copilot-border-0">
                    <PackagePlus className="copilot-h-3 copilot-w-3" />
                    Entrada
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">
                    {entries.filter(e =>
                      new Date(e.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                </CardContent>
              </Card>
              <Card className="copilot-border copilot-border-border">
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Total Productos</CardTitle>
                  <Package className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">
                    {entries.reduce((sum, entry) => sum + entry.quantity, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="copilot-border copilot-border-border">
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Valor Total</CardTitle>
                  <Package className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">
                    {new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    }).format(entries.reduce((sum, entry) => sum + entry.totalCost, 0))}
                  </div>
                </CardContent>
              </Card>
              <Card className="copilot-border copilot-border-border">
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Este Mes</CardTitle>
                  <Calendar className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">
                    {entries.filter(e => {
                      const entryDate = new Date(e.createdAt)
                      const now = new Date()
                      return entryDate.getMonth() === now.getMonth() &&
                        entryDate.getFullYear() === now.getFullYear()
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="copilot-relative">
              <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted copilot-h-4 copilot-w-4" />
              <Input
                placeholder="Buscar entradas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="copilot-pl-10 copilot-h-10 copilot-rounded-copilot"
              />
            </div>

            {/* Entries Table */}
            <Card className="copilot-border copilot-border-border">
              <CardHeader>
                <CardTitle>Historial de Entradas</CardTitle>
                <CardDescription>
                  Registro completo de todas las entradas de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="copilot-overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Costo Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Acciones</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry._id}>
                          <TableCell className="copilot-font-medium">{entry.item.name}</TableCell>
                          <TableCell className="copilot-text-muted">{entry.item.barcode || entry.item._id.slice(-8)}</TableCell>
                          <TableCell className="text-right">{entry.quantity}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("es-PE", {
                              style: "currency",
                              currency: "PEN",
                            }).format(entry.unitCost)}
                          </TableCell>
                          <TableCell className="text-right copilot-font-medium">
                            {new Intl.NumberFormat("es-PE", {
                              style: "currency",
                              currency: "PEN",
                            }).format(entry.totalCost)}
                          </TableCell>
                          <TableCell>{entry.supplier || '-'}</TableCell>
                          <TableCell>
                            <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-3 copilot-py-1 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-success copilot-text-white copilot-border-0">
                              <PackagePlus className="copilot-h-3 copilot-w-3" />
                              Entrada
                            </div>
                          </TableCell>
                          <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="copilot-flex copilot-gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEntry(entry)}
                                className="copilot-h-8 copilot-w-8 copilot-p-0"
                              >
                                <Pencil className="copilot-h-4 copilot-w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(entry._id)}
                                className="copilot-h-8 copilot-w-8 copilot-p-0 copilot-text-destructive copilot-hover:text-destructive/80 copilot-hover:bg-destructive/10"
                              >
                                <Trash2 className="copilot-h-4 copilot-w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredEntries.length === 0 && (
                  <div className="copilot-text-center copilot-py-12">
                    <Package className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mx-auto copilot-mb-4" />
                    <h3 className="copilot-text-lg copilot-font-medium copilot-mb-2">
                      {searchTerm ? 'No se encontraron entradas' : 'No hay entradas registradas'}
                    </h3>
                    <p className="copilot-text-muted">
                      {searchTerm
                        ? 'Intenta ajustar el término de búsqueda'
                        : 'Comienza agregando tu primera entrada de inventario'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create/Edit Entry Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
              <DialogContent className="sm:copilot-max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEntry ? 'Editar Entrada' : 'Nueva Entrada de Inventario'}</DialogTitle>
                  <DialogDescription>
                    {editingEntry ? 'Modifica los datos de la entrada' : 'Registra una nueva entrada de productos al inventario'}
                  </DialogDescription>
                </DialogHeader>

                <div className="copilot-space-y-4">
                  <div className="copilot-space-y-2">
                    <Label htmlFor="product" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Producto</Label>
                    <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })} disabled={!!editingEntry}>
                      <SelectTrigger className="copilot-h-10 copilot-rounded-copilot">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name} ({product.barcode || product._id.slice(-8)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="copilot-grid copilot-grid-cols-2 copilot-gap-4">
                    <div className="copilot-space-y-2">
                      <Label htmlFor="quantity" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Cantidad</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        min="1"
                        className="copilot-h-10 copilot-rounded-copilot"
                      />
                    </div>
                    <div className="copilot-space-y-2">
                      <Label htmlFor="unitCost" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Costo Unitario (opcional)</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        value={formData.unitCost}
                        onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="copilot-h-10 copilot-rounded-copilot"
                      />
                    </div>
                  </div>

                  <div className="copilot-space-y-2">
                    <Label htmlFor="supplier" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Proveedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nombre del proveedor"
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                  </div>

                  <div className="copilot-space-y-2">
                    <Label htmlFor="reason" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Motivo</Label>
                    <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                      <SelectTrigger className="copilot-h-10 copilot-rounded-copilot">
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            <span className="copilot-flex copilot-items-center copilot-gap-2">
                              <span>{reason.icon}</span>
                              <span>{reason.label.replace(/^[^\s]+ /, '')}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="copilot-space-y-2">
                    <Label htmlFor="notes" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas adicionales..."
                      rows={3}
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                  </div>

                  {Number(formData.quantity) > 0 && Number(formData.unitCost) > 0 && (
                    <div className="copilot-bg-muted copilot-p-3 copilot-rounded-copilot copilot-border copilot-border-border">
                      <div className="copilot-flex copilot-justify-between copilot-items-center">
                        <span className="copilot-text-sm copilot-text-muted">Total:</span>
                        <span className="copilot-font-medium">
                          {new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(Number(formData.quantity) * Number(formData.unitCost))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="copilot-h-10 copilot-rounded-copilot"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
                    disabled={!formData.productId || !formData.quantity || parseFloat(formData.quantity) <= 0}
                    className="copilot-h-10 copilot-rounded-copilot"
                  >
                    {editingEntry ? 'Actualizar Entrada' : 'Crear Entrada'}
                  </Button>
                </DialogFooter></DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la entrada y se restaurará la cantidad en el inventario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="copilot-h-10 copilot-rounded-copilot">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className="copilot-h-10 copilot-rounded-copilot copilot-bg-destructive copilot-hover:bg-destructive/80">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}