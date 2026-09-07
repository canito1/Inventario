'use client'

import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface CrudNotificationProps {
  type: NotificationType
  title: string
  message: string
  duration?: number
}

export function useCrudNotification() {
  const { toast } = useToast()

  const showNotification = ({ type, title, message, duration = 4000 }: CrudNotificationProps) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-600" />,
      error: <XCircle className="h-5 w-5 text-red-600" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      info: <Info className="h-5 w-5 text-blue-600" />,
      loading: <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
    }

    const variants = {
      success: undefined,
      error: 'destructive' as const,
      warning: 'destructive' as const,
      info: undefined,
      loading: undefined
    }

    toast({
      title: (
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="font-semibold">{title}</span>
        </div>
      ) as any,
      description: message,
      variant: variants[type],
      duration,
    })
  }

  return {
    success: (title: string, message: string, duration?: number) => 
      showNotification({ type: 'success', title, message, duration }),
    
    error: (title: string, message: string, duration?: number) => 
      showNotification({ type: 'error', title, message, duration }),
    
    warning: (title: string, message: string, duration?: number) => 
      showNotification({ type: 'warning', title, message, duration }),
    
    info: (title: string, message: string, duration?: number) => 
      showNotification({ type: 'info', title, message, duration }),
    
    loading: (title: string, message: string, duration?: number) => 
      showNotification({ type: 'loading', title, message, duration }),

    // Métodos específicos para CRUD
    created: (itemName: string, details?: string) => 
      showNotification({
        type: 'success',
        title: '🎉 ¡Producto creado!',
        message: `"${itemName}" se agregó exitosamente al inventario${details ? `. ${details}` : ''}`,
        duration: 5000
      }),

    updated: (itemName: string, details?: string) => 
      showNotification({
        type: 'success',
        title: '💾 ¡Producto actualizado!',
        message: `Los cambios en "${itemName}" se guardaron correctamente${details ? `. ${details}` : ''}`,
        duration: 4000
      }),

    deleted: (itemName: string) => 
      showNotification({
        type: 'success',
        title: '🗑️ ¡Producto eliminado!',
        message: `"${itemName}" se eliminó permanentemente del inventario`,
        duration: 4000
      }),

    validationError: (field: string, message: string) => 
      showNotification({
        type: 'warning',
        title: '⚠️ Error de validación',
        message: `${field}: ${message}`,
        duration: 4000
      }),

    networkError: (operation: string, error?: string) => 
      showNotification({
        type: 'error',
        title: '❌ Error de conexión',
        message: `No se pudo ${operation}. ${error || 'Verifica tu conexión a la base de datos.'}`,
        duration: 6000
      }),

    saving: (itemName: string) => 
      showNotification({
        type: 'loading',
        title: '⏳ Guardando...',
        message: `Guardando "${itemName}" en la base de datos`,
        duration: 2000
      }),

    deleting: (itemName: string) => 
      showNotification({
        type: 'loading',
        title: '⏳ Eliminando...',
        message: `Eliminando "${itemName}" de la base de datos`,
        duration: 2000
      }),

    dataLoaded: (itemCount: number, categoryCount: number) => 
      showNotification({
        type: 'info',
        title: '📦 Datos cargados',
        message: `Se cargaron ${itemCount} productos y ${categoryCount} categorías desde la base de datos`,
        duration: 3000
      }),

    newItemStarted: () => 
      showNotification({
        type: 'info',
        title: '➕ Nuevo producto',
        message: 'Completa los campos requeridos y haz clic en guardar para agregar el producto',
        duration: 3000
      })
  }
}