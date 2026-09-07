# Settings Migration Guide

## Overview

This guide explains the settings migration utility that automatically migrates localStorage settings to the backend database.

## What Does It Do?

The migration utility (`lib/settings-migration.ts`) performs the following tasks:

1. **Checks Migration Status**: Verifies if migration has already been completed
2. **Reads localStorage**: Extracts existing `companySettings` from localStorage
3. **Migrates to Backend**: Sends a PUT request to `/api/settings` to create/update backend settings
4. **Verifies Consistency**: Compares local and backend data to ensure accuracy
5. **Maintains Backup**: Keeps localStorage as a backup copy
6. **Marks Complete**: Sets a flag to prevent duplicate migrations

## How It Works

### Automatic Migration

The migration runs automatically when the application loads through the `useSettings` hook:

```typescript
// In hooks/useSettings.ts
useEffect(() => {
  initializeSettings() // Runs migration then fetches settings
}, [])
```

### Migration Flow

```
User Opens App
     ↓
useSettings Hook Initializes
     ↓
Check: Has migration run before?
     ↓
  No → Read localStorage settings
     ↓
  Send PUT /api/settings with local data
     ↓
  Verify data consistency
     ↓
  Update localStorage with backend response
     ↓
  Mark migration as complete
     ↓
Fetch current settings from backend
     ↓
Display settings in UI
```

## Migration Functions

### `migrateSettingsToBackend()`

Main migration function that orchestrates the entire process.

**Returns**: `Promise<MigrationResult>`

```typescript
interface MigrationResult {
  success: boolean    // Whether migration succeeded
  migrated: boolean   // Whether data was actually migrated
  message: string     // Descriptive message
  data?: CompanySettings  // Backend settings if available
}
```

**Example Usage**:

```typescript
import { migrateSettingsToBackend } from '@/lib/settings-migration'

const result = await migrateSettingsToBackend()

if (result.success && result.migrated) {
  console.log('Migration completed:', result.data)
} else if (result.success && !result.migrated) {
  console.log('Migration already done or no data to migrate')
} else {
  console.error('Migration failed:', result.message)
}
```

### `isMigrationCompleted()`

Checks if migration has already been completed.

**Returns**: `boolean`

```typescript
import { isMigrationCompleted } from '@/lib/settings-migration'

if (isMigrationCompleted()) {
  console.log('Migration already completed')
}
```

### `resetMigrationFlag()`

Resets the migration flag (useful for testing or re-migration).

```typescript
import { resetMigrationFlag } from '@/lib/settings-migration'

resetMigrationFlag()
// Next app load will trigger migration again
```

## Testing the Migration

### Manual Testing Steps

1. **Prepare Test Data**:
   ```javascript
   // In browser console
   localStorage.setItem('companySettings', JSON.stringify({
     name: 'Test Company',
     email: 'test@example.com',
     timezone: 'America/Lima',
     defaultCurrency: 'PEN',
     exchangeRate: 3.75
   }))
   ```

2. **Clear Migration Flag**:
   ```javascript
   localStorage.removeItem('settingsMigrated')
   ```

3. **Reload Application**:
   - Open browser DevTools → Console
   - Refresh the page
   - Watch for migration logs

4. **Verify Migration**:
   ```javascript
   // Check migration flag
   localStorage.getItem('settingsMigrated') // Should be 'true'
   
   // Check settings were synced
   localStorage.getItem('companySettings') // Should match backend
   ```

5. **Verify Backend**:
   - Open Network tab
   - Look for PUT request to `/api/settings`
   - Check response contains migrated data

### Testing Different Scenarios

#### Scenario 1: First-Time User (No localStorage)
```javascript
// Clear all data
localStorage.clear()

// Reload app
// Expected: Migration skips, uses backend defaults
```

#### Scenario 2: Existing User (Has localStorage)
```javascript
// Set existing settings
localStorage.setItem('companySettings', JSON.stringify({
  exchangeRate: 3.80
}))

// Reload app
// Expected: Migration sends data to backend, marks complete
```

#### Scenario 3: Already Migrated
```javascript
// Migration flag exists
localStorage.getItem('settingsMigrated') // 'true'

// Reload app
// Expected: Migration skips, directly fetches from backend
```

#### Scenario 4: Migration Failure
```javascript
// Stop backend server
// Reload app
// Expected: Migration fails, falls back to localStorage, retries next time
```

## Data Consistency Verification

The migration utility verifies that all fields match between localStorage and backend:

- `name`
- `email`
- `timezone`
- `defaultCurrency`
- `exchangeRate`

If inconsistencies are detected, warnings are logged to the console but migration still completes.

## Error Handling

### Network Errors
- Migration fails gracefully
- Does not mark as complete (allows retry)
- Falls back to localStorage

### Authentication Errors
- Migration fails if user not authenticated
- Retries on next login

### Validation Errors
- Backend validates data before saving
- Invalid data rejected with error message
- Migration not marked complete

## localStorage Keys

The migration uses these localStorage keys:

- `companySettings`: Stores the actual settings data
- `settingsMigrated`: Flag indicating migration completion ('true' or absent)

## Backend Integration

The migration sends data to:

**Endpoint**: `PUT /api/settings`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Mi Empresa",
  "email": "contacto@miempresa.com",
  "timezone": "America/Lima",
  "defaultCurrency": "PEN",
  "exchangeRate": 3.75
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "_id": "...",
    "name": "Mi Empresa",
    "email": "contacto@miempresa.com",
    "timezone": "America/Lima",
    "defaultCurrency": "PEN",
    "exchangeRate": 3.75,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Troubleshooting

### Migration Not Running

**Check**:
1. Is `settingsMigrated` flag set in localStorage?
2. Are there any console errors?
3. Is the user authenticated?

**Solution**:
```javascript
// Reset and try again
localStorage.removeItem('settingsMigrated')
location.reload()
```

### Data Not Syncing

**Check**:
1. Network tab for API requests
2. Backend logs for errors
3. localStorage data format

**Solution**:
```javascript
// Verify localStorage format
const settings = JSON.parse(localStorage.getItem('companySettings'))
console.log(settings)

// Should be an object with proper fields
```

### Migration Keeps Running

**Check**:
1. Is migration flag being set?
2. Are there errors preventing completion?

**Solution**:
```javascript
// Manually mark as complete
localStorage.setItem('settingsMigrated', 'true')
```

## Best Practices

1. **Don't Remove localStorage**: Keep it as a backup even after migration
2. **Monitor Logs**: Check console for migration status and errors
3. **Test Before Deploy**: Verify migration works in staging environment
4. **Handle Failures**: Migration failures are non-fatal, app continues to work
5. **One-Time Process**: Migration only runs once per browser/user

## Future Considerations

- Add migration version tracking for future schema changes
- Implement rollback mechanism if needed
- Add analytics to track migration success rates
- Consider batch migration for multiple users
