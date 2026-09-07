'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import { Plus, PackageMinus, TrendingDown, Calendar, User, Search, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react'
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
import { StockExit, stockExitsService, CreateStockExitData } from '@/lib/stock-exits'
import { Item, itemsService } from '@/lib/items'

export default function SalidasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [exits, setExits] = useState<StockExit[]>([])
  const [products, setProducts] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingExit, setEditingExit] = useState<StockExit | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingExitId, setDeletingExitId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitCost: '',
    destination: '',
    reason: 'exit' as 'sale' | 'damage' | 'loss' | 'transfer' | 'adjustment' | 'return' | 'exit',
    notes: ''
  })

  const reasons = [
    { value: 'exit', label: '📤 Salida', icon: '📤' },
    { value: 'sale', label: '💰 Venta', icon: '💰' },
    { value: 'damage', label: '💔 Daño', icon: '💔' },
    { value: 'loss', label: '📉 Pérdida', icon: '📉' },
    { value: 'transfer', label: '🔄 Transferencia', icon: '🔄' },
    { value: 'adjustment', label: '⚖️ Ajuste', icon: '⚖️' },
    { value: 'return', label: '↩️ Devolución', icon: '↩️' }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchExits()
      fetchProducts()
    }
  }, [user, authLoading, router])

  // Recargar datos cuando la página vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        fetchExits()
        fetchProducts()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, loading])

  const fetchExits = async () => {
    try {
      setLoading(true)
      const response = await stockExitsService.getStockExits({ limit: 100 })
      setExits(response.exits)
    } catch (error) {
      console.error('Error fetching exits:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las salidas',
        variant: 'destructive'
      })
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

  const handleCreateExit = async () => {
    try {
      const quantity = parseInt(formData.quantity)
      const unitCost = formData.unitCost ? parseFloat(formData.unitCost) : 0

      const exitData: CreateStockExitData = {
        itemId: formData.productId,
        quantity,
        unitCost,
        destination: formData.destination || undefined,
        reason: formData.reason as CreateStockExitData['reason'],
        notes: formData.notes || undefined
      }

      const newExit = await stockExitsService.createStockExit(exitData)
      setExits([newExit, ...exits])
      // Recargar productos porque el stock cambió
      await fetchProducts()
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: '✅ Salida creada',
        description: 'La salida de stock se ha registrado correctamente',
      })
    } catch (error: any) {
      console.error('Error creating exit:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo crear la salida',
        variant: 'destructive'
      })
    }
  }

  const handleEditExit = (exit: StockExit) => {
    setEditingExit(exit)
    setFormData({
      productId: exit.item._id,
      quantity: exit.quantity.toString(),
      unitCost: exit.unitCost.toString(),
      destination: exit.destination || '',
      reason: exit.reason,
      notes: exit.notes || ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleUpdateExit = async () => {
    if (!editingExit) return

    try {
      const quantity = parseInt(formData.quantity)
      const unitCost = formData.unitCost ? parseFloat(formData.unitCost) : 0

      const updateData: Partial<CreateStockExitData> = {
        quantity,
        unitCost,
        destination: formData.destination || undefined,
        reason: formData.reason as CreateStockExitData['reason'],
        notes: formData.notes || undefined
      }

      const updatedExit = await stockExitsService.updateStockExit(editingExit._id, updateData)
      setExits(exits.map(e => e._id === updatedExit._id ? updatedExit : e))
      await fetchProducts()
      setIsCreateDialogOpen(false)
      setEditingExit(null)
      resetForm()
      toast({
        title: '✅ Salida actualizada',
        description: 'La salida se ha actualizado correctamente',
      })
    } catch (error: any) {
      console.error('Error updating exit:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo actualizar la salida',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteClick = (exitId: string) => {
    setDeletingExitId(exitId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingExitId) return

    try {
      await stockExitsService.deleteStockExit(deletingExitId)
      setExits(exits.filter(e => e._id !== deletingExitId))
      await fetchProducts()
      setIsDeleteDialogOpen(false)
      setDeletingExitId(null)
      toast({
        title: '✅ Salida eliminada',
        description: 'La salida se ha eliminado correctamente',
      })
    } catch (error: any) {
      console.error('Error deleting exit:', error)
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'No se pudo eliminar la salida',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitCost: '',
      destination: '',
      reason: 'exit',
      notes: ''
    })
    setEditingExit(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const filteredExits = exits.filter(exit =>
    exit.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exit.item.barcode && exit.item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (exit.destination && exit.destination.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
              <p className="copilot-text-sm copilot-text-muted">Cargando salidas...</p>
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
                <BreadcrumbPage className="copilot-text-sm">Salidas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <div className="copilot-flex copilot-items-center copilot-gap-3 copilot-mb-2">
                  <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-4 copilot-py-2 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-destructive copilot-text-white copilot-border-0">
                    <PackageMinus className="copilot-h-4 copilot-w-4" />
                    Salida
                  </div>
                  <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Salidas de Stock</h1>
                </div>
                <p className="copilot-text-muted">Gestiona las salidas de productos del inventario</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="copilot-w-full sm:copilot-w-auto">
                <Plus className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                Nueva Salida
              </Button>
            </div>

            {/* Search */}
            <div className="copilot-relative">
              <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted copilot-h-4 copilot-w-4" />
              <Input
                placeholder="Buscar salidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="copilot-pl-10 copilot-h-10 copilot-rounded-copilot"
              />
            </div>

            {/* Exits Table */}
            <Card className="copilot-border copilot-border-border">
              <CardHeader>
                <CardTitle>Historial de Salidas</CardTitle>
                <CardDescription>
                  Registro completo de todas las salidas de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredExits.length === 0 ? (
                  <div className="copilot-text-center copilot-py-12">
                    <TrendingDown className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mx-auto copilot-mb-4" />
                    <h3 className="copilot-text-lg copilot-font-medium copilot-mb-2">
                      {searchTerm ? 'No se encontraron salidas' : 'No hay salidas registradas'}
                    </h3>
                    <p className="copilot-text-muted copilot-mb-4">
                      {searchTerm
                        ? 'Intenta ajustar el término de búsqueda'
                        : 'Comienza registrando la primera salida de stock'
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                        Registrar Salida
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="copilot-overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Costo Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Acciones</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExits.map((exit) => (
                          <TableRow key={exit._id}>
                            <TableCell className="copilot-font-medium">{exit.item.name}</TableCell>
                            <TableCell className="copilot-text-muted">{exit.item.barcode || exit.item._id.slice(-8)}</TableCell>
                            <TableCell className="text-right">{exit.quantity}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("es-PE", {
                                style: "currency",
                                currency: "PEN",
                              }).format(exit.unitCost)}
                            </TableCell>
                            <TableCell className="text-right copilot-font-medium">
                              {new Intl.NumberFormat("es-PE", {
                                style: "currency",
                                currency: "PEN",
                              }).format(exit.totalCost)}
                            </TableCell>
                            <TableCell>{exit.destination || '-'}</TableCell>
                            <TableCell>
                              <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-3 copilot-py-1 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-destructive copilot-text-white copilot-border-0">
                                <TrendingDown className="copilot-h-3 copilot-w-3" />
                                {reasons.find(r => r.value === exit.reason)?.label.replace(/^[^\s]+ /, '') || exit.reason}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(exit.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="copilot-flex copilot-gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditExit(exit)}
                                  className="copilot-h-8 copilot-w-8 copilot-p-0"
                                >
                                  <Pencil className="copilot-h-4 copilot-w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(exit._id)}
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
                )}
              </CardContent>
            </Card>

            {/* Create/Edit Exit Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
              <DialogContent className="sm:copilot-max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingExit ? 'Editar Salida' : 'Nueva Salida de Inventario'}</DialogTitle>
                  <DialogDescription>
                    {editingExit ? 'Modifica los datos de la salida' : 'Registra una nueva salida de productos del inventario'}
                  </DialogDescription>
                </DialogHeader>

                <div className="copilot-space-y-4">
                  <div className="copilot-space-y-2">
                    <Label htmlFor="product" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Producto</Label>
                    <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })} disabled={!!editingExit}>
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
                    <Label htmlFor="destination" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Destino</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="Cliente, ubicación, etc."
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                  </div>

                  <div className="copilot-space-y-2">
                    <Label htmlFor="reason" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Motivo</Label>
                    <Select value={formData.reason} onValueChange={(value: any) => setFormData({ ...formData, reason: value })}>
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
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      resetForm()
                    }}
                    className="copilot-h-10 copilot-rounded-copilot"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={editingExit ? handleUpdateExit : handleCreateExit}
                    disabled={!formData.productId || !formData.quantity || parseFloat(formData.quantity) <= 0}
                    className="copilot-h-10 copilot-rounded-copilot"
                  >
                    {editingExit ? 'Actualizar Salida' : 'Crear Salida'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la salida y se restaurará la cantidad en el inventario.
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