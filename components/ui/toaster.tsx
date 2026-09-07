'use client'

import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={toast.variant}
          className="relative pr-8 shadow-lg"
        >
          {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
          {toast.description && <AlertDescription>{toast.description}</AlertDescription>}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => dismiss(toast.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}