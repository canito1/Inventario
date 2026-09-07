'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fallback?: React.ReactNode
}

export function ProductImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallback 
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-6 h-6'
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  // Show fallback if no image or error loading
  if (!src || imageError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-md border-2 border-gray-300',
        sizeClasses[size],
        className
      )}>
        {fallback || (
          <Package className={cn('text-muted-foreground', iconSizes[size])} />
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-md border-2 border-gray-300 bg-muted',
      sizeClasses[size],
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        sizes={size === 'sm' ? '32px' : size === 'md' ? '48px' : '64px'}
      />
    </div>
  )
}