'use client'

import { AlertTriangle, Eye, ShoppingCart, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { ProductImage } from '@/components/ProductImage'
import { Item } from '@/lib/items'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardSection,
  MobileCardField,
  MobileCardActions
} from '@/components/ui/responsive-table'
import { cn } from '@/lib/utils'

interface LowStockMobileCardProps {
  product: Item
  onRestock?: (productId: string) => void
  onViewDetails?: (productId: string) => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function LowStockMobileCard({
  product,
  onRestock,
  onViewDetails,
  selected = false,
  onSelect
}: LowStockMobileCardProps) {
  const isOutOfStock = product.quantity === 0
  const isCritical = product.quantity > 0 && product.quantity <= Math.floor(product.minStock * 0.2)
  const isLow = product.quantity > Math.floor(product.minStock * 0.2) && product.quantity <= product.minStock

  const getStatusConfig = () => {
    if (isOutOfStock) {
      return {
        label:         'Sin Stock',
        icon:          '🚫',
        badgeClass:    'bg-[#ac1922]/10 text-[#ac1922] border-[#ac1922]/20',
        borderClass:   'border-l-[#ac1922]',
        progressClass: 'bg-[#ac1922]',
        textClass:     'text-[#ac1922]',
        bgClass:       'bg-[#ac1922]/5',
      }
    }
    if (isCritical) {
      return {
        label:         'Crítico',
        icon:          '⚠️',
        badgeClass:    'bg-[#f3c357]/10 text-[#f3c357] border-[#f3c357]/20',
        borderClass:   'border-l-[#f3c357]',
        progressClass: 'bg-[#f3c357]',
        textClass:     'text-[#f3c357]',
        bgClass:       '',
      }
    }
    return {
      label:         'Stock Bajo',
      icon:          '📉',
      badgeClass:    'bg-[#f3c357]/10 text-[#f3c357] border-[#f3c357]/20',
      borderClass:   'border-l-[#f3c357]',
      progressClass: 'bg-[#f3c357]',
      textClass:     'text-[#f3c357]',
      bgClass:       '',
    }
  }

  const config = getStatusConfig()
  const stockPercentage = product.minStock > 0
    ? Math.max(0, Math.min(100, (product.quantity / product.minStock) * 100))
    : 0
  const urgencyLabel = isOutOfStock ? 'URGENTE' : isCritical ? 'ALTA' : 'MEDIA'

  return (
    <MobileCard
      selected={selected}
      onClick={onSelect ? () => onSelect(!selected) : undefined}
      className={cn("border-l-4", config.borderClass, config.bgClass)}
    >
      <MobileCardHeader
        title={product.name}
        subtitle={product.description}
        icon={
          <div className="relative">
            <ProductImage
              src={product.image}
              alt={product.name}
              size="sm"
              className="w-10 h-10 rounded-[8px]"
            />
            <div className="absolute -top-1 -right-1">
              {isOutOfStock ? (
                <div className="bg-[#ac1922] text-white rounded-full p-0.5">
                  <AlertTriangle className="h-3 w-3" />
                </div>
              ) : (
                <div className="bg-[#f3c357] text-black rounded-full p-0.5">
                  <TrendingDown className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        }
        badge={
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
              <span className="mr-0.5">{config.icon}</span>
              <span className="hidden xs:inline">{config.label}</span>
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#3b3b3b]/40 text-[#9da8d9] border-[#3b3b3b]">
              {urgencyLabel}
            </Badge>
          </div>
        }
      />

      <MobileCardSection>
        <MobileCardField
          label="Stock actual"
          value={
            <div className="flex items-center gap-2">
              <span className={cn("font-bold text-lg", config.textClass)}>
                {product.quantity}
              </span>
              <span className="text-[#9da8d9] text-sm">
                / {product.minStock} mín
              </span>
            </div>
          }
        />

        {/* Stock progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#9da8d9]">
            <span>Nivel de stock</span>
            <span>{Math.round(stockPercentage)}%</span>
          </div>
          <div className="w-full bg-[#3b3b3b] rounded-full h-3">
            <div
              className={cn("h-3 rounded-full transition-all duration-300", config.progressClass)}
              style={{ width: `${Math.max(3, stockPercentage)}%` }}
            />
          </div>
          {isOutOfStock && (
            <p className="text-xs font-medium text-[#ac1922]">
              ⚠️ Producto agotado — restock inmediato requerido
            </p>
          )}
        </div>

        <MobileCardField
          label="Categoría"
          value={
            <Badge variant="outline" className="text-xs bg-[#ffb4ad]/10 text-[#ffb4ad] border-[#ffb4ad]/20">
              <span className="mr-0.5">📂</span>
              {typeof product.category === 'string' ? product.category : product.category.name}
            </Badge>
          }
        />

        <MobileCardField
          label="Precio"
          value={<CurrencyDisplay amount={product.price} currency={product.currency} />}
        />

        <MobileCardField
          label="Ubicación"
          value={
            <span className="text-xs bg-[#1c2437] border border-[#3b3b3b] px-2 py-1 rounded-[8px] text-[#9da8d9]">
              {product.location}
            </span>
          }
        />

        {product.barcode && (
          <MobileCardField
            label="Código"
            value={
              <span className="font-mono text-xs text-[#9da8d9]">{product.barcode}</span>
            }
          />
        )}

        {/* Restock recommendation */}
        <div className="pt-2 border-t border-[#3b3b3b] space-y-1">
          <MobileCardField
            label="Stock máximo"
            value={
              <span className="font-medium text-[#6cc57b]">{product.maxStock}</span>
            }
          />
          <MobileCardField
            label="Restock sugerido"
            value={
              <span className="font-medium text-[#ffb4ad]">
                +{Math.max(0, product.maxStock - product.quantity)} unidades
              </span>
            }
          />
        </div>
      </MobileCardSection>

      <MobileCardActions>
        {onViewDetails && (
          <button
            className="copilot-btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
            onClick={() => onViewDetails(product._id)}
          >
            <Eye className="h-4 w-4" />
            Ver detalles
          </button>
        )}
        {onRestock && (
          <button
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-sm rounded-[8px] px-4 py-2 font-medium transition-opacity",
              isOutOfStock
                ? "bg-[#ac1922] text-white hover:opacity-90"
                : "copilot-btn-primary"
            )}
            onClick={() => onRestock(product._id)}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'Restock URGENTE' : 'Reabastecer'}
          </button>
        )}
      </MobileCardActions>
    </MobileCard>
  )
}
