'use client'

import { Currency, CURRENCIES } from '@/lib/currency'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CurrencySelectorProps {
  value: Currency
  onValueChange: (currency: Currency) => void
  disabled?: boolean
  className?: string
}

export function CurrencySelector({ value, onValueChange, disabled, className }: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className || "w-24"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{config.symbol}</span>
              <span className="text-sm text-muted-foreground">{config.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}