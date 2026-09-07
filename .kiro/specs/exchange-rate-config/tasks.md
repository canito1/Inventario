# Implementation Plan

- [x] 1. Create Settings model and database schema

  - Create `backend/src/models/Settings.ts` with Mongoose schema
  - Define ISettings interface with all configuration fields
  - Add singleton constraint with unique index
  - Implement validation rules for exchangeRate (min: 0.0001, max: 100, precision: 4)
  - Set default values for all fields
  - Add timestamps configuration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement Settings controller

  - [x] 2.1 Create getSettings controller function

    - Create `backend/src/controllers/settings.controller.ts`
    - Implement getSettings function to retrieve or create default settings
    - Use findOne with singleton: true
    - Handle case when no settings exist (create with defaults)
    - Return standardized response format
    - _Requirements: 2.2, 2.3_

  - [x] 2.2 Create updateSettings controller function

    - Implement updateSettings function with admin authorization check
    - Use findOneAndUpdate with upsert option
    - Validate incoming data
    - Return updated settings
    - Add error handling for database operations
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 4.2, 4.3, 4.5_

-

- [x] 3. Add validation schema for settings

  - Add updateSettings schema to `backend/src/middleware/validation.ts`
  - Define validation rules for all fields (name, email, timezone, defaultCurrency, exchangeRate)
  - Make all fields optional for partial updates
  - Set exchangeRate constraints (min, max, precision)
  - Export validateUpdateSettings middleware
  - _Requirements: 1.3, 1.4_

- [x] 4. Create Settings routes

  - Create `backend/src/routes/settings.routes.ts`
  - Define GET /api/settings route with authenticate middleware
  - Define PUT /api/settings route with authenticate and authorize('admin') middleware
  - Add validation middleware to PUT route
  - Export router

  - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4_

- [x] 5. Register Settings routes in main server

  - Import settings routes in `backend/src/server.ts`
  - Register routes with /api/settings prefix

  - Ensure proper middleware order
  - _Requirements: 2.1, 4.1_

- [x] 6. Update useSettings hook to use backend API

  - [x] 6.1 Modify useSettings hook structure

    - Update `hooks/useSettings.ts` to fetch from backend on mount

    - Add fetchSettings function that calls GET /api/settings
    - Implement error handling with localStorage fallback
    - Add loading and error states
    - Update state management to use backend data
    - _Requirements: 2.1, 2.4_

  - [x] 6.2 Update updateSettings function

    - Modify updateSettings to call PUT /api/settings
    - Add JWT token to request headers
    - Handle success and error responses
    - Update local state on successful update

    - Keep localStorage sync as backup
    - Return success/error status
    - _Requirements: 1.2, 5.5_

- [x] 7. Update CurrencySettings component

  - Modify `components/CurrencySettings.tsx` to use new useSettings API
  - Add loading state UI during fetch and update
  - Add success/error toast notifications
  - Update form submission handler to use async updateSettings
  - Display current exchange rate from backend
  - Add error message display for failed updates
  - _Requirements: 1.1, 5.3, 5.4, 5.5_

- [x] 8. Create API client functions for settings

  - Add settingsAPI object to `lib/api.ts`
  - Implement get() function for fetching settings
  - Implement update() function for updating settings
  - Use existing apiClient with proper headers
  - Handle authentication token injection
  - _Requirements: 2.1, 1.2_

-

- [x] 9. Update useExchangeRate hook integration

  - Verify `hooks/useExchangeRate.ts` correctly reads from useSettings

  - Ensure exchangeRate updates propagate to all components

  - Test currency conversion functions with backend data
  - _Requirements: 5.1, 5.2, 5.3_

-

- [x] 10. Add admin-only UI controls

  - Update CurrencySettings component to check user role
  - Disable edit controls for non-admin users
  - Show read-only view for non-admin users
  - Display permission message when appropriate
  - _Requirements: 4.3_

-

- [x] 11. Implement error handling and user feedback

  - Add try-catch blocks in all API calls

  - Implement toast notifications for success/error states
  - Add inline validation error messages
  - Implement retry mechanism for failed requests
  - Add loading spinners during API operations
  - _Requirements: 5.4, 5.5_

- [x] 12. Add data migration for existing localStorage values

  - Create migration utility function
  - Read existing localStorage companySettings

  - Send initial PUT request to create backend settings

  - Verify data consistency
  - Keep localStorage as backup
  - _Requirements: 2.4_
