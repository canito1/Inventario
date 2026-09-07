'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Package, AlertTriangle, Plus, Search, Eye, Edit2, Trash2, Copy, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryMobileCard } from "@/components/InventoryMobileCard"
import { ProductImage } from "@/components/ProductImage"
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { Item, itemsService } from "@/lib/items"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type ItemRow = Item

interface InventoryDataTableProps {
  data?: Item[]
  loading?: boolean
  showHeader?: boolean
  onAdd?: () => void
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onViewDetails?: (item: Item) => void
}

export default function InventoryDataTable({
  data: externalData,
  loading: externalLoading,
  showHeader = true,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails
}: InventoryDataTableProps = {}) {
  const [internalData, setInternalData] = React.useState<Item[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    description: false,
    barcode: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [internalLoading, setInternalLoading] = React.useState(true)
  const { toast } = useToast()

  const data = externalData || internalData
  const loading = externalLoading !== undefined ? externalLoading : internalLoading

  // Load data if not provided externally
  React.useEffect(() => {
    if (!externalData) {
      loadData()
    }
  }, [externalData])

  const loadData = async () => {
    try {
      setInternalLoading(true)
      const response = await itemsService.getItems({ limit: 1000 })
      setInternalData(response.items)
    } catch (error) {
      console.error('Error loading items:', error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setInternalLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "✅ Copiado",
        description: `${label} copiado al portapapeles`,
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<ItemRow>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
            <div className="font-medium truncate">{row.getValue("name")}</div>
            {row.original.barcode && (
              <div className="copilot-text-xs copilot-text-muted copilot-font-mono">
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
        <div className="max-w-xs truncate copilot-text-sm copilot-text-muted" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.original.category
        const categoryName = typeof category === 'string' ? category : category?.name || 'Sin categoría'
        return (
          <Badge variant="outline" size="sm" className="copilot-bg-muted copilot-border-border">
            <span className="hidden sm:inline mr-0.5">📂 </span>
            {categoryName}
          </Badge>
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
        const minStock = row.original.minStock || 0
        const isLowStock = quantity <= minStock
        const isOutOfStock = quantity === 0

        return (
          <div className="flex items-center space-x-2">
            <span className={cn(
              "font-medium",
              isOutOfStock ? 'text-destructive' :
              isLowStock ? 'text-warning' :
              'text-success'
            )}>
              {quantity}
            </span>
            {isLowStock && !isOutOfStock && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        )
      },
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
          currency={row.original.currency}
        />
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <span className="copilot-text-xs copilot-bg-muted copilot-px-2 copilot-py-1 copilot-rounded-copilot">
          {row.getValue("location") || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusConfig = {
          active: { label: 'Activo', icon: '✅', className: "copilot-bg-success/10 text-success copilot-border-success/20" },
          inactive: { label: 'Inactivo', icon: '⏸️', className: "copilot-bg-muted copilot-text-muted copilot-border-border" },
          discontinued: { label: 'Descontinuado', icon: '🚫', className: "copilot-bg-destructive/10 text-destructive copilot-border-destructive/20" }
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
        return (
          <Badge variant="outline" size="sm" className={config.className}>
            <span className="mr-0.5">{config.icon}</span>
            <span className="hidden xs:inline">{config.label}</span>
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const item = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => copyToClipboard(item._id, "ID")}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID
              </DropdownMenuItem>
              {item.barcode && (
                <DropdownMenuItem onClick={() => copyToClipboard(item.barcode!, "Código de barras")}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [onViewDetails, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (loading) {
    return (
      <div className="w-full">
        <div className="copilot-flex copilot-items-center copilot-justify-center copilot-h-64">
          <div className="text-center">
            <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin mx-auto" />
            <p className="copilot-mt-2 copilot-text-sm copilot-text-muted">Cargando inventario...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {showHeader && (
        <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-items-center sm:copilot-justify-between copilot-gap-4">
          <div>
            <h2 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Productos</h2>
            <p className="copilot-text-muted">
              Gestiona tu catálogo de productos ({data.length} total)
            </p>
          </div>
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo Producto</span>
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="copilot-text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 copilot-text-muted h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10"
            />
          </div>

          {/* Desktop-only controls */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="copilot-flex copilot-items-center copilot-space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Columnas
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile view - show cards */}
      <div className="block sm:hidden">
        {table.getRowModel().rows?.length ? (
          <div className="space-y-3">
            {table.getRowModel().rows.map((row) => (
              <InventoryMobileCard
                key={row.original._id}
                item={row.original}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center copilot-py-8">
            <Package className="mx-auto copilot-h-12 copilot-w-12 copilot-text-muted" />
            <h3 className="copilot-mt-2 copilot-text-sm copilot-font-medium copilot-text-foreground">No hay productos</h3>
            <p className="copilot-mt-1 copilot-text-sm copilot-text-muted">Comienza agregando un nuevo producto.</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block copilot-rounded-copilot copilot-border copilot-border-border copilot-overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original._id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="copilot-h-24 text-center"
                >
                  <div className="copilot-flex copilot-flex-col copilot-items-center copilot-justify-center copilot-py-8">
                    <Package className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mb-4" />
                    <h3 className="copilot-text-lg copilot-font-medium copilot-text-foreground copilot-mb-2">No hay productos</h3>
                    <p className="copilot-text-sm copilot-text-muted copilot-mb-4">Comienza agregando un nuevo producto al inventario.</p>
                    {onAdd && (
                      <Button onClick={onAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Producto
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-items-center copilot-justify-between copilot-gap-4">
        <div className="copilot-flex copilot-items-center copilot-space-x-2 copilot-text-sm">
          <p className="copilot-text-muted">
            Mostrando{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
            a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} productos
          </p>
        </div>

        <div className="copilot-flex copilot-items-center copilot-space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Selection info */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="copilot-flex copilot-items-center copilot-justify-between copilot-p-4 copilot-bg-muted copilot-rounded-copilot">
          <div className="copilot-text-sm copilot-text-muted">
            {Object.keys(rowSelection).length} de {table.getFilteredRowModel().rows.length} producto(s) seleccionado(s)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRowSelection({})}
          >
            Limpiar selección
          </Button>
        </div>
      )}
    </div>
  )
}