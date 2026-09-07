'use client'

import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number
  currency: Currency
  showConverter?: boolean
  className?: string
}

export function CurrencyDisplay({
  amount,
  currency,
  showConverter = false,
  className
}: CurrencyDisplayProps) {
  const { convertCurrency, formatCurrency } = useExchangeRate()
  const [showAlternate, setShowAlternate] = useState(false)
  const alternateCurrency: Currency = currency === 'PEN' ? 'USD' : 'PEN'

  const displayAmount = showAlternate
    ? convertCurrency(amount, currency, alternateCurrency)
    : amount

  const displayCurrency = showAlternate ? alternateCurrency : currency

  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-medium font-outfit", className)}>
        {formatCurrency(displayAmount, displayCurrency)}
      </span>
      {showConverter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAlternate(!showAlternate)}
          className="h-6 w-6 p-0"
        >
          <ArrowRightLeft className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

interface CurrencyInputProps {
  value: number
  currency: Currency
  onValueChange: (value: number) => void
  onCurrencyChange: (currency: Currency) => void
  placeholder?: string
  disabled?: boolean
}

export function CurrencyInput({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  placeholder = "0.00",
  disabled
}: CurrencyInputProps) {
  return (
    <div className="flex">
      <div className="relative flex-1">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          step="0.01"
          min="0"
          disabled={disabled}
          className="flex h-10 w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        disabled={disabled}
        className="flex h-10 w-20 rounded-r-md border border-l-0 border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="PEN">S/</option>
        <option value="USD">$</option>
      </select>
    </div>
  )
}