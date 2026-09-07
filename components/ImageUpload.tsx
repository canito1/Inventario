'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ value, onChange, disabled, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB permitido.')
      return
    }

    setIsUploading(true)

    // Convert to base64 for preview (in production, you'd upload to a server)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onChange(result)
      setIsUploading(false)
    }
    reader.onerror = () => {
      alert('Error al leer el archivo')
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative aspect-square w-full max-w-[200px] mx-auto">
              <Image
                src={value}
                alt="Imagen del producto"
                fill
                className="object-cover rounded-md"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar imagen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={handleClick}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isUploading ? 'Subiendo imagen...' : 'Subir imagen del producto'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Haz clic para seleccionar una imagen
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG hasta 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}