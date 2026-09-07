# 📦 Sistema de Inventario Completo

Sistema completo de gestión de inventario de materiales y herramientas con frontend en Next.js y backend en Node.js.

## 🏗️ Arquitectura

```
📁 Proyecto/
├── 🎨 Frontend (Next.js + TypeScript + Tailwind)
│   ├── components/     # Componentes React
│   ├── lib/           # Servicios API y utilidades
│   ├── contexts/      # Context providers
│   └── pages/         # Páginas de la aplicación
│
└── 🔧 Backend (Node.js + Express + MongoDB)
    ├── src/
    │   ├── controllers/   # Lógica de negocio
    │   ├── models/       # Modelos de MongoDB
    │   ├── routes/       # Rutas de la API
    │   ├── middleware/   # Middlewares
    │   └── config/       # Configuraciones
    └── dist/             # Código compilado
```

## ⚡ Inicio Rápido

### Opción 1: Script Automático (Windows)
```bash
# Ejecutar script de inicio
start-system.bat
```

### Opción 2: Manual

1. **Iniciar Backend**
```bash
cd backend
npm install
npm run seed    # Datos de prueba
npm run dev     # Puerto 5000
```

2. **Iniciar Frontend** (en otra terminal)
```bash
npm install
npm run dev     # Puerto 3000
```

3. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 👥 Usuarios de Prueba

| Email | Password | Rol | Permisos |
|-------|----------|-----|----------|
| admin@inventory.com | admin123 | Admin | Todos los permisos |
| manager@inventory.com | manager123 | Manager | Gestión de items y categorías |
| employee@inventory.com | employee123 | Employee | Solo lectura |

## 🎯 Características

### Frontend
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Gestión de Items** con tabla interactiva
- ✅ **Categorías** organizadas
- ✅ **Alertas de Stock Bajo** automáticas
- ✅ **Búsqueda y Filtros** avanzados
- ✅ **Responsive Design** para móviles
- ✅ **Autenticación** con roles
- ✅ **Interfaz Moderna** con Tailwind CSS

### Backend
- ✅ **API RESTful** completa
- ✅ **Autenticación JWT** segura
- ✅ **Base de Datos MongoDB** optimizada
- ✅ **Validación de Datos** robusta
- ✅ **Sistema de Permisos** por roles
- ✅ **Paginación** y filtros
- ✅ **Gestión de Stock** inteligente
- ✅ **Estadísticas** en tiempo real
- ✅ **Seguridad** (helmet, rate limiting)
- ✅ **Docker Ready** para despliegue

## 📊 Funcionalidades del Sistema

### Gestión de Inventario
- **Items**: Crear, editar, eliminar y buscar productos
- **Categorías**: Organizar items por categorías
- **Stock**: Control de cantidades, mínimos y máximos
- **Ubicaciones**: Rastrear dónde están los items
- **Códigos de Barras**: Identificación única opcional

### Dashboard y Reportes
- **Estadísticas Generales**: Total items, valor, categorías
- **Alertas de Stock**: Items que requieren reposición
- **Tendencias**: Análisis temporal de inventario
- **Distribución por Categorías**: Visualización de datos

### Gestión de Usuarios
- **Roles**: Admin, Manager, Employee
- **Permisos**: Control granular de acceso
- **Perfiles**: Gestión de información personal
- **Seguridad**: Cambio de contraseñas

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **React Hook Form** - Gestión de formularios
- **Axios** - Cliente HTTP
- **Zod** - Validación de esquemas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Joi** - Validación de datos
- **Bcrypt** - Hash de contraseñas
- **TypeScript** - Tipado estático

## 🐳 Despliegue con Docker

```bash
# Backend con MongoDB
cd backend
docker-compose up -d

# Frontend (separado)
docker build -t inventory-frontend .
docker run -p 3000:3000 inventory-frontend
```

## 📱 Capturas de Pantalla

### Dashboard Principal
- Vista general del inventario
- Estadísticas en tiempo real
- Alertas de stock bajo

### Gestión de Items
- Tabla interactiva con filtros
- Formularios de creación/edición
- Búsqueda avanzada

### Sistema de Usuarios
- Login seguro
- Gestión de perfiles
- Control de permisos

## 🔒 Seguridad

- **Autenticación JWT** con expiración
- **Hash de contraseñas** con bcrypt
- **Rate Limiting** para prevenir ataques
- **Validación de datos** en frontend y backend
- **CORS** configurado correctamente
- **Headers de seguridad** con helmet

## 📈 Rendimiento

- **Paginación** para grandes datasets
- **Índices de base de datos** optimizados
- **Compresión** de respuestas HTTP
- **Lazy loading** de componentes
- **Caché** de consultas frecuentes

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

## 📚 Documentación API

La API está documentada con ejemplos en el archivo `backend/README.md`.

Endpoints principales:
- `GET /api/items` - Listar items
- `POST /api/items` - Crear item
- `GET /api/dashboard/stats` - Estadísticas
- `POST /api/auth/login` - Autenticación

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas:
- Abrir un issue en GitHub
- Revisar la documentación en `/backend/README.md`
- Consultar el archivo `QUICK_START.md` para inicio rápido

---

**¡Sistema de Inventario listo para producción! 🚀**