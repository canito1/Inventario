'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { Item } from '@/lib/items'
import { Package, MapPin, Barcode, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Item | null
}

export function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsDialogProps) {
  if (!product) return null

  const isLowStock = product.quantity <= product.minStock
  const stockPercentage = (product.quantity / product.maxStock) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="copilot-w-[95vw] copilot-max-w-[500px] copilot-max-h-[90vh] copilot-overflow-y-auto copilot-p-4 sm:copilot-p-6">
        <DialogHeader>
          <DialogTitle className="copilot-flex copilot-items-center copilot-gap-2 copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">
            <Package className="copilot-h-4 copilot-w-4 sm:copilot-h-5 sm:copilot-w-5" />
            <span className="truncate">{product.name}</span>
          </DialogTitle>
          <DialogDescription className="copilot-text-sm copilot-text-muted">
            Detalles completos del producto
          </DialogDescription>
        </DialogHeader>

        <div className="copilot-space-y-4">
          {/* Status and Category */}
          <div className="copilot-flex copilot-items-center copilot-justify-between">
            <Badge
              variant="outline"
              className={cn(
                product.status === 'active'
                  ? 'copilot-bg-success/10 text-success copilot-border-success/20 hover:copilot-bg-success/20'
                  : product.status === 'inactive'
                  ? 'copilot-bg-muted copilot-text-muted copilot-border-border hover:copilot-bg-muted/80'
                  : 'copilot-bg-destructive/10 text-destructive copilot-border-destructive/20 hover:copilot-bg-destructive/20'
              )}
            >
              {product.status === 'active' ? '✅ Activo' :
                product.status === 'inactive' ? '⏸️ Inactivo' : '🚫 Descontinuado'}
            </Badge>
            <Badge
              variant="outline"
              className="copilot-bg-muted copilot-border-border"
            >
              📂 {product.category.name}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2">Descripción</h4>
            <p className="copilot-text-sm copilot-text-muted">{product.description}</p>
          </div>

          <Separator />

          {/* Stock Information */}
          <div>
            <h4 className="copilot-text-sm copilot-font-medium copilot-mb-3">Información de Stock</h4>
            <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-4">
              <div className="copilot-space-y-1">
                <p className="copilot-text-xs copilot-text-muted">Cantidad Actual</p>
                <div className="copilot-flex copilot-items-center copilot-gap-2">
                  <span className={cn(
                    "copilot-text-lg copilot-font-semibold",
                    isLowStock ? 'text-destructive' : ''
                  )}>
                    {product.quantity}
                  </span>
                  {isLowStock && <AlertTriangle className="copilot-h-4 copilot-w-4 text-destructive" />}
                </div>
              </div>
              <div className="copilot-space-y-1">
                <p className="copilot-text-xs copilot-text-muted">Stock Mínimo</p>
                <p className="copilot-text-lg copilot-font-semibold">{product.minStock}</p>
              </div>
              <div className="copilot-space-y-1">
                <p className="copilot-text-xs copilot-text-muted">Stock Máximo</p>
                <p className="copilot-text-lg copilot-font-semibold">{product.maxStock}</p>
              </div>
              <div className="copilot-space-y-1">
                <p className="copilot-text-xs copilot-text-muted">Nivel de Stock</p>
                <div className="copilot-flex copilot-items-center copilot-gap-2">
                  <div className="copilot-flex-1 copilot-bg-muted copilot-rounded-full copilot-h-2">
                    <div
                      className={cn(
                        "copilot-h-2 copilot-rounded-full",
                        stockPercentage <= 20 ? 'copilot-bg-destructive' :
                        stockPercentage <= 50 ? 'copilot-bg-warning' : 'copilot-bg-success'
                      )}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="copilot-text-xs copilot-text-muted">
                    {stockPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price and Location */}
          <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-4">
            <div>
              <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2">Precio</h4>
              <CurrencyDisplay
                amount={product.price}
                currency={product.currency || 'PEN'}
                showConverter={true}
                className="copilot-text-xl copilot-font-bold"
              />
            </div>
            <div>
              <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2 copilot-flex copilot-items-center copilot-gap-1">
                <MapPin className="copilot-h-4 copilot-w-4" />
                Ubicación
              </h4>
              <p className="copilot-text-sm">{product.location}</p>
            </div>
          </div>

          {/* Barcode */}
          {product.barcode && (
            <>
              <Separator />
              <div>
                <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2 copilot-flex copilot-items-center copilot-gap-1">
                  <Barcode className="copilot-h-4 copilot-w-4" />
                  Código de Barras
                </h4>
                <p className="copilot-text-sm copilot-font-mono copilot-bg-muted copilot-p-2 copilot-rounded-copilot">
                  {product.barcode}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Dates */}
          <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-2 sm:copilot-gap-4 copilot-text-xs copilot-text-muted">
            <div className="copilot-flex copilot-items-center copilot-gap-1">
              <Calendar className="copilot-h-3 copilot-w-3" />
              <span>Creado: {new Date(product.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="copilot-flex copilot-items-center copilot-gap-1">
              <Calendar className="copilot-h-3 copilot-w-3" />
              <span>Actualizado: {new Date(product.updatedAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Value Calculation */}
          <div className="copilot-bg-primary/10 copilot-p-3 copilot-rounded-copilot copilot-border copilot-border-primary/20">
            <h4 className="copilot-text-sm copilot-font-medium copilot-mb-1">Valor Total en Stock</h4>
            <CurrencyDisplay
              amount={product.price * product.quantity}
              currency={product.currency || 'PEN'}
              showConverter={true}
              className="copilot-text-lg copilot-font-bold text-primary"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}