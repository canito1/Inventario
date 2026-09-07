'use client'

import * as React from "react"
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
import { ArrowUpDown, ChevronDown, Download, TrendingUp, TrendingDown, Calendar, User, Search, Filter } from "lucide-react"
import * as XLSX from 'xlsx'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
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
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { HistoryMobileCard } from "@/components/HistoryMobileCard"
import {
  ResponsiveTableProvider,
  MobileFirstTable
} from "@/components/ui/responsive-table"
import { DEFAULT_CURRENCY } from "@/lib/currency"

export interface HistoryEntry {
    id: string
    type: 'entrada' | 'salida'
    productName: string
    productSku: string
    quantity: number
    unitCost?: number
    totalCost: number
    reason: string
    supplier?: string
    destination?: string
    notes?: string
    createdAt: string
    createdBy: string
    currency?: 'PEN' | 'USD'
}

interface HistoryDataTableProps {
    data: HistoryEntry[]
    loading?: boolean
}

export default function HistoryDataTable({ data, loading = false }: HistoryDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "createdAt", desc: true }
    ])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        productSku: false,
        unitCost: false,
        notes: false,
    })
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState<string>('all')
    const { toast } = useToast()

    const filteredData = React.useMemo(() => {
        if (typeFilter === 'all') return data
        return data.filter(entry => entry.type === typeFilter)
    }, [data, typeFilter])


    const columns: ColumnDef<HistoryEntry>[] = React.useMemo(() => [
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
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.getValue("type") as string
                const isEntry = type === 'entrada'
                return (
                    <div className="copilot-flex copilot-items-center copilot-gap-2">
                        {isEntry ? (
                            <TrendingUp className="copilot-h-3 copilot-w-3 sm:copilot-h-4 sm:copilot-w-4 copilot-text-success" />
                        ) : (
                            <TrendingDown className="copilot-h-3 copilot-w-3 sm:copilot-h-4 sm:copilot-w-4 copilot-text-destructive" />
                        )}
                        <Badge
                            size="sm"
                            className={isEntry
                                ? "copilot-bg-success/10 copilot-text-success copilot-border copilot-border-success/20"
                                : "copilot-bg-destructive/10 copilot-text-destructive copilot-border copilot-border-destructive/20"
                            }
                        >
                            <span className="copilot-mr-0.5">{isEntry ? '📈' : '📉'}</span>
                            <span className="hidden xs:copilot-inline">{isEntry ? 'Entrada' : 'Salida'}</span>
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "productName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="copilot-h-auto copilot-p-0 copilot-font-normal copilot-hover:bg-transparent"
                >
                    Producto
                    <ArrowUpDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="copilot-min-w-0">
                    <div className="copilot-font-medium copilot-truncate">{row.getValue("productName")}</div>
                    {row.original.productSku && (
                        <div className="copilot-text-xs copilot-text-muted copilot-font-mono">
                            SKU: {row.original.productSku}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "productSku",
            header: "SKU",
            cell: ({ row }) => (
                <span className="copilot-font-mono copilot-text-xs">
                    {row.getValue("productSku")}
                </span>
            ),
        },
        {
            accessorKey: "quantity",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="copilot-h-auto copilot-p-0 copilot-font-normal copilot-hover:bg-transparent"
                >
                    Cantidad
                    <ArrowUpDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const quantity = row.getValue("quantity") as number
                const isEntry = row.original.type === 'entrada'
                const displayQuantity = isEntry ? `+${quantity}` : `-${quantity}`

                return (
                    <span className={`copilot-font-semibold ${isEntry ? 'copilot-text-success' : 'copilot-text-destructive'}`}>
                        {displayQuantity}
                    </span>
                )
            },
        },
        {
            accessorKey: "unitCost",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="copilot-h-auto copilot-p-0 copilot-font-normal copilot-hover:bg-transparent"
                >
                    Costo Unit.
                    <ArrowUpDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const unitCost = row.getValue("unitCost") as number
                return unitCost ? <CurrencyDisplay amount={unitCost} currency={DEFAULT_CURRENCY} /> : '-'
            },
        },
        {
            accessorKey: "totalCost",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="copilot-h-auto copilot-p-0 copilot-font-normal copilot-hover:bg-transparent"
                >
                    Total
                    <ArrowUpDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <CurrencyDisplay amount={row.getValue("totalCost")} currency={DEFAULT_CURRENCY} />
            ),
        },
        {
            accessorKey: "reason",
            header: "Motivo",
            cell: ({ row }) => (
                <Badge variant="outline" size="sm" className="copilot-border-border">
                    {row.getValue("reason")}
                </Badge>
            ),
        },
        {
            accessorKey: "supplier",
            header: "Proveedor",
            cell: ({ row }) => {
                const supplier = row.getValue("supplier") as string
                return supplier ? (
                    <span className="copilot-text-sm">{supplier}</span>
                ) : (
                    <span className="copilot-text-muted">-</span>
                )
            },
        },
        {
            accessorKey: "destination",
            header: "Destino",
            cell: ({ row }) => {
                const destination = row.getValue("destination") as string
                return destination ? (
                    <span className="copilot-text-sm">{destination}</span>
                ) : (
                    <span className="copilot-text-muted">-</span>
                )
            },
        },
        {
            accessorKey: "notes",
            header: "Notas",
            cell: ({ row }) => {
                const notes = row.getValue("notes") as string
                return notes ? (
                    <div className="copilot-max-w-xs copilot-truncate copilot-text-xs copilot-text-muted" title={notes}>
                        {notes}
                    </div>
                ) : (
                    <span className="copilot-text-muted">-</span>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="copilot-h-auto copilot-p-0 copilot-font-normal copilot-hover:bg-transparent"
                >
                    <Calendar className="copilot-mr-2 copilot-h-4 copilot-w-4" />
                    Fecha
                    <ArrowUpDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"))
                return (
                    <div className="copilot-text-sm">
                        <div>{date.toLocaleDateString('es-ES')}</div>
                        <div className="copilot-text-xs copilot-text-muted">
                            {date.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "createdBy",
            header: "Usuario",
            cell: ({ row }) => (
                <div className="copilot-flex copilot-items-center copilot-gap-2">
                    <User className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                    <span className="copilot-text-sm">{row.getValue("createdBy")}</span>
                </div>
            ),
        },
    ], [])


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
                pageSize: 15,
            },
        },
    })

    const exportToExcel = () => {
        const exportData = table.getFilteredRowModel().rows.map(row => {
            const entry = row.original
            return {
                'Tipo': entry.type === 'entrada' ? 'Entrada' : 'Salida',
                'Producto': entry.productName,
                'SKU': entry.productSku || '',
                'Cantidad': entry.type === 'entrada' ? `+${entry.quantity}` : `-${entry.quantity}`,
                'Costo Unitario': entry.unitCost || '',
                'Costo Total': entry.totalCost,
                'Motivo': entry.reason,
                'Proveedor': entry.supplier || '',
                'Destino': entry.destination || '',
                'Notas': entry.notes || '',
                'Fecha': new Date(entry.createdAt).toLocaleDateString('es-ES'),
                'Hora': new Date(entry.createdAt).toLocaleTimeString('es-ES'),
                'Usuario': entry.createdBy,
            }
        })

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Historial")
        XLSX.writeFile(wb, `historial_${new Date().toISOString().split('T')[0]}.xlsx`)

        toast({
            title: "📊 Exportación exitosa",
            description: `Se exportaron ${exportData.length} movimientos a Excel`,
        })
    }

    return (
        <ResponsiveTableProvider>
            <div className="copilot-w-full copilot-space-y-4">
                <Card className="copilot-border copilot-border-border">
                    <CardHeader className="copilot-pb-4">
                        <CardTitle className="copilot-text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="copilot-space-y-4">
                        <div className="copilot-relative">
                            <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted copilot-h-4 copilot-w-4" />
                            <Input
                                placeholder="Buscar por producto, usuario o notas..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(String(event.target.value))}
                                className="copilot-pl-10 copilot-h-10 copilot-rounded-copilot"
                            />
                        </div>

                        <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-gap-4">
                            <div className="copilot-flex-1">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="copilot-h-10 copilot-rounded-copilot">
                                        <SelectValue placeholder="Tipo de movimiento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los movimientos</SelectItem>
                                        <SelectItem value="entrada">📈 Solo Entradas</SelectItem>
                                        <SelectItem value="salida">📉 Solo Salidas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="hidden sm:copilot-flex copilot-items-center copilot-space-x-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="copilot-h-10 copilot-rounded-copilot">
                                            <Filter className="copilot-mr-2 copilot-h-4 copilot-w-4" />
                                            Columnas
                                            <ChevronDown className="copilot-ml-2 copilot-h-4 copilot-w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="copilot-w-48">
                                        {table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => {
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={column.id}
                                                        className="copilot-capitalize"
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

                                <Button variant="outline" onClick={exportToExcel} className="copilot-h-10 copilot-rounded-copilot">
                                    <Download className="copilot-mr-2 copilot-h-4 copilot-w-4" />
                                    Exportar
                                </Button>
                            </div>
                        </div>

                        <div className="sm:hidden">
                            <Button variant="outline" onClick={exportToExcel} className="copilot-w-full copilot-h-10 copilot-rounded-copilot">
                                <Download className="copilot-mr-2 copilot-h-4 copilot-w-4" />
                                Exportar a Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>


                <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-3 copilot-gap-4">
                    <Card className="copilot-border copilot-border-border">
                        <CardContent className="copilot-p-4">
                            <div className="copilot-flex copilot-items-center copilot-gap-2">
                                <TrendingUp className="copilot-h-4 copilot-w-4 copilot-text-success" />
                                <div>
                                    <p className="copilot-text-sm copilot-font-medium">Entradas</p>
                                    <p className="copilot-text-2xl copilot-font-bold copilot-text-success">
                                        {filteredData.filter(e => e.type === 'entrada').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="copilot-border copilot-border-border">
                        <CardContent className="copilot-p-4">
                            <div className="copilot-flex copilot-items-center copilot-gap-2">
                                <TrendingDown className="copilot-h-4 copilot-w-4 copilot-text-destructive" />
                                <div>
                                    <p className="copilot-text-sm copilot-font-medium">Salidas</p>
                                    <p className="copilot-text-2xl copilot-font-bold copilot-text-destructive">
                                        {filteredData.filter(e => e.type === 'salida').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="copilot-border copilot-border-border">
                        <CardContent className="copilot-p-4">
                            <div className="copilot-flex copilot-items-center copilot-gap-2">
                                <Calendar className="copilot-h-4 copilot-w-4 copilot-text-primary" />
                                <div>
                                    <p className="copilot-text-sm copilot-font-medium">Total</p>
                                    <p className="copilot-text-2xl copilot-font-bold copilot-text-primary">
                                        {filteredData.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <MobileFirstTable
                    data={filteredData}
                    columns={columns}
                    table={table}
                    loading={loading}
                    emptyMessage="No se encontraron movimientos"
                    renderMobileCard={(entry: HistoryEntry, index: number) => (
                        <HistoryMobileCard
                            key={entry.id}
                            entry={entry}
                            selected={table.getRow(index.toString())?.getIsSelected()}
                            onSelect={(selected) => table.getRow(index.toString())?.toggleSelected(selected)}
                        />
                    )}
                />

                <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-items-center copilot-justify-between copilot-gap-4">
                    <div className="copilot-flex copilot-items-center copilot-space-x-2">
                        <p className="copilot-text-sm copilot-text-muted">
                            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}{" "}
                            de {table.getFilteredRowModel().rows.length} movimientos
                        </p>
                    </div>

                    <div className="copilot-flex copilot-items-center copilot-space-x-2">
                        <div className="copilot-flex copilot-items-center copilot-space-x-2">
                            <p className="copilot-text-sm copilot-font-medium">Filas por página</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger className="copilot-h-8 copilot-w-[70px] copilot-rounded-copilot">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 15, 20, 30, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="copilot-flex copilot-items-center copilot-space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="hidden sm:copilot-flex copilot-h-8 copilot-rounded-copilot"
                            >
                                Primera
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="copilot-h-8 copilot-rounded-copilot"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="copilot-h-8 copilot-rounded-copilot"
                            >
                                Siguiente
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="hidden sm:copilot-flex copilot-h-8 copilot-rounded-copilot"
                            >
                                Última
                            </Button>
                        </div>
                    </div>
                </div>

                {Object.keys(rowSelection).length > 0 && (
                    <div className="copilot-flex copilot-items-center copilot-justify-between copilot-p-4 copilot-bg-muted copilot-rounded-copilot copilot-border copilot-border-border">
                        <div className="copilot-text-sm copilot-text-muted">
                            {Object.keys(rowSelection).length} de {table.getFilteredRowModel().rows.length} movimiento(s) seleccionado(s)
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowSelection({})}
                            className="copilot-h-8 copilot-rounded-copilot"
                        >
                            Limpiar selección
                        </Button>
                    </div>
                )}
            </div>
        </ResponsiveTableProvider>
    )
}