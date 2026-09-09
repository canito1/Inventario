'use client'

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Package,
  Eye,
  Copy,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react"
import * as XLSX from 'xlsx'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Item, itemsService } from "@/lib/items"
import { Category, categoriesService } from "@/lib/categories"
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { ProductImage } from "@/components/ProductImage"
import { InventoryMobileCard } from "@/components/InventoryMobileCard"
import {
  ResponsiveTableProvider,
  MobileFirstTable
} from "@/components/ui/responsive-table"
import { Currency, DEFAULT_CURRENCY } from "@/lib/currency"

interface AdvancedInventoryTableProps {
  data?: Item[]
  loading?: boolean
  showHeader?: boolean
  onAdd?: () => void
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onViewDetails?: (item: Item) => void
}

const statusLabels: Record<Item['status'], string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  discontinued: 'Descontinuado',
}

const columnLabels: Record<string, string> = {
  name: 'Producto',
  description: 'Descripción',
  'category.name': 'Categoría',
  quantity: 'Stock',
  minStock: 'Stock mínimo',
  price: 'Precio',
  location: 'Ubicación',
  status: 'Estado',
}

const inventoryGlobalFilter = (row: any, _columnId: string, filterValue: string) => {
  const item = row.original as Item
  const categoryName = typeof item.category === 'string' ? item.category : item.category?.name || ''
  const searchableText = [
    item.name,
    item.description,
    categoryName,
    item.location,
    item.barcode,
    statusLabels[item.status],
  ].join(' ').toLowerCase()

  return searchableText.includes(String(filterValue).toLowerCase().trim())
}

export default function AdvancedInventoryTable({
  data: externalData,
  loading: externalLoading,
  showHeader = true,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails
}: AdvancedInventoryTableProps = {}) {
  const [internalData, setInternalData] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    minStock: false,
    location: false,
  })
  const [rowSelection, setRowSelection] = useState({})
  const [internalLoading, setInternalLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const { toast } = useToast()

  const data = externalData || internalData
  const loading = externalLoading !== undefined ? externalLoading : internalLoading

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!externalData) {
      loadData()
    } else {
      loadCategories()
    }
  }, [externalData])

  const loadCategories = async () => {
    try {
      const categoriesResponse = await categoriesService.getCategories()
      setCategories(categoriesResponse)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadData = useCallback(async () => {
    try {
      setInternalLoading(true)
      const [itemsResponse, categoriesResponse] = await Promise.all([
        itemsService.getItems({ limit: 1000 }),
        categoriesService.getCategories()
      ])
      setInternalData(itemsResponse.items)
      setCategories(categoriesResponse)
      toast({
        title: "📦 Datos cargados",
        description: `${itemsResponse.items.length} productos cargados`,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setInternalLoading(false)
    }
  }, [toast])

  const filteredData = useMemo(() => {
    let filtered = data
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => {
        const categoryId = typeof item.category === 'string' ? item.category : item.category._id
        return categoryId === categoryFilter
      })
    }
    return filtered
  }, [data, statusFilter, categoryFilter])

  const columns: ColumnDef<Item>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-normal hover:bg-transparent"
        >
          <Package className="mr-2 h-4 w-4" />
          Producto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <ProductImage
            src={row.original.image}
            alt={row.getValue("name")}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-medium truncate text-foreground">{row.getValue("name")}</div>
            {row.original.barcode && (
              <div className="text-xs text-muted-foreground font-mono">
                {row.original.barcode}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-muted-foreground" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.original.category
        const categoryName = typeof category === 'string' ? category : category.name
        return (
          <span className="text-sm text-foreground">
            {categoryName}
          </span>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-normal hover:bg-transparent"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number
        const minStock = row.original.minStock
        const isLowStock = quantity <= minStock
        const isOutOfStock = quantity === 0
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${
              isOutOfStock ? 'text-destructive' :
              isLowStock  ? 'text-warning' :
                            'text-success'
            }`}>
              {quantity}
            </span>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "minStock",
      header: "Stock Mín",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.getValue("minStock")}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-normal hover:bg-transparent"
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={row.getValue("price")}
          currency={row.original.currency || DEFAULT_CURRENCY}
        />
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.getValue("location")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusConfig = {
          active:       { label: 'Activo',        icon: '✅', className: "bg-success/10 text-success border-success/20" },
          inactive:     { label: 'Inactivo',      icon: '⏸️', className: "bg-muted text-muted-foreground border-border" },
          discontinued: { label: 'Descontinuado', icon: '🚫', className: "bg-destructive/10 text-destructive border-destructive/20" },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
        return <span className={`text-sm font-medium ${config.className.includes('destructive') ? 'text-destructive' : config.className.includes('success') ? 'text-success' : 'text-muted-foreground'}`}>{config.label}</span>
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Acciones del producto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground">
            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onViewDetails, onEdit, onDelete, toast])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: inventoryGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  const exportToExcel = () => {
    const exportData = table.getFilteredRowModel().rows.map(row => {
      const item = row.original
      return {
        'Producto':         item.name,
        'Descripción':      item.description,
        'Categoría':        typeof item.category === 'string' ? item.category : item.category.name,
        'Stock':            item.quantity,
        'Stock Mínimo':     item.minStock,
        'Stock Máximo':     item.maxStock,
        'Precio':           item.price,
        'Moneda':           item.currency,
        'Ubicación':        item.location,
        'Código de Barras': item.barcode || '',
        'Estado':           item.status,
        'Creado':           new Date(item.createdAt).toLocaleDateString(),
      }
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast({
      title: "📊 Exportación exitosa",
      description: `Se exportaron ${exportData.length} productos a Excel`,
    })
  }

  if (!mounted) return null

  return (
    <ResponsiveTableProvider>
      <div className="w-full space-y-4">

        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground leading-tight">
                Inventario
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona tu inventario de productos
              </p>
            </div>
          </div>
        )}

        {/* Filters card */}
        <div className="copilot-card space-y-4">
          <h3 className="text-base font-medium text-foreground">Filtros</h3>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="copilot-input pl-10"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="copilot-input">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all"  className="hover:bg-muted focus:bg-muted">Todos los estados</SelectItem>
                  <SelectItem value="active"       className="hover:bg-muted focus:bg-muted">✅ Activo</SelectItem>
                  <SelectItem value="inactive"     className="hover:bg-muted focus:bg-muted">⏸️ Inactivo</SelectItem>
                  <SelectItem value="discontinued" className="hover:bg-muted focus:bg-muted">🚫 Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="copilot-input">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all" className="hover:bg-muted focus:bg-muted">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id}
                      value={category._id}
                      className="hover:bg-muted focus:bg-muted"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="copilot-btn-ghost flex items-center gap-2 border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground">
                    <Filter className="h-4 w-4 text-foreground" />
                    Columnas
                    <ChevronDown className="h-4 w-4 text-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border bg-popover p-1 text-popover-foreground shadow-lg">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize text-popover-foreground hover:bg-muted focus:bg-muted focus:text-foreground"
                        checked={col.getIsVisible()}
                        onCheckedChange={(value) => col.toggleVisibility(!!value)}
                      >
                        {columnLabels[col.id] || col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="copilot-btn-ghost flex items-center gap-2 px-3 py-2 text-sm" onClick={exportToExcel}>
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Mobile export */}
          <div className="sm:hidden">
            <button
              className="copilot-btn-ghost w-full flex items-center justify-center gap-2"
              onClick={exportToExcel}
            >
              <Download className="h-4 w-4" />
              Exportar a Excel
            </button>
          </div>
        </div>

        {/* Table / Mobile cards */}
        <MobileFirstTable
          data={filteredData}
          columns={columns}
          table={table}
          loading={loading}
          emptyMessage="No se encontraron productos"
          renderMobileCard={(item: Item, index: number) => (
            <InventoryMobileCard
              key={item._id}
              item={item}
              onViewDetails={onViewDetails}
              selected={table.getRow(index.toString())?.getIsSelected()}
              onSelect={(selected) => table.getRow(index.toString())?.toggleSelected(selected)}
            />
          )}
        />

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} productos
          </p>

          <div className="flex items-center gap-4">
            {/* Page size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filas</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-[70px] copilot-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top" className="bg-popover border-border text-popover-foreground">
                  {[5, 10, 20, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={`${n}`} className="hover:bg-muted">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page nav */}
            <div className="flex items-center gap-1">
              <button
                className="copilot-btn-ghost hidden sm:flex px-3 py-1 text-sm disabled:opacity-40"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                Primera
              </button>
              <button
                className="copilot-btn-ghost px-3 py-1 text-sm disabled:opacity-40"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </button>
              <button
                className="copilot-btn-ghost px-3 py-1 text-sm disabled:opacity-40"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </button>
              <button
                className="copilot-btn-ghost hidden sm:flex px-3 py-1 text-sm disabled:opacity-40"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                Última
              </button>
            </div>
          </div>
        </div>

        {/* Row selection info */}
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[8px]">
            <span className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s)
            </span>
            <button
              className="copilot-btn-ghost px-3 py-1 text-sm"
              onClick={() => setRowSelection({})}
            >
              Limpiar selección
            </button>
          </div>
        )}

      </div>
    </ResponsiveTableProvider>
  )
}
