'use client'

import { Package, AlertTriangle, Edit2, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { CurrencySelector } from "@/components/CurrencySelector"
import { Item } from "@/lib/items"
import { Category } from "@/lib/categories"
import { DEFAULT_CURRENCY } from "@/lib/currency"
import {
  MobileCard,
  MobileCardHeader,
  MobileCardSection,
  MobileCardField,
  MobileCardActions
} from "@/components/ui/responsive-table"

interface EditableInventoryMobileCardProps {
  item: Item
  categories: Category[]
  isEditing?: boolean
  editingData?: Partial<Item>
  isSaving?: boolean
  onStartEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void
  onFieldChange?: (field: string, value: any) => void
}

export function EditableInventoryMobileCard({
  item,
  categories,
  isEditing = false,
  editingData = {},
  isSaving = false,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onFieldChange
}: EditableInventoryMobileCardProps) {

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return {
      label: '🚫 Sin Stock',
      className: 'copilot-bg-destructive/10 copilot-text-destructive copilot-border copilot-border-destructive/20'
    }
    if (quantity <= minStock) return {
      label: '⚠️ Stock Bajo',
      className: 'copilot-bg-warning/10 copilot-text-warning copilot-border copilot-border-warning/20'
    }
    return {
      label: '✅ En Stock',
      className: 'copilot-bg-success/10 copilot-text-success copilot-border copilot-border-success/20'
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { label: '✅ Activo', className: 'copilot-bg-success/10 copilot-text-success copilot-border copilot-border-success/20' },
      inactive: { label: '⏸️ Inactivo', className: 'copilot-bg-muted copilot-text-muted copilot-border copilot-border-border' },
      discontinued: { label: '🚫 Descontinuado', className: 'copilot-bg-destructive/10 copilot-text-destructive copilot-border copilot-border-destructive/20' }
    }
    return configs[status as keyof typeof configs] || configs.active
  }

  const currentData = isEditing ? { ...item, ...editingData } : item
  const stockStatus = getStockStatus(currentData.quantity, currentData.minStock)
  const statusConfig = getStatusConfig(currentData.status)
  const categoryId = typeof currentData.category === 'string' ? currentData.category : currentData.category?._id
  const categoryName = typeof currentData.category === 'string'
    ? categories.find(c => c._id === categoryId)?.name || currentData.category
    : currentData.category?.name || 'Sin categoría'

  const handleFieldChange = (field: string, value: any) => {
    if (onFieldChange) {
      onFieldChange(field, value)
    }
  }

  return (
    <MobileCard className={`${isEditing ? 'copilot-border-primary/30 copilot-bg-primary/5' : ''}`}>
      <MobileCardHeader
        title={
          isEditing ? (
            <Input
              value={currentData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="copilot-h-8 copilot-text-sm copilot-font-medium copilot-rounded-copilot"
              placeholder="Nombre del producto"
            />
          ) : (
            currentData.name
          )
        }
        subtitle={
          isEditing ? (
            <Input
              value={currentData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="copilot-h-7 copilot-text-xs copilot-mt-1 copilot-rounded-copilot"
              placeholder="Descripción del producto"
            />
          ) : (
            currentData.description
          )
        }
        icon={<Package className="copilot-h-5 copilot-w-5 copilot-text-muted" />}
        badge={
          <div className="copilot-flex copilot-items-center copilot-gap-1">
            <Badge variant="outline" className={stockStatus.className}>
              {stockStatus.label}
            </Badge>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
        }
        actions={
          <div className="copilot-flex copilot-items-center copilot-gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="copilot-h-8 copilot-w-8 copilot-p-0 copilot-text-success copilot-hover:bg-success/10"
                >
                  {isSaving ? (
                    <div className="copilot-animate-spin copilot-rounded-full copilot-h-3 copilot-w-3 copilot-border-b-2 copilot-border-success"></div>
                  ) : (
                    <Save className="copilot-h-4 copilot-w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="copilot-h-8 copilot-w-8 copilot-p-0 copilot-text-muted copilot-hover:bg-muted"
                >
                  <X className="copilot-h-4 copilot-w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartEdit}
                  className="copilot-h-8 copilot-w-8 copilot-p-0 copilot-text-primary copilot-hover:bg-primary/10"
                >
                  <Edit2 className="copilot-h-4 copilot-w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="copilot-h-8 copilot-w-8 copilot-p-0 copilot-text-destructive copilot-hover:bg-destructive/10"
                >
                  <Trash2 className="copilot-h-4 copilot-w-4" />
                </Button>
              </>
            )}
          </div>
        }
      />

      <MobileCardSection>
        <MobileCardField
          label="Categoría"
          value={
            isEditing ? (
              <Select
                value={categoryId || ''}
                onValueChange={(value) => handleFieldChange('category', value)}
              >
                <SelectTrigger className="copilot-h-8 copilot-text-sm copilot-rounded-copilot">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="copilot-bg-primary/10 copilot-text-primary copilot-border copilot-border-primary/20">
                {categoryName}
              </Badge>
            )
          }
        />

        <div className="copilot-grid copilot-grid-cols-2 copilot-gap-4">
          <MobileCardField
            label="Stock"
            value={
              isEditing ? (
                <Input
                  type="number"
                  value={currentData.quantity || 0}
                  onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
                  className="copilot-h-8 copilot-text-sm copilot-rounded-copilot"
                  min="0"
                />
              ) : (
                <span className={`copilot-font-semibold ${
                  currentData.quantity === 0 ? 'copilot-text-destructive' :
                  currentData.quantity <= currentData.minStock ? 'copilot-text-warning' :
                  'copilot-text-success'
                }`}>
                  {currentData.quantity}
                </span>
              )
            }
          />

          <MobileCardField
            label="Stock Mín"
            value={
              isEditing ? (
                <Input
                  type="number"
                  value={currentData.minStock || 0}
                  onChange={(e) => handleFieldChange('minStock', parseInt(e.target.value) || 0)}
                  className="copilot-h-8 copilot-text-sm copilot-rounded-copilot"
                  min="0"
                />
              ) : (
                <span className="copilot-text-muted">{currentData.minStock}</span>
              )
            }
          />
        </div>

        <MobileCardField
          label="Precio"
          value={
            isEditing ? (
              <div className="copilot-flex copilot-items-center copilot-gap-2">
                <Input
                  type="number"
                  value={currentData.price || 0}
                  onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                  className="copilot-h-8 copilot-text-sm copilot-flex-1 copilot-rounded-copilot"
                  min="0"
                  step="0.01"
                />
                <CurrencySelector
                  value={currentData.currency || DEFAULT_CURRENCY}
                  onValueChange={(currency) => handleFieldChange('currency', currency)}
                  className="copilot-h-8 copilot-w-20 copilot-text-xs copilot-rounded-copilot"
                />
              </div>
            ) : (
              <CurrencyDisplay
                amount={currentData.price}
                currency={currentData.currency || DEFAULT_CURRENCY}
              />
            )
          }
        />

        <MobileCardField
          label="Ubicación"
          value={
            isEditing ? (
              <Input
                value={currentData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="copilot-h-8 copilot-text-sm copilot-rounded-copilot"
                placeholder="Ubicación del producto"
              />
            ) : (
              <span className="copilot-text-xs copilot-bg-muted copilot-px-2 copilot-py-1 copilot-rounded">
                {currentData.location}
              </span>
            )
          }
        />

        <MobileCardField
          label="Estado"
          value={
            isEditing ? (
              <Select
                value={currentData.status || 'active'}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger className="copilot-h-8 copilot-text-sm copilot-rounded-copilot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">✅ Activo</SelectItem>
                  <SelectItem value="inactive">⏸️ Inactivo</SelectItem>
                  <SelectItem value="discontinued">🚫 Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            )
          }
        />

        {currentData.barcode && (
          <MobileCardField
            label="Código"
            value={<span className="copilot-font-mono copilot-text-xs">{currentData.barcode}</span>}
          />
        )}
      </MobileCardSection>

      {!isEditing && (
        <MobileCardActions>
          <Button
            variant="outline"
            size="sm"
            onClick={onStartEdit}
            className="copilot-flex-1 copilot-h-10 copilot-rounded-copilot"
          >
            <Edit2 className="copilot-mr-2 copilot-h-4 copilot-w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="copilot-flex-1 copilot-h-10 copilot-rounded-copilot"
          >
            <Trash2 className="copilot-mr-2 copilot-h-4 copilot-w-4" />
            Eliminar
          </Button>
        </MobileCardActions>
      )}
    </MobileCard>
  )
}