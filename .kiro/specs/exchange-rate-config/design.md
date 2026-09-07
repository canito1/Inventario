# Design Document: Exchange Rate Configuration

## Overview

Este diseño implementa un sistema de configuración centralizado para la tasa de cambio, migrando desde el almacenamiento local del navegador (localStorage) hacia una solución basada en MongoDB. La arquitectura sigue el patrón MVC existente en el backend y se integra con los hooks de React en el frontend para proporcionar sincronización en tiempo real.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Settings Page  │  │ useSettings  │  │ useExchangeRate │ │
│  │   Component    │──│     Hook     │──│      Hook       │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│           │                  │                               │
│           └──────────────────┼───────────────────────────────┤
│                              │ HTTP GET/PUT                  │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Settings   │  │    Settings      │  │   Settings   │  │
│  │    Routes    │──│   Controller     │──│    Model     │  │
│  └──────────────┘  └──────────────────┘  └──────────────┘  │
│         │                   │                    │           │
│         │                   │                    ▼           │
│         │                   │          ┌──────────────────┐ │
│         │                   │          │   MongoDB        │ │
│         │                   └──────────│   Settings       │ │
│         │                              │   Collection     │ │
│         │                              └──────────────────┘ │
│         │                                                    │
│  ┌──────────────┐  ┌──────────────────┐                    │
│  │     Auth     │  │   Validation     │                    │
│  │  Middleware  │  │   Middleware     │                    │
│  └──────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initialization Flow**:
   - Frontend monta el componente de configuración
   - useSettings hook realiza GET /api/settings
   - Backend recupera configuración de MongoDB
   - Frontend actualiza estado con datos recibidos

2. **Update Flow**:
   - Admin modifica tasa de cambio en UI
   - Frontend valida entrada localmente
   - Frontend envía PUT /api/settings con nuevo valor
   - Backend valida autenticación y autorización
   - Backend valida datos con Joi
   - Backend actualiza documento en MongoDB
   - Backend retorna configuración actualizada
   - Frontend actualiza estado local

## Components and Interfaces

### Backend Components

#### 1. Settings Model (`backend/src/models/Settings.ts`)

```typescript
interface ISettings extends Document {
  singleton: boolean;           // Siempre true, asegura un solo documento
  name: string;                 // Nombre de la empresa
  email: string;                // Email de contacto
  timezone: string;             // Zona horaria
  defaultCurrency: 'PEN' | 'USD'; // Moneda por defecto
  exchangeRate: number;         // Tasa de cambio PEN a USD
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Features**:
- Campo `singleton` con índice único para garantizar un solo documento
- Validación de `exchangeRate`: número positivo, mínimo 0.0001, máximo 100
- Valores por defecto para todos los campos
- Timestamps automáticos

#### 2. Settings Controller (`backend/src/controllers/settings.controller.ts`)

**Functions**:

```typescript
// GET /api/settings
export const getSettings = async (req: Request, res: Response)
```
- Recupera la configuración actual
- Si no existe, crea documento con valores por defecto
- Accesible para todos los usuarios autenticados

```typescript
// PUT /api/settings
export const updateSettings = async (req: AuthRequest, res: Response)
```
- Actualiza la configuración
- Requiere rol de administrador
- Valida datos con middleware de Joi
- Usa findOneAndUpdate con upsert para garantizar singleton
- Registra cambios en logs

#### 3. Settings Routes (`backend/src/routes/settings.routes.ts`)

```typescript
router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize('admin'), validateUpdateSettings, updateSettings);
```

**Middleware Chain**:
- `authenticate`: Verifica JWT token
- `authorize('admin')`: Solo para PUT, verifica rol admin
- `validateUpdateSettings`: Valida schema con Joi

#### 4. Validation Schema

```typescript
updateSettings: Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  timezone: Joi.string().optional(),
  defaultCurrency: Joi.string().valid('PEN', 'USD').optional(),
  exchangeRate: Joi.number().min(0.0001).max(100).precision(4).optional()
})
```

### Frontend Components

#### 1. Updated useSettings Hook (`hooks/useSettings.ts`)

**New Implementation**:

```typescript
interface CompanySettings {
  name: string;
  email: string;
  timezone: string;
  defaultCurrency: Currency;
  exchangeRate: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from backend on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      setError('Error loading settings');
      // Fallback to localStorage if backend fails
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newSettings)
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const data = await response.json();
      setSettings(data.data);
      
      // Also update localStorage as backup
      localStorage.setItem('companySettings', JSON.stringify(data.data));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error updating settings' };
    }
  };

  return { settings, loading, error, updateSettings, fetchSettings };
}
```

#### 2. Updated CurrencySettings Component

**Changes**:
- Remove direct localStorage manipulation
- Use updateSettings from hook
- Add loading states during save
- Show success/error notifications
- Display current exchange rate from backend

#### 3. API Integration Layer (`lib/api.ts`)

```typescript
export const settingsAPI = {
  get: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
  
  update: async (settings: Partial<CompanySettings>) => {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  }
};
```

## Data Models

### MongoDB Settings Document

```json
{
  "_id": "ObjectId",
  "singleton": true,
  "name": "Mi Empresa",
  "email": "contacto@miempresa.com",
  "timezone": "America/Lima",
  "defaultCurrency": "PEN",
  "exchangeRate": 0.2700,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### API Request/Response Formats

**GET /api/settings Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Mi Empresa",
    "email": "contacto@miempresa.com",
    "timezone": "America/Lima",
    "defaultCurrency": "PEN",
    "exchangeRate": 0.2700,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**PUT /api/settings Request**:
```json
{
  "exchangeRate": 0.2750
}
```

**PUT /api/settings Response**:
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
    "exchangeRate": 0.2750,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Error Handling

### Backend Error Scenarios

1. **Unauthorized Access** (401):
   - Missing or invalid JWT token
   - Response: `{ success: false, message: "Authentication required" }`

2. **Forbidden Access** (403):
   - Non-admin user attempting to update settings
   - Response: `{ success: false, message: "Acceso denegado" }`

3. **Validation Error** (400):
   - Invalid exchangeRate value (negative, zero, too large)
   - Response: `{ success: false, message: "exchangeRate must be greater than 0.0001" }`

4. **Database Error** (500):
   - MongoDB connection issues
   - Response: `{ success: false, message: "Internal server error" }`

### Frontend Error Handling

1. **Network Errors**:
   - Fallback to localStorage
   - Show toast notification
   - Retry mechanism with exponential backoff

2. **Validation Errors**:
   - Client-side validation before API call
   - Display inline error messages
   - Prevent form submission

3. **Permission Errors**:
   - Disable edit controls for non-admin users
   - Show read-only view
   - Display permission message

## Testing Strategy

### Backend Tests

1. **Model Tests**:
   - Singleton constraint enforcement
   - Validation rules for exchangeRate
   - Default values creation

2. **Controller Tests**:
   - GET settings returns correct data
   - PUT settings updates successfully
   - Authorization checks work correctly
   - Validation errors are handled

3. **Integration Tests**:
   - Full API flow from request to database
   - Authentication middleware integration
   - Error scenarios end-to-end

### Frontend Tests

1. **Hook Tests**:
   - useSettings fetches data on mount
   - updateSettings calls API correctly
   - Error states are handled
   - Loading states work properly

2. **Component Tests**:
   - CurrencySettings renders correctly
   - Form submission triggers update
   - Success/error messages display
   - Admin-only controls are hidden for non-admins

3. **Integration Tests**:
   - Full user flow from page load to save
   - Exchange rate updates reflect in other components
   - Fallback to localStorage works

## Security Considerations

1. **Authentication**:
   - All endpoints require valid JWT token
   - Token validation on every request
   - Secure token storage in httpOnly cookies

2. **Authorization**:
   - Only admin users can modify settings
   - Role-based access control middleware
   - Audit logging for all changes

3. **Input Validation**:
   - Server-side validation with Joi
   - Client-side validation for UX
   - Sanitization of all inputs

4. **Rate Limiting**:
   - Implement rate limiting on PUT endpoint
   - Prevent abuse of settings updates
   - Monitor for suspicious activity

## Migration Strategy

### Phase 1: Backend Implementation
1. Create Settings model and schema
2. Implement controller and routes
3. Add validation middleware
4. Test backend endpoints

### Phase 2: Frontend Integration
1. Update useSettings hook to use API
2. Modify CurrencySettings component
3. Add error handling and loading states
4. Test frontend integration

### Phase 3: Data Migration
1. Read existing localStorage values
2. Create initial MongoDB document with those values
3. Verify data consistency
4. Keep localStorage as backup

### Phase 4: Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Monitor for errors
4. Gradual rollout to users

## Performance Considerations

1. **Caching**:
   - Cache settings in memory on backend (5 minute TTL)
   - Reduce database queries
   - Invalidate cache on updates

2. **Optimization**:
   - Index on singleton field
   - Lean queries for read operations
   - Minimize payload size

3. **Scalability**:
   - Single document design prevents scaling issues
   - No complex queries or joins
   - Fast read/write operations

## Monitoring and Logging

1. **Metrics to Track**:
   - Settings update frequency
   - Failed update attempts
   - API response times
   - Error rates

2. **Logging**:
   - Log all settings changes with user info
   - Log authentication failures
   - Log validation errors
   - Structured logging format

3. **Alerts**:
   - Alert on high error rates
   - Alert on unauthorized access attempts
   - Alert on unusual update patterns
