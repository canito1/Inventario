'use client'

import { useExchangeRate } from '@/hooks/useExchangeRate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp } from 'lucide-react'

interface ExchangeRateDisplayProps {
  amount?: number
  className?: string
  overrideExchangeRate?: number
}

export function ExchangeRateDisplay({ amount = 100, className = '', overrideExchangeRate }: ExchangeRateDisplayProps) {
  const { exchangeRate: globalExchangeRate, defaultCurrency, convertToUSD, convertFromUSD, formatCurrency, loading, error } = useExchangeRate()

  // Use override if provided, otherwise use global
  const exchangeRate = overrideExchangeRate !== undefined ? overrideExchangeRate : globalExchangeRate

  const usdAmount = convertToUSD(amount, defaultCurrency)
  const penAmount = convertFromUSD(amount, 'PEN')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
          <TrendingUp className="copilot-h-5 copilot-w-5" />
          Tipo de Cambio Actual
        </CardTitle>
        <CardDescription>
          Conversión automática basada en la configuración del servidor
        </CardDescription>
      </CardHeader>
      <CardContent className="copilot-space-y-4">
        {loading ? (
          <div className="copilot-flex copilot-items-center copilot-justify-center copilot-py-8">
            <div className="copilot-animate-spin copilot-rounded-full copilot-h-8 copilot-w-8 copilot-border-b-2 copilot-border-primary"></div>
          </div>
        ) : error ? (
          <div className="copilot-text-center copilot-py-4 copilot-text-sm copilot-text-destructive">
            {error}
          </div>
        ) : (
          <>
            <div className="copilot-bg-primary/10 copilot-p-4 copilot-rounded-copilot copilot-border copilot-border-primary/20">
              <div className="copilot-flex copilot-items-center copilot-gap-2 copilot-mb-2">
                <DollarSign className="copilot-h-4 copilot-w-4 copilot-text-primary" />
                <span className="copilot-font-medium copilot-text-primary">Tipo de Cambio</span>
              </div>
              <div className="copilot-text-2xl copilot-font-bold copilot-text-primary">
                {exchangeRate.toFixed(4)}
              </div>
              <div className="copilot-text-sm copilot-text-primary/80">
                1 USD = {exchangeRate.toFixed(4)} Soles Peruanos (PEN)
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}