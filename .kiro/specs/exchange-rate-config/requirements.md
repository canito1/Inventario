# Requirements Document

## Introduction

Este documento define los requisitos para implementar la configuración de la tasa de cambio en el sistema de inventario. Actualmente, la tasa de cambio se almacena únicamente en el localStorage del navegador, lo que limita su gestión centralizada y persistencia. Esta funcionalidad permitirá a los administradores configurar y gestionar la tasa de cambio desde el backend, almacenarla en la base de datos MongoDB, y sincronizarla automáticamente con todos los clientes.

## Glossary

- **Sistema de Inventario**: La aplicación web completa que gestiona inventario, productos, entradas y salidas
- **Backend API**: El servidor Express.js que maneja las peticiones HTTP y la lógica de negocio
- **Frontend Client**: La aplicación Next.js que proporciona la interfaz de usuario
- **Settings Collection**: La colección de MongoDB que almacena la configuración del sistema
- **Exchange Rate**: La tasa de conversión entre PEN (Soles Peruanos) y USD (Dólares Americanos)
- **Admin User**: Usuario con rol de administrador que puede modificar la configuración del sistema

## Requirements

### Requirement 1

**User Story:** Como administrador del sistema, quiero poder configurar la tasa de cambio desde la interfaz de configuración, para que todos los usuarios vean la misma tasa actualizada en tiempo real.

#### Acceptance Criteria

1. WHEN Admin User accede a la página de configuración, THE Frontend Client SHALL mostrar el campo de tasa de cambio con el valor actual almacenado en la base de datos
2. WHEN Admin User modifica el valor de la tasa de cambio y guarda los cambios, THE Frontend Client SHALL enviar una petición HTTP PUT al Backend API con el nuevo valor
3. WHEN Backend API recibe la petición de actualización, THE Backend API SHALL validar que el valor sea un número positivo mayor que cero
4. IF el valor de la tasa de cambio es inválido (negativo, cero o no numérico), THEN THE Backend API SHALL retornar un error HTTP 400 con un mensaje descriptivo
5. WHEN la validación es exitosa, THE Backend API SHALL almacenar el nuevo valor en la Settings Collection de MongoDB

### Requirement 2

**User Story:** Como usuario del sistema, quiero que la tasa de cambio se cargue automáticamente desde el servidor al iniciar la aplicación, para que siempre vea la información más actualizada sin depender del localStorage.

#### Acceptance Criteria

1. WHEN Frontend Client se inicializa, THE Frontend Client SHALL realizar una petición HTTP GET al Backend API para obtener la configuración del sistema
2. WHEN Backend API recibe la petición de configuración, THE Backend API SHALL recuperar los datos de la Settings Collection incluyendo la tasa de cambio
3. IF no existe configuración en la base de datos, THEN THE Backend API SHALL retornar valores por defecto con exchangeRate igual a 1.0
4. WHEN Frontend Client recibe la respuesta, THE Frontend Client SHALL actualizar el estado de la aplicación con la tasa de cambio recibida
5. THE Frontend Client SHALL utilizar la tasa de cambio del servidor como fuente de verdad para todas las conversiones de moneda

### Requirement 3

**User Story:** Como desarrollador del sistema, quiero que exista un modelo de datos claro para la configuración, para facilitar el mantenimiento y la extensibilidad del sistema.

#### Acceptance Criteria

1. THE Backend API SHALL definir un esquema de Mongoose para Settings que incluya los campos: name, email, timezone, defaultCurrency y exchangeRate
2. THE Settings Collection SHALL almacenar un único documento de configuración identificado por un campo singleton con valor true
3. WHEN se intenta crear un segundo documento de configuración, THE Backend API SHALL actualizar el documento existente en lugar de crear uno nuevo
4. THE Backend API SHALL validar que exchangeRate sea un número con precisión de hasta 4 decimales
5. THE Backend API SHALL establecer valores por defecto para todos los campos de configuración si no existen

### Requirement 4

**User Story:** Como administrador del sistema, quiero que solo usuarios con permisos de administrador puedan modificar la tasa de cambio, para mantener la seguridad y control de la configuración crítica.

#### Acceptance Criteria

1. WHEN un usuario intenta actualizar la configuración, THE Backend API SHALL verificar que el usuario esté autenticado mediante el token JWT
2. WHEN el token es válido, THE Backend API SHALL verificar que el rol del usuario sea "admin"
3. IF el usuario no tiene rol de administrador, THEN THE Backend API SHALL retornar un error HTTP 403 con mensaje "Acceso denegado"
4. THE Backend API SHALL permitir que cualquier usuario autenticado pueda leer la configuración mediante GET
5. THE Backend API SHALL registrar en logs todos los cambios de configuración incluyendo el usuario que realizó el cambio

### Requirement 5

**User Story:** Como usuario del sistema, quiero que las conversiones de moneda se realicen automáticamente usando la tasa configurada, para ver los precios correctos en mi moneda preferida.

#### Acceptance Criteria

1. WHEN Frontend Client carga datos de productos o transacciones, THE Frontend Client SHALL aplicar la tasa de cambio actual para mostrar valores en ambas monedas
2. THE Frontend Client SHALL mantener sincronizada la tasa de cambio entre el hook useSettings y useExchangeRate
3. WHEN la tasa de cambio se actualiza en la configuración, THE Frontend Client SHALL reflejar los cambios en todas las vistas sin necesidad de recargar la página
4. THE Frontend Client SHALL mostrar un indicador visual cuando la tasa de cambio se está actualizando
5. IF la petición de actualización falla, THEN THE Frontend Client SHALL mostrar un mensaje de error y mantener el valor anterior
