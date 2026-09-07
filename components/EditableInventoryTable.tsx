'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Plus, 
  Package, 
  AlertTriangle,
  Search,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Item, itemsService, CreateItemData } from "@/lib/items"
import { Category, categoriesService } from "@/lib/categories"
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { CurrencySelector } from "@/components/CurrencySelector"
import { EditableInventoryMobileCard } from "@/components/EditableInventoryMobileCard"
import { Currency, DEFAULT_CURRENCY } from "@/lib/currency"

interface EditableInventoryTableProps {
  onDataChange?: () => void
}

interface EditingItem extends Omit<Partial<Item>, 'category'> {
  _id?: string
  isNew?: boolean
  isEditing?: boolean
  category?: string | { _id: string; name: string }
}

export default function EditableInventoryTable({ onDataChange }: EditableInventoryTableProps) {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingItems, setEditingItems] = useState<{ [key: string]: EditingItem }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemsResponse, categoriesResponse] = await Promise.all([
        itemsService.getItems({ limit: 100 }),
        categoriesService.getCategories()
      ])
      setItems(itemsResponse.items)
      setCategories(categoriesResponse)
      
      // Show success message only on initial load
      if (items.length === 0) {
        toast({
          title: "📦 Inventario cargado",
          description: `Se cargaron ${itemsResponse.items.length} productos y ${categoriesResponse.length} categorías desde la base de datos`,
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (item: Item) => {
    console.log('Starting to edit item:', item.name)
    console.log('Original item category:', item.category)
    
    // Extract category ID if it's an object
    const categoryId = typeof item.category === 'string' ? item.category : item.category?._id
    
    setEditingItems(prev => ({
      ...prev,
      [item._id]: {
        ...(item as unknown as EditingItem),
        category: categoryId, // Ensure category is always a string ID
        isEditing: true
      } as EditingItem
    }))
    
    toast({
      title: "✏️ Editando producto",
      description: `Editando "${item.name}"`,
    })
  }

  const cancelEditing = (itemId: string) => {
    setEditingItems(prev => {
      const newState = { ...prev }
      delete newState[itemId]
      return newState
    })
  }

  const addNewItem = () => {
    console.log('Adding new item')
    const newId = `new-${Date.now()}`
    setEditingItems(prev => ({
      ...prev,
      [newId]: {
        _id: newId,
        name: '',
        description: '',
        category: categories[0]?._id || '',
        quantity: 0,
        minStock: 0,
        price: 0,
        currency: DEFAULT_CURRENCY,
        location: 'Almacén General',
        status: 'active' as const,
        isNew: true,
        isEditing: true
      }
    }))

    toast({
      title: "➕ Creando nuevo producto",
      description: "Completa los campos requeridos (nombre y categoría) y haz clic en guardar para agregar el producto al inventario",
      duration: 4000,
    })
  }

  const updateEditingItem = (itemId: string, field: string, value: any) => {
    console.log(`Updating ${field} to ${value} for item ${itemId}`)
    setEditingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const saveItem = async (itemId: string) => {
    const editingItem = editingItems[itemId]
    if (!editingItem) return

    // Validación básica
    if (!editingItem.name?.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El nombre del producto es obligatorio. Por favor ingresa un nombre válido antes de guardar.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (!editingItem.category) {
      toast({
        title: "⚠️ Campo requerido",
        description: "Debes seleccionar una categoría para el producto antes de guardarlo.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (!editingItem.location?.trim()) {
      // Set default location if empty
      updateEditingItem(itemId, 'location', 'Almacén General')
    }

    // No maxStock validation needed anymore

    setSaving(prev => ({ ...prev, [itemId]: true }))

    // Show loading message
    toast({
      title: "⏳ Guardando...",
      description: `Guardando ${editingItem.name}`,
    })

    try {
      if (editingItem.isNew) {
        // Create new item
        const minStockValue = Math.max(0, editingItem.minStock || 0)
        
        // Ensure category is always a string ID
        const categoryId = typeof editingItem.category === 'string' 
          ? editingItem.category 
          : (editingItem.category?._id || '')

        const createData: CreateItemData = {
          name: editingItem.name.trim(),
          description: editingItem.description?.trim() || '',
          category: categoryId,
          quantity: Math.max(0, editingItem.quantity || 0),
          minStock: minStockValue,
          maxStock: Math.max(0, editingItem.maxStock || 0), // Added maxStock property
          price: Math.max(0, editingItem.price || 0),
          currency: editingItem.currency || DEFAULT_CURRENCY,
          location: editingItem.location?.trim() || 'Almacén General',
          status: editingItem.status || 'active'
        }
        
        console.log('Creating item with validated data:', createData)
        console.log('Stock validation - Min:', minStockValue)
        const newItem = await itemsService.createItem(createData)
        console.log('Item created:', newItem)
        
        toast({
          title: "🎉 ¡Producto creado exitosamente!",
          description: `"${createData.name}" se agregó al inventario con ${createData.quantity} unidades en ${createData.location}`,
          duration: 5000,
        })
      } else {
        // Update existing item
        const minStockValue = Math.max(0, editingItem.minStock ?? 0)
        
        // Ensure category is always a string ID
        const categoryId = typeof editingItem.category === 'string' 
          ? editingItem.category 
          : (editingItem.category?._id || '')

        const updateData: Partial<CreateItemData> = {
          name: editingItem.name?.trim() || '',
          description: editingItem.description?.trim() || '',
          category: categoryId,
          quantity: Math.max(0, editingItem.quantity ?? 0),
          minStock: minStockValue,
          price: Math.max(0, editingItem.price ?? 0),
          currency: editingItem.currency || DEFAULT_CURRENCY,
          location: editingItem.location?.trim() || 'Almacén General',
          status: editingItem.status || 'active'
        }
        
        console.log('=== UPDATE ITEM DEBUG ===')
        console.log('Original editing item:', editingItem)
        console.log('Category processing - Original:', editingItem.category, 'Processed:', categoryId)
        console.log('Stock processing:')
        console.log('  - Raw minStock:', editingItem.minStock)
        console.log('  - Calculated minStockValue:', minStockValue)
        console.log('Final updateData:', updateData)
        console.log('About to call itemsService.updateItem with:', { itemId, updateData })
        
        const updatedItem = await itemsService.updateItem(itemId, updateData)
        console.log('Item updated:', updatedItem)
        
        toast({
          title: "💾 ¡Producto actualizado exitosamente!",
          description: `Los cambios en "${updateData.name}" se guardaron en la base de datos`,
          duration: 4000,
        })
      }

      // Remove from editing state
      cancelEditing(itemId)
      
      // Reload data to ensure consistency
      await loadData()
      onDataChange?.()
      
    } catch (error: any) {
      console.error('Error saving item:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      toast({
        title: "💥 Error al guardar producto",
        description: `No se pudo guardar "${editingItem.name || 'el producto'}". ${errorMessage}. Verifica los datos e intenta nuevamente.`,
        variant: "destructive",
        duration: 8000,
      })
    } finally {
      setSaving(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const showDeleteConfirmation = (item: Item) => {
    // Toast de advertencia inicial
    toast({
      title: "⚠️ Confirmar eliminación",
      description: `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      duration: 4000,
    })
  }

  const deleteItem = async (itemId: string) => {
    const item = items.find(i => i._id === itemId)
    
    if (!item) {
      toast({
        title: "❌ Error",
        description: "No se pudo encontrar el producto a eliminar",
        variant: "destructive",
      })
      return
    }

    // Mostrar toast de advertencia primero
    showDeleteConfirmation(item)

    // Mejorar la confirmación con más detalles
    const confirmMessage = `🗑️ ELIMINAR PRODUCTO

📦 Nombre: ${item.name}
📝 Descripción: ${item.description || 'Sin descripción'}
📍 Ubicación: ${item.location}
📊 Stock actual: ${item.quantity} unidades
📉 Stock mínimo: ${item.minStock} unidades
💰 Precio: ${item.currency === 'USD' ? '$' : 'S/'} ${item.price}
🏷️ Categoría: ${typeof item.category === 'string' ? item.category : item.category.name}

⚠️ ADVERTENCIA: Esta acción eliminará permanentemente el producto del inventario y la base de datos.

¿Continuar con la eliminación?`

    if (!confirm(confirmMessage)) {
      // Toast de cancelación
      toast({
        title: "🛡️ Eliminación cancelada",
        description: `"${item.name}" está a salvo. No se realizaron cambios.`,
        duration: 3000,
      })
      return
    }

    setSaving(prev => ({ ...prev, [itemId]: true }))

    // Toast de inicio con más detalles
    toast({
      title: "🗑️ Eliminando producto...",
      description: `Eliminando "${item.name}" del inventario y la base de datos`,
      duration: 3000,
    })

    try {
      console.log('Deleting item:', itemId, 'Name:', item.name)
      await itemsService.deleteItem(itemId)
      console.log('Item deleted successfully')
      
      // Toast de éxito mejorado con más información
      toast({
        title: "🎉 ¡Producto eliminado exitosamente!",
        description: `"${item.name}" se eliminó permanentemente del inventario. Se liberaron ${item.quantity} unidades del stock.`,
        duration: 5000,
      })
      
      await loadData()
      onDataChange?.()
    } catch (error: any) {
      console.error('Error deleting item:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      
      // Toast de error mejorado
      toast({
        title: "💥 Error al eliminar producto",
        description: `No se pudo eliminar "${item.name}". ${errorMessage}. Intenta nuevamente o contacta al administrador.`,
        variant: "destructive",
        duration: 8000,
      })
    } finally {
      setSaving(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: 'Sin Stock', variant: 'destructive' as const, color: 'text-red-600' }
    if (quantity <= minStock) return { label: 'Stock Bajo', variant: 'secondary' as const, color: 'text-yellow-600' }
    return { label: 'En Stock', variant: 'default' as const, color: 'text-green-600' }
  }

  const renderEditableCell = (item: Item | EditingItem, field: string, type: 'text' | 'number' | 'select' = 'text') => {
    const itemId = item._id!
    const isEditing = editingItems[itemId]?.isEditing
    const editingItem = editingItems[itemId] || item

    if (!isEditing) {
      // Display mode
      switch (field) {
        case 'category':
          const categoryName = typeof item.category === 'string' 
            ? categories.find(c => c._id === item.category as string)?.name || (item.category as string)
            : (item.category as { _id: string; name: string })?.name || 'Sin categoría'
          return <Badge variant="outline" className="text-xs px-1 py-0">{categoryName}</Badge>
        case 'price':
          return (
            <CurrencyDisplay 
              amount={item.price || 0} 
              currency={item.currency || DEFAULT_CURRENCY}
              showConverter={false}
            />
          )
        case 'quantity':
          const stockStatus = getStockStatus(item.quantity || 0, item.minStock || 0)
          return (
            <div className={`flex items-center ${stockStatus.color}`}>
              {stockStatus.label === 'Sin Stock' && <AlertTriangle className="mr-1 h-4 w-4" />}
              {item.quantity}
            </div>
          )
        case 'status':
          const statusColors = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800", 
            discontinued: "bg-red-100 text-red-800"
          }
          const statusLabels = {
            active: 'Activo',
            inactive: 'Inactivo',
            discontinued: 'Descontinuado'
          }
          return (
            <Badge className={`${statusColors[item.status as keyof typeof statusColors]} text-xs px-1 py-0`}>
              {statusLabels[item.status as keyof typeof statusLabels]}
            </Badge>
          )
        default:
          return <span>{(item as any)[field] || '-'}</span>
      }
    }

    // Edit mode
    switch (type) {
      case 'number':
        const numValue = editingItem[field as keyof EditingItem]
        return (
          <Input
            type="number"
            value={typeof numValue === 'number' ? numValue : (typeof numValue === 'string' ? numValue : '')}
            onChange={(e) => updateEditingItem(itemId, field, parseFloat(e.target.value) || 0)}
            className="w-16 h-7 text-xs"
            min="0"
          />
        )
      case 'select':
        if (field === 'category') {
          return (
            <Select
              value={editingItem.category as string}
              onValueChange={(value) => updateEditingItem(itemId, 'category', value)}
            >
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id} className="text-xs">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
        if (field === 'status') {
          return (
            <Select
              value={editingItem.status}
              onValueChange={(value) => updateEditingItem(itemId, 'status', value)}
            >
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active" className="text-xs">Activo</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactivo</SelectItem>
                <SelectItem value="discontinued" className="text-xs">Descont.</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        break
      default:
        return (
          <Input
            value={editingItem[field as keyof EditingItem] as string || ''}
            onChange={(e) => updateEditingItem(itemId, field, e.target.value)}
            className="w-full min-w-[100px] h-7 text-xs"
          />
        )
    }
  }

  const renderPriceCell = (item: Item | EditingItem) => {
    const itemId = item._id!
    const isEditing = editingItems[itemId]?.isEditing
    const editingItem = editingItems[itemId] || item

    if (!isEditing) {
      return (
        <CurrencyDisplay 
          amount={item.price || 0} 
          currency={item.currency || DEFAULT_CURRENCY}
          showConverter={false}
        />
      )
    }

    return (
      <div className="flex items-center space-x-1">
        <Input
          type="number"
          value={editingItem.price || ''}
          onChange={(e) => updateEditingItem(itemId, 'price', parseFloat(e.target.value) || 0)}
          className="w-16 h-7 text-xs"
          min="0"
          step="0.01"
        />
        <CurrencySelector
          value={editingItem.currency || DEFAULT_CURRENCY}
          onValueChange={(currency) => updateEditingItem(itemId, 'currency', currency)}
          className="w-16 h-7 text-xs"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando inventario...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventario Editable
        </CardTitle>
        <CardDescription>
          Haz clic en editar para modificar productos directamente en la tabla
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Actions - Más compacto */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-sm">
              <Filter className="mr-1 h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="discontinued">Descontinuados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addNewItem} size="sm" className="w-full sm:w-auto h-8">
            <Plus className="mr-1 h-3 w-3" />
            Nuevo
          </Button>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-4">
          {filteredItems.map((item) => (
            <EditableInventoryMobileCard
              key={item._id}
              item={item}
              categories={categories}
            />
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos en el inventario'}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table - Más compacto */}
        <div className="hidden sm:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="py-2 text-xs font-medium">Nombre</TableHead>
                <TableHead className="py-2 text-xs font-medium">Descripción</TableHead>
                <TableHead className="py-2 text-xs font-medium">Categoría</TableHead>
                <TableHead className="py-2 text-xs font-medium w-20">Cant.</TableHead>
                <TableHead className="py-2 text-xs font-medium w-20">Min.</TableHead>
                <TableHead className="py-2 text-xs font-medium w-24">Precio</TableHead>
                <TableHead className="py-2 text-xs font-medium">Ubicación</TableHead>
                <TableHead className="py-2 text-xs font-medium w-20">Estado</TableHead>
                <TableHead className="py-2 text-xs font-medium text-right w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New items being edited */}
              {Object.entries(editingItems)
                .filter(([_, item]) => item.isNew)
                .map(([itemId, item]) => (
                  <TableRow key={itemId} className="bg-blue-50 h-10">
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'name')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'description')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'category', 'select')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'quantity', 'number')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'minStock', 'number')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderPriceCell(item)}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'location')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'status', 'select')}</TableCell>
                    <TableCell className="py-1 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          onClick={() => saveItem(itemId)}
                          disabled={!item.name || !item.category || saving[itemId]}
                          className="h-6 w-6 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEditing(itemId)}
                          disabled={saving[itemId]}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              
              {/* Existing items */}
              {filteredItems.map((item) => {
                const isEditing = editingItems[item._id]?.isEditing
                return (
                  <TableRow key={item._id} className={`h-10 ${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"}`}>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'name')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'description')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'category', 'select')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'quantity', 'number')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'minStock', 'number')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderPriceCell(item)}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'location')}</TableCell>
                    <TableCell className="py-1 text-xs">{renderEditableCell(item, 'status', 'select')}</TableCell>
                    <TableCell className="py-1 text-right">
                      <div className="flex justify-end space-x-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => saveItem(item._id)}
                              disabled={saving[item._id]}
                              className="h-6 w-6 p-0"
                            >
                              {saving[item._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelEditing(item._id)}
                              disabled={saving[item._id]}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(item)}
                              disabled={saving[item._id]}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteItem(item._id)}
                              disabled={saving[item._id]}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              {saving[item._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {filteredItems.length === 0 && Object.keys(editingItems).length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos en el inventario'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats - Más compacto */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold">{items.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="text-lg font-bold text-yellow-600">
              {items.filter(item => item.quantity <= item.minStock).length}
            </div>
            <div className="text-xs text-muted-foreground">Stock Bajo</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-lg font-bold text-red-600">
              {items.filter(item => item.quantity === 0).length}
            </div>
            <div className="text-xs text-muted-foreground">Sin Stock</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}