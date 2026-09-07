'use client'

import { useState } from 'react'
import { Package, Plus, Minus, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Item } from '@/lib/items'

interface RestockDialogProps {
  product: Item | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestock: (productId: string, quantity: number, cost: number) => void
}

export function RestockDialog({
  product,
  open,
  onOpenChange,
  onRestock
}: RestockDialogProps) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(0)
  const [unitCost, setUnitCost] = useState(0)
  const [loading, setLoading] = useState(false)

  if (!product) return null

  const suggestedQuantity = Math.max(0, product.minStock - product.quantity + 10)
  const totalCost = quantity * unitCost
  const newStock = product.quantity + quantity
  const isValidQuantity = quantity > 0

  const handleRestock = async () => {
    if (!isValidQuantity) return

    setLoading(true)
    try {
      await onRestock(product._id, quantity, totalCost)
      toast({
        title: '✅ Stock actualizado',
        description: `Se agregaron ${quantity} unidades a ${product.name}. Nuevo stock: ${newStock}`,
        variant: 'default'
      })
      onOpenChange(false)
      setQuantity(0)
      setUnitCost(0)
    } catch (error: any) {
      console.error('Error restocking product:', error)
      toast({
        title: '❌ Error al actualizar stock',
        description: error.response?.data?.message || 'No se pudo actualizar el stock',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(0, quantity + delta))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Sin Stock</Badge>
      case 'critical':
        return <Badge variant="secondary" className="copilot-bg-warning/10 copilot-text-warning copilot-border copilot-border-warning/20">Crítico</Badge>
      case 'low':
        return <Badge variant="outline" className="copilot-border-warning/30 copilot-text-warning">Bajo</Badge>
      default:
        return <Badge variant="default">Normal</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="copilot-flex copilot-items-center copilot-gap-2">
            <Package className="copilot-h-5 copilot-w-5" />
            Reabastecer Producto
          </DialogTitle>
          <DialogDescription>
            Agregar stock al inventario del producto seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="copilot-space-y-4">
          {/* Product Info */}
          <div className="copilot-bg-muted copilot-p-4 copilot-rounded-copilot copilot-space-y-2">
            <div className="copilot-flex copilot-justify-between copilot-items-start">
              <div>
                <h3 className="copilot-font-medium">{product.name}</h3>
                <p className="copilot-text-sm copilot-text-muted">{product.barcode || product._id.slice(-8)}</p>
              </div>
              {getStatusBadge(product.status)}
            </div>

            <div className="copilot-grid copilot-grid-cols-2 copilot-gap-4 copilot-text-sm">
              <div>
                <span className="copilot-text-muted">Stock actual:</span>
                <span className={`copilot-ml-2 copilot-font-medium ${product.quantity === 0 ? 'copilot-text-destructive' : ''}`}>
                  {product.quantity}
                </span>
              </div>
              <div>
                <span className="copilot-text-muted">Stock mínimo:</span>
                <span className="copilot-ml-2 copilot-font-medium">{product.minStock}</span>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="copilot-space-y-2">
            <Label htmlFor="quantity">Cantidad a agregar</Label>
            <div className="copilot-flex copilot-items-center copilot-gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 0}
                className="copilot-h-8 copilot-w-8 copilot-rounded-copilot"
              >
                <Minus className="copilot-h-4 copilot-w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="copilot-text-center copilot-flex-1 copilot-h-10 copilot-rounded-copilot"
                min="0"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustQuantity(1)}
                className="copilot-h-8 copilot-w-8 copilot-rounded-copilot"
              >
                <Plus className="copilot-h-4 copilot-w-4" />
              </Button>
            </div>
            <div className="copilot-flex copilot-justify-between copilot-text-xs copilot-text-muted">
              <span>Sugerido: {suggestedQuantity} unidades</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="copilot-h-auto copilot-p-0 copilot-text-xs"
                onClick={() => setQuantity(suggestedQuantity)}
              >
                Usar sugerido
              </Button>
            </div>
          </div>

          {/* Unit Cost Input */}
          <div className="copilot-space-y-2">
            <Label htmlFor="unitCost">Costo por unidad</Label>
            <div className="copilot-relative">
              <span className="copilot-absolute copilot-left-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted">
                $
              </span>
              <Input
                id="unitCost"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="copilot-pl-8 copilot-h-10 copilot-rounded-copilot"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Summary */}
          {quantity > 0 && (
            <div className="copilot-bg-primary/10 copilot-p-4 copilot-rounded-copilot copilot-border copilot-border-primary/20 copilot-space-y-2">
              <h4 className="copilot-font-medium copilot-text-sm">Resumen del reabastecimiento</h4>
              <div className="copilot-grid copilot-grid-cols-2 copilot-gap-4 copilot-text-sm">
                <div>
                  <span className="copilot-text-muted">Nuevo stock:</span>
                  <span className="copilot-ml-2 copilot-font-medium copilot-text-success">{newStock}</span>
                </div>
                <div>
                  <span className="copilot-text-muted">Costo total:</span>
                  <span className="copilot-ml-2 copilot-font-medium">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning for low quantity */}
          {quantity > 0 && newStock < product.minStock && (
            <Alert className="copilot-border-warning/30 copilot-bg-warning/10">
              <AlertTriangle className="copilot-h-4 copilot-w-4 copilot-text-warning" />
              <AlertDescription className="copilot-text-warning">
                El stock resultante ({newStock}) seguirá siendo menor al mínimo requerido ({product.minStock}).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="copilot-gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="copilot-h-10 copilot-rounded-copilot"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleRestock}
            disabled={!isValidQuantity || loading}
            className="copilot-h-10 copilot-rounded-copilot"
          >
            {loading ? 'Procesando...' : 'Reabastecer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}