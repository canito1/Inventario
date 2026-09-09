'use client'

import { MoreHorizontal, AlertTriangle, Eye, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Item } from '@/lib/items'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { ProductImage } from '@/components/ProductImage'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardSection,
  MobileCardField,
  MobileCardActions
} from '@/components/ui/responsive-table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface InventoryMobileCardProps {
  item: Item
  onViewDetails?: (item: Item) => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function InventoryMobileCard({
  item,
  onViewDetails,
  selected = false,
  onSelect
}: InventoryMobileCardProps) {
  const { toast } = useToast()
  const isLowStock = item.quantity <= item.minStock
  const isOutOfStock = item.quantity === 0

  const getStatusBadge = () => {
    const statusConfig = {
      active:       { label: 'Activo',        icon: '✅', className: "bg-[#01712b]/10 text-[#6cc57b] border-[#01712b]/20" },
      inactive:     { label: 'Inactivo',      icon: '⏸️', className: "bg-muted text-muted-foreground border-border" },
      discontinued: { label: 'Descontinuado', icon: '🚫', className: "bg-[#ac1922]/10 text-[#ac1922] border-[#ac1922]/20" },
    }
    const config = statusConfig[item.status] || statusConfig.active
    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        <span className="mr-0.5">{config.icon}</span>
        <span className="hidden xs:inline">{config.label}</span>
      </Badge>
    )
  }

  const getStockBadge = () => {
    if (isOutOfStock) {
      return (
        <Badge variant="outline" className="text-xs bg-[#ac1922]/10 text-[#ac1922] border-[#ac1922]/20">
          <span className="mr-0.5">🚫</span>
          <span className="hidden xs:inline">Sin Stock</span>
        </Badge>
      )
    }
    if (isLowStock) {
      return (
        <Badge variant="outline" className="text-xs bg-[#f3c357]/10 text-[#f3c357] border-[#f3c357]/20">
          <span className="mr-0.5">⚠️</span>
          <span className="hidden xs:inline">Stock Bajo</span>
        </Badge>
      )
    }
    return null
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "✅ Copiado",
        description: `${label} copiado al portapapeles`,
        duration: 2000,
      })
    } catch {
      toast({
        title: "❌ Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  const stockPercentage = item.minStock > 0
    ? Math.max(0, Math.min(100, (item.quantity / item.minStock) * 100))
    : 100

  return (
    <MobileCard
      selected={selected}
      onClick={onSelect ? () => onSelect(!selected) : undefined}
      className={cn(
        isOutOfStock ? "border-l-4 border-l-[#ac1922]" :
        isLowStock   ? "border-l-4 border-l-[#f3c357]" : ""
      )}
    >
      <MobileCardHeader
        title={item.name}
        subtitle={item.description}
        icon={
          <div className="relative">
            <ProductImage
              src={item.image}
              alt={item.name}
              size="sm"
              className="w-10 h-10 rounded-[8px]"
            />
            {(isLowStock || isOutOfStock) && (
              <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-[#f3c357]" />
            )}
          </div>
        }
        badge={
          <div className="flex items-center gap-1">
            {getStockBadge()}
            {getStatusBadge()}
          </div>
        }
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 w-8 flex items-center justify-center rounded-[8px] text-[#9da8d9] hover:bg-[#3b3b3b] hover:text-white transition-colors"
                aria-label="Abrir menú"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1c2437] border-[#3b3b3b]">
              <DropdownMenuLabel className="text-[#9da8d9] text-xs uppercase tracking-wider">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#3b3b3b]" />
              {onViewDetails && (
                <DropdownMenuItem
                  onClick={() => onViewDetails(item)}
                  className="text-white hover:bg-[#3b3b3b] focus:bg-[#3b3b3b] cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => copyToClipboard(item._id, "ID")}
                className="text-white hover:bg-[#3b3b3b] focus:bg-[#3b3b3b] cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID
              </DropdownMenuItem>
              {item.barcode && (
                <DropdownMenuItem
                  onClick={() => copyToClipboard(item.barcode!, "Código de barras")}
                  className="text-white hover:bg-[#3b3b3b] focus:bg-[#3b3b3b] cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <MobileCardSection>
        <MobileCardField
          label="Categoría"
          value={
            <Badge variant="outline" className="text-xs bg-[#1c2437] border-[#3b3b3b] text-[#9da8d9]">
              <span className="mr-0.5">📂</span>
              {typeof item.category === 'string' ? item.category : item.category.name}
            </Badge>
          }
        />

        <MobileCardField
          label="Stock"
          value={
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-semibold",
                isOutOfStock ? "text-[#ac1922]" :
                isLowStock   ? "text-[#f3c357]" :
                               "text-[#6cc57b]"
              )}>
                {item.quantity}
              </span>
              <span className="text-[#9da8d9] text-sm">/ {item.minStock} mín</span>
            </div>
          }
        />

        {/* Stock progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#9da8d9]">
            <span>Nivel de stock</span>
            <span>{Math.round(stockPercentage)}%</span>
          </div>
          <div className="w-full bg-[#3b3b3b] rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isOutOfStock ? "bg-[#ac1922]" :
                isLowStock   ? "bg-[#f3c357]" :
                               "bg-[#6cc57b]"
              )}
              style={{ width: `${Math.max(5, stockPercentage)}%` }}
            />
          </div>
        </div>

        <MobileCardField
          label="Precio"
          value={<CurrencyDisplay amount={item.price} currency={item.currency} />}
        />

        <MobileCardField
          label="Ubicación"
          value={
            <span className="text-xs bg-[#1c2437] border border-[#3b3b3b] px-2 py-1 rounded-[8px] text-[#9da8d9]">
              {item.location}
            </span>
          }
        />

        {item.barcode && (
          <MobileCardField
            label="Código"
            value={
              <span className="font-mono text-xs text-[#9da8d9]">{item.barcode}</span>
            }
          />
        )}
      </MobileCardSection>

      {onViewDetails && (
        <MobileCardActions>
          <button
            className="copilot-btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
            onClick={() => onViewDetails(item)}
          >
            <Eye className="h-4 w-4" />
            Ver detalles
          </button>
        </MobileCardActions>
      )}
    </MobileCard>
  )
}
