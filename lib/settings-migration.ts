/**
 * Settings Migration Utility
 * 
 * This utility handles the migration of settings from localStorage to the backend database.
 * It ensures data consistency and maintains localStorage as a backup.
 */

import { settingsAPI, CompanySettings } from './api'

const MIGRATION_FLAG_KEY = 'settingsMigrated'
const SETTINGS_KEY = 'companySettings'

interface MigrationResult {
  success: boolean
  migrated: boolean
  message: string
  data?: CompanySettings
}

/**
 * Check if migration has already been completed
 */
export function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true'
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true')
}

/**
 * Read existing settings from localStorage
 */
function readLocalStorageSettings(): Partial<CompanySettings> | null {
  if (typeof window === 'undefined') return null
  
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (!savedSettings) {
      console.log('No existing localStorage settings found')
      return null
    }
    
    const parsed = JSON.parse(savedSettings)
    console.log('Found existing localStorage settings:', parsed)
    return parsed
  } catch (error) {
    console.error('Error reading localStorage settings:', error)
    return null
  }
}

/**
 * Verify data consistency between local and backend settings
 */
function verifyDataConsistency(
  localSettings: Partial<CompanySettings>,
  backendSettings: CompanySettings
): boolean {
  const fieldsToCheck: (keyof CompanySettings)[] = [
    'name',
    'email',
    'timezone',
    'defaultCurrency',
    'exchangeRate'
  ]
  
  let isConsistent = true
  
  for (const field of fieldsToCheck) {
    if (localSettings[field] !== undefined && localSettings[field] !== backendSettings[field]) {
      console.warn(
        `Data inconsistency detected in field "${field}":`,
        `Local: ${localSettings[field]}, Backend: ${backendSettings[field]}`
      )
      isConsistent = false
    }
  }
  
  return isConsistent
}

/**
 * Main migration function
 * 
 * This function:
 * 1. Checks if migration has already been completed
 * 2. Reads existing localStorage settings
 * 3. Sends PUT request to create/update backend settings
 * 4. Verifies data consistency
 * 5. Keeps localStorage as backup
 * 6. Marks migration as completed
 * 
 * @returns MigrationResult object with success status and details
 */
export async function migrateSettingsToBackend(): Promise<MigrationResult> {
  // Check if migration already completed
  if (isMigrationCompleted()) {
    console.log('Settings migration already completed, skipping...')
    return {
      success: true,
      migrated: false,
      message: 'Migration already completed'
    }
  }
  
  try {
    // Step 1: Read existing localStorage settings
    const localSettings = readLocalStorageSettings()
    
    // If no local settings exist, just mark migration as complete
    // (backend will use defaults or existing data)
    if (!localSettings || Object.keys(localSettings).length === 0) {
      console.log('No local settings to migrate')
      markMigrationCompleted()
      return {
        success: true,
        migrated: false,
        message: 'No local settings found to migrate'
      }
    }
    
    // Step 2: Send PUT request to create/update backend settings
    // Only send allowed fields (exclude MongoDB metadata like _id, __v, etc.)
    const allowedFields: Partial<CompanySettings> = {}
    if (localSettings.name !== undefined) allowedFields.name = localSettings.name
    if (localSettings.email !== undefined) allowedFields.email = localSettings.email
    if (localSettings.timezone !== undefined) allowedFields.timezone = localSettings.timezone
    if (localSettings.defaultCurrency !== undefined) allowedFields.defaultCurrency = localSettings.defaultCurrency
    if (localSettings.exchangeRate !== undefined) allowedFields.exchangeRate = localSettings.exchangeRate
    
    console.log('Migrating settings to backend:', allowedFields)
    const response = await settingsAPI.update(allowedFields)
    const backendSettings = response.data as CompanySettings
    
    console.log('Settings migrated successfully:', backendSettings)
    
    // Step 3: Verify data consistency
    const isConsistent = verifyDataConsistency(localSettings, backendSettings)
    
    if (!isConsistent) {
      console.warn('Data consistency check failed, but migration completed')
    }
    
    // Step 4: Update localStorage with backend response (keep as backup)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(backendSettings))
    console.log('localStorage updated with backend settings as backup')
    
    // Step 5: Mark migration as completed
    markMigrationCompleted()
    console.log('Migration marked as completed')
    
    return {
      success: true,
      migrated: true,
      message: 'Settings migrated successfully',
      data: backendSettings
    }
  } catch (error: any) {
    console.error('Error during settings migration:', error)
    
    // Don't mark as completed if migration failed
    // This allows retry on next load
    return {
      success: false,
      migrated: false,
      message: error.response?.data?.message || error.message || 'Migration failed'
    }
  }
}

/**
 * Reset migration flag (useful for testing or re-migration)
 */
export function resetMigrationFlag(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MIGRATION_FLAG_KEY)
  console.log('Migration flag reset')
}
