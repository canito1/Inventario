'use client'

import { useSettings } from './useSettings'
import { Currency, CURRENCIES } from '@/lib/currency'

/**
 * Hook for exchange rate operations and currency conversions
 * Integrates with useSettings to get real-time exchange rate from backend
 * 
 * Requirements: 5.1, 5.2, 5.3
 * - Applies exchange rate for currency conversions (5.1)
 * - Maintains synchronization between useSettings and useExchangeRate (5.2)
 * - Reflects exchange rate updates across all components (5.3)
 */
export function useExchangeRate() {
  const { settings, loading, error } = useSettings()

  // Convert from base currency to USD
  const convertToUSD = (amount: number, fromCurrency?: Currency): number => {
    const currency = fromCurrency || settings.defaultCurrency
    
    if (currency === 'USD') {
      return amount
    }
    
    // Exchange rate is USD/PEN (1 USD = X PEN)
    // To convert PEN to USD: divide by exchange rate
    if (currency === 'PEN') {
      return amount / settings.exchangeRate
    }
    
    return amount
  }

  // Convert from USD to target currency
  const convertFromUSD = (amount: number, toCurrency?: Currency): number => {
    const currency = toCurrency || settings.defaultCurrency
    
    if (currency === 'USD') {
      return amount
    }
    
    // Exchange rate is USD/PEN (1 USD = X PEN)
    // To convert USD to PEN: multiply by exchange rate
    if (currency === 'PEN') {
      return amount * settings.exchangeRate
    }
    
    return amount
  }

  // Convert between any two currencies
  const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) {
      return amount
    }
    
    // Convert to USD first, then to target currency
    // This ensures all conversions use the backend exchange rate
    const usdAmount = convertToUSD(amount, fromCurrency)
    return convertFromUSD(usdAmount, toCurrency)
  }

  // Format currency with symbol using Intl.NumberFormat for proper localization
  const formatCurrency = (amount: number, currency?: Currency): string => {
    const curr = currency || settings.defaultCurrency
    const config = CURRENCIES[curr]
    
    if (!config) {
      return amount.toFixed(2)
    }
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return {
    // Exchange rate from backend (synchronized with useSettings)
    exchangeRate: settings.exchangeRate,
    defaultCurrency: settings.defaultCurrency,
    
    // Conversion functions that use backend exchange rate
    convertToUSD,
    convertFromUSD,
    convertCurrency,
    formatCurrency,
    
    // State from useSettings for proper loading/error handling
    loading,
    error
  }
}