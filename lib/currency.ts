export type Currency = 'PEN' | 'USD'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  PEN: {
    code: 'PEN',
    symbol: 'S/',
    name: 'Sol Peruano',
    locale: 'es-PE'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Americano',
    locale: 'en-US'
  }
}

export const DEFAULT_CURRENCY: Currency = 'PEN'

export function formatCurrency(
  amount: number, 
  currency: Currency = DEFAULT_CURRENCY,
  showSymbol: boolean = true
): string {
  const config = CURRENCIES[currency]
  
  if (showSymbol) {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
  
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name
}

// Tipo de cambio simulado - en producción vendría de una API
export const EXCHANGE_RATES: Record<Currency, number> = {
  PEN: 1, // Base currency
  USD: 3.75 // 1 USD = 3.75 PEN (aproximado)
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to PEN first (base currency)
  const amountInPEN = fromCurrency === 'PEN' 
    ? amount 
    : amount * EXCHANGE_RATES[fromCurrency]
  
  // Convert from PEN to target currency
  return toCurrency === 'PEN' 
    ? amountInPEN 
    : amountInPEN / EXCHANGE_RATES[toCurrency]
}