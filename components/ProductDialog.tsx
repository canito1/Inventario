'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Item, itemsService, CreateItemData } from '@/lib/items'
import { Category, categoriesService } from '@/lib/categories'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'
import { CurrencyInput } from '@/components/CurrencyDisplay'
import { ImageUpload } from '@/components/ImageUpload'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  minStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  maxStock: z.number().min(1, 'El stock máximo debe ser mayor a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  currency: z.enum(['PEN', 'USD']),
  location: z.string().min(1, 'La ubicación es requerida'),
  barcode: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'discontinued']),
  image: z.string().optional().or(z.literal('')),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Item | null
  onSuccess: () => void
}

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)
  const isEditing = !!product

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      quantity: 0,
      minStock: 0,
      maxStock: 100,
      price: 0,
      currency: DEFAULT_CURRENCY,
      location: '',
      barcode: '',
      status: 'active',
      image: '',
    },
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (product) {
      const productCurrency = product.currency || DEFAULT_CURRENCY
      setCurrency(productCurrency)
      form.reset({
        name: product.name,
        description: product.description,
        category: product.category._id,
        quantity: product.quantity,
        minStock: product.minStock,
        maxStock: product.maxStock,
        price: product.price,
        currency: productCurrency,
        location: product.location,
        barcode: product.barcode || '',
        status: product.status,
        image: product.image || '',
      })
    } else {
      setCurrency(DEFAULT_CURRENCY)
      form.reset({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        minStock: 0,
        maxStock: 100,
        price: 0,
        currency: DEFAULT_CURRENCY,
        location: '',
        barcode: '',
        status: 'active',
        image: '',
      })
    }
  }, [product, form])

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true)

      if (isEditing && product) {
        await itemsService.updateItem(product._id, data)
        toast({
          title: '✅ Producto actualizado',
          description: `${data.name} ha sido actualizado correctamente`,
          variant: 'default',
        })
      } else {
        await itemsService.createItem(data)
        toast({
          title: '✅ Producto creado',
          description: `${data.name} ha sido creado correctamente`,
          variant: 'default',
        })
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast({
        title: '❌ Error',
        description:
          error.response?.data?.message ||
          `No se pudo ${isEditing ? 'actualizar' : 'crear'} el producto`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent: full-width on mobile, capped at 600px on larger screens */}
      <DialogContent
        className="
          w-[95vw] max-w-[600px]
          max-h-[90vh] overflow-y-auto
          p-4 sm:p-6
          bg-surface text-surface-foreground border border-border rounded-[8px]
          scrollbar-thin
        "
      >
        <DialogHeader className="mb-4">
          <DialogTitle
            className="
              font-[GintoNord] text-lg font-semibold leading-tight
              text-foreground m-0
            "
          >
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? 'Modifica los datos del producto.'
              : 'Completa la información para crear un nuevo producto.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Row 1: Nombre + Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre del producto"
                        className="copilot-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="copilot-input">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {categories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category._id}
                            className="hover:bg-muted focus:bg-muted focus:text-foreground"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="copilot-label">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del producto"
                      className="copilot-input resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="copilot-error" />
                </FormItem>
              )}
            />

            {/* Row 3: Imagen */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="copilot-label">Imagen del Producto</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Sube una imagen del producto (opcional). Formatos: PNG, JPG, JPEG. Máximo 5MB.
                  </FormDescription>
                  <FormMessage className="copilot-error" />
                </FormItem>
              )}
            />

            {/* Row 4: Cantidad / Stock Mínimo / Stock Máximo */}
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="copilot-input"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="copilot-input"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Stock Máximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="copilot-input"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 5: Precio + Ubicación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Precio</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        currency={form.watch('currency')}
                        onValueChange={field.onChange}
                        onCurrencyChange={(newCurrency) => {
                          form.setValue('currency', newCurrency)
                          setCurrency(newCurrency)
                        }}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Ubicación</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Almacén A-1"
                        className="copilot-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 6: Código de Barras + Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Código de Barras (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dejar vacío si no aplica"
                        className="copilot-input"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Campo opcional. Puedes dejarlo vacío.
                    </FormDescription>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="copilot-label">Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="copilot-input">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="active" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                          Activo
                        </SelectItem>
                        <SelectItem value="inactive" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                          Inactivo
                        </SelectItem>
                        <SelectItem value="discontinued" className="hover:bg-muted focus:bg-muted focus:text-foreground">
                          Descontinuado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="copilot-error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer: stacked on mobile, inline on sm+ */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="
                  w-full sm:w-auto
                  copilot-btn-ghost
                "
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="
                  w-full sm:w-auto
                  copilot-btn-primary
                "
              >
                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>

          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}
