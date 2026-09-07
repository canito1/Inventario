'use client'

import { useState, useEffect } from 'react'
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency'
import api from '@/lib/api'
import { migrateSettingsToBackend } from '@/lib/settings-migration'

interface CompanySettings {
    name: string
    email: string
    timezone: string
    defaultCurrency: Currency
    exchangeRate: number
}

const DEFAULT_SETTINGS: CompanySettings = {
    name: 'Mi Empresa',
    email: 'contacto@miempresa.com',
    timezone: 'America/Lima',
    defaultCurrency: DEFAULT_CURRENCY,
    exchangeRate: 3.75 // Default: 1 USD = 3.75 PEN
}

export function useSettings() {
    const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch settings from backend on mount (with migration)
    useEffect(() => {
        initializeSettings()
    }, [])

    const initializeSettings = async () => {
        // Step 1: Run migration if needed
        try {
            const migrationResult = await migrateSettingsToBackend()
            
            if (migrationResult.migrated) {
                console.log('Settings migration completed:', migrationResult.message)
            }
            
            // If migration provided data, use it immediately
            if (migrationResult.data) {
                setSettings({
                    name: migrationResult.data.name,
                    email: migrationResult.data.email,
                    timezone: migrationResult.data.timezone,
                    defaultCurrency: migrationResult.data.defaultCurrency,
                    exchangeRate: migrationResult.data.exchangeRate
                })
            }
        } catch (migrationError) {
            console.error('Migration error (non-fatal):', migrationError)
            // Continue to fetch settings even if migration fails
        }
        
        // Step 2: Fetch current settings from backend
        await fetchSettings()
    }

    const fetchSettings = async (retryCount = 0) => {
        const MAX_RETRIES = 2
        setLoading(true)
        setError(null)
        
        try {
            const response = await api.get('/settings')
            const backendSettings = response.data.data
            
            // Update state with backend data
            const cleanSettings = {
                name: backendSettings.name,
                email: backendSettings.email,
                timezone: backendSettings.timezone,
                defaultCurrency: backendSettings.defaultCurrency,
                exchangeRate: backendSettings.exchangeRate
            }
            
            setSettings(cleanSettings)
            
            // Also sync to localStorage as backup (only clean data, no MongoDB metadata)
            localStorage.setItem('companySettings', JSON.stringify(cleanSettings))
            
            // Clear any previous errors on success
            setError(null)
        } catch (err: any) {
            console.error('Error fetching settings from backend:', err)
            
            // Determine error message based on error type
            let errorMessage = 'Failed to load settings from server'
            
            if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.'
            } else if (err.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.'
            } else if (err.response?.status === 403) {
                errorMessage = 'Access denied. Insufficient permissions.'
            } else if (err.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.'
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            }
            
            // Retry logic for network errors
            if (retryCount < MAX_RETRIES && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK')) {
                console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`)
                // Exponential backoff: 1s, 2s
                const delay = Math.pow(2, retryCount) * 1000
                await new Promise(resolve => setTimeout(resolve, delay))
                return fetchSettings(retryCount + 1)
            }
            
            setError(errorMessage)
            
            // Fallback to localStorage if backend fails
            try {
                const savedSettings = localStorage.getItem('companySettings')
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings)
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed })
                    console.log('Loaded settings from localStorage fallback')
                }
            } catch (localError) {
                console.error('Error loading settings from localStorage:', localError)
                // Use default settings as last resort
                setSettings(DEFAULT_SETTINGS)
            }
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (newSettings: Partial<CompanySettings>, retryCount = 0) => {
        const MAX_RETRIES = 2
        
        try {
            const response = await api.put('/settings', newSettings)
            const updatedSettings = response.data.data
            
            // Update local state with response from backend (clean data only)
            const cleanSettings = {
                name: updatedSettings.name,
                email: updatedSettings.email,
                timezone: updatedSettings.timezone,
                defaultCurrency: updatedSettings.defaultCurrency,
                exchangeRate: updatedSettings.exchangeRate
            }
            
            setSettings(cleanSettings)
            
            // Also update localStorage as backup (only clean data, no MongoDB metadata)
            localStorage.setItem('companySettings', JSON.stringify(cleanSettings))
            
            // Clear any previous errors on success
            setError(null)
            
            return { success: true, data: updatedSettings }
        } catch (err: any) {
            console.error('Error updating settings:', err)
            
            // Determine specific error message
            let errorMessage = 'Failed to update settings'
            
            if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection and try again.'
                
                // Retry logic for network errors
                if (retryCount < MAX_RETRIES) {
                    console.log(`Retrying update... Attempt ${retryCount + 1} of ${MAX_RETRIES}`)
                    const delay = Math.pow(2, retryCount) * 1000
                    await new Promise(resolve => setTimeout(resolve, delay))
                    return updateSettings(newSettings, retryCount + 1)
                }
            } else if (err.response?.status === 400) {
                // Validation error
                errorMessage = err.response.data?.message || 'Invalid data. Please check your input.'
            } else if (err.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.'
            } else if (err.response?.status === 403) {
                errorMessage = 'Access denied. Only administrators can update settings.'
            } else if (err.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.'
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            }
            
            setError(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS)
        localStorage.removeItem('companySettings')
    }

    return {
        settings,
        loading,
        error,
        updateSettings,
        resetSettings,
        fetchSettings,
        defaultCurrency: settings.defaultCurrency
    }
}