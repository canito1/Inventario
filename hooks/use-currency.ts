'use client'

import { useState, useEffect } from 'react'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'

const CURRENCY_STORAGE_KEY = 'preferred-currency'

export function useCurrency() {
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>(DEFAULT_CURRENCY)

  useEffect(() => {
    // Load preferred currency from localStorage
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored && (stored === 'PEN' || stored === 'USD')) {
      setPreferredCurrency(stored as Currency)
    }
  }, [])

  const updatePreferredCurrency = (currency: Currency) => {
    setPreferredCurrency(currency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  }

  return {
    preferredCurrency,
    setPreferredCurrency: updatePreferredCurrency
  }
}