# Sistema de Inventario - Backend

Backend para sistema de inventario de materiales y herramientas desarrollado con Node.js, Express, MongoDB y TypeScript.

## 🚀 Características

- **Autenticación JWT** con roles (admin, manager, employee)
- **CRUD completo** para items, categorías y usuarios
- **Sistema de permisos** basado en roles
- **Paginación** y filtros avanzados
- **Validación de datos** con Joi
- **Gestión de stock** con alertas de stock bajo
- **Dashboard** con estadísticas en tiempo real
- **API RESTful** bien documentada
- **Seguridad** con helmet, rate limiting y CORS
- **Base de datos** MongoDB con Mongoose

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inventory_system
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

4. **Iniciar MongoDB**
Asegúrate de que MongoDB esté ejecutándose en tu sistema.

5. **Ejecutar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🌱 Datos de Prueba

Para poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 3 usuarios de prueba (admin, manager, employee)
- 5 categorías de ejemplo
- 10 items de muestra

### Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@inventory.com | admin123 | admin |
| manager@inventory.com | manager123 | manager |
| employee@inventory.com | employee123 | employee |

## 📚 API Endpoints

### Autenticación
```
POST /api/auth/register    # Registrar usuario
POST /api/auth/login       # Iniciar sesión
GET  /api/auth/profile     # Obtener perfil
PUT  /api/auth/profile     # Actualizar perfil
PUT  /api/auth/change-password # Cambiar contraseña
```

### Items
```
GET    /api/items          # Listar items (con filtros y paginación)
GET    /api/items/:id      # Obtener item por ID
POST   /api/items          # Crear item (manager/admin)
PUT    /api/items/:id      # Actualizar item (manager/admin)
DELETE /api/items/:id      # Eliminar item (admin)
PUT    /api/items/:id/stock # Actualizar stock (manager/admin)
GET    /api/items/low-stock # Items con stock bajo
GET    /api/items/stats    # Estadísticas de items
```

### Categorías
```
GET    /api/categories     # Listar categorías
GET    /api/categories/:id # Obtener categoría por ID
POST   /api/categories     # Crear categoría (manager/admin)
PUT    /api/categories/:id # Actualizar categoría (manager/admin)
DELETE /api/categories/:id # Eliminar categoría (admin)
GET    /api/categories/stats # Estadísticas de categorías
```

### Usuarios
```
GET    /api/users          # Listar usuarios (admin)
GET    /api/users/:id      # Obtener usuario por ID (admin)
PUT    /api/users/:id      # Actualizar usuario (admin)
DELETE /api/users/:id      # Eliminar usuario (admin)
PUT    /api/users/:id/toggle-status # Activar/desactivar usuario (admin)
GET    /api/users/stats    # Estadísticas de usuarios (admin)
```

### Dashboard
```
GET /api/dashboard/stats            # Estadísticas generales
GET /api/dashboard/inventory-overview # Resumen de inventario
```

## 🔐 Sistema de Permisos

### Roles y Permisos

| Acción | Employee | Manager | Admin |
|--------|----------|---------|-------|
| Ver items | ✅ | ✅ | ✅ |
| Crear items | ❌ | ✅ | ✅ |
| Editar items | ❌ | ✅ | ✅ |
| Eliminar items | ❌ | ❌ | ✅ |
| Gestionar categorías | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver dashboard | ✅ | ✅ | ✅ |

## 📊 Filtros y Búsqueda

### Items
- `search`: Búsqueda por nombre, descripción o ubicación
- `category`: Filtrar por categoría
- `status`: Filtrar por estado (active, inactive, discontinued)
- `lowStock`: Solo items con stock bajo
- `page` y `limit`: Paginación

Ejemplo:
```
GET /api/items?search=martillo&category=60f7b3b3b3b3b3b3b3b3b3b3&lowStock=true&page=1&limit=10
```

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad
- **Rate Limiting**: Límite de peticiones por IP
- **CORS**: Configurado para el frontend
- **JWT**: Tokens seguros con expiración
- **Bcrypt**: Hash de contraseñas
- **Validación**: Joi para validar datos de entrada

## 🗄️ Estructura de Base de Datos

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'manager', 'employee'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Categories
```javascript
{
  name: String (unique),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Items
```javascript
{
  name: String,
  description: String,
  category: ObjectId (ref: Category),
  quantity: Number,
  minStock: Number,
  maxStock: Number,
  price: Number,
  location: String,
  barcode: String (unique, optional),
  image: String (optional),
  status: ['active', 'inactive', 'discontinued'],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilar TypeScript
npm start          # Servidor de producción
npm run seed       # Poblar base de datos
npm test           # Ejecutar tests
```

## 🚀 Despliegue

### Variables de Entorno para Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/inventory_system
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion
FRONTEND_URL=https://tu-frontend-domain.com
```

### Docker (Opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.