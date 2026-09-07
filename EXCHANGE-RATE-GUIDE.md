# Guía del Tipo de Cambio Manual

## ✅ **Funcionalidad Implementada:**

### 🔧 **Campo de Configuración:**

- **Ubicación**: Página de Configuración (`/configuracion`)
- **Campo**: "Tipo de Cambio Manual"
- **Tipo**: Número decimal con 4 decimales de precisión
- **Valor por defecto**: 1.0000

### 📊 **Características:**

- **Configuración manual**: Puedes establecer el tipo de cambio manualmente
- **Persistencia**: Se guarda automáticamente en localStorage
- **Conversión automática**: Se usa para convertir entre PEN y USD
- **Visualización en tiempo real**: Muestra el tipo de cambio actual y su inverso

### 🎯 **Cómo Usar:**

1. **Ir a Configuración**:

   - Navega a `/configuracion` desde el sidebar
   - Busca la sección "Configuración de Moneda"

2. **Establecer Tipo de Cambio**:

   - Ingresa el valor en el campo "Tipo de Cambio Manual"
   - Ejemplo: Si 1 PEN = 0.2700 USD, ingresa `0.2700`
   - El sistema calculará automáticamente el inverso

3. **Ver Conversiones**:
   - El componente muestra ejemplos de conversión
   - Puedes ver tanto PEN → USD como USD → PEN

### 💻 **Para Desarrolladores:**

#### Hook `useExchangeRate`:

```typescript
import { useExchangeRate } from "@/hooks/useExchangeRate";

const {
  exchangeRate, // Tipo de cambio actual
  defaultCurrency, // Moneda por defecto
  convertToUSD, // Convertir a USD
  convertFromUSD, // Convertir desde USD
  convertCurrency, // Convertir entre monedas
  formatCurrency, // Formatear con símbolo
} = useExchangeRate();
```

#### Ejemplos de Uso:

```typescript
// Convertir 100 PEN a USD
const usdAmount = convertToUSD(100, "PEN");

// Convertir 50 USD a PEN
const penAmount = convertFromUSD(50, "PEN");

// Formatear moneda
const formatted = formatCurrency(100, "PEN"); // "S/100.00"
```

### 🔄 **Flujo de Datos:**

1. Usuario ingresa tipo de cambio en configuración
2. Se guarda en `useSettings` hook
3. `useExchangeRate` hook lee la configuración
4. Componentes usan el hook para conversiones automáticas

### 📱 **Componentes Disponibles:**

- **ExchangeRateDisplay**: Muestra el tipo de cambio actual con ejemplos
- **CurrencySettings**: Configuración en la página de settings

### 🎨 **Interfaz:**

- **Campo numérico**: Con validación y formato decimal
- **Información en tiempo real**: Muestra conversiones automáticamente
- **Diseño responsive**: Funciona en móvil y desktop
- **Feedback visual**: Colores y iconos para mejor UX

El sistema está listo para usar y se integra automáticamente con el resto de la aplicación de inventario.
