'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { Item } from '@/lib/items'
import { Currency } from '@/lib/currency'
import { DollarSign, Coins } from 'lucide-react'

interface CurrencySummaryProps {
  items: Item[]
}

export function CurrencySummary({ items }: CurrencySummaryProps) {
  const { convertCurrency, formatCurrency, exchangeRate, loading } = useExchangeRate()

  // Calculate totals by currency
  const totals = items.reduce((acc, item) => {
    const currency = item.currency || 'PEN'
    const value = item.price * item.quantity

    if (!acc[currency]) {
      acc[currency] = { value: 0, count: 0 }
    }

    acc[currency].value += value
    acc[currency].count += 1

    return acc
  }, {} as Record<Currency, { value: number; count: number }>)

  // Convert everything to PEN for total calculation using backend exchange rate
  const totalInPEN = Object.entries(totals).reduce((sum, [currency, data]) => {
    if (currency === 'PEN') {
      return sum + data.value
    } else {
      return sum + convertCurrency(data.value, currency as Currency, 'PEN')
    }
  }, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total General */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(totalInPEN, 'PEN')}
              </div>
              <p className="text-xs text-muted-foreground">
                Equivalente en soles
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Por cada moneda */}
      {Object.entries(totals).map(([currency, data]) => (
        <Card key={currency}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor en {currency === 'PEN' ? 'Soles' : 'Dólares'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.value, currency as Currency)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {data.count} producto{data.count !== 1 ? 's' : ''}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Tipo de cambio - Using backend data with loading state */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tipo de Cambio</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">1 USD =</span>
                  <span className="font-medium">S/ {(1 / exchangeRate).toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">1 PEN =</span>
                  <span className="font-medium">$ {exchangeRate.toFixed(4)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Desde el servidor
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}