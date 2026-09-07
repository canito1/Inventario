# 🚀 Inicio Rápido - Backend Sistema de Inventario

## ⚡ Configuración Rápida (5 minutos)

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

### 3. Iniciar MongoDB

```bash
# Opción 1: MongoDB local
mongod

# Opción 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Opción 3: Docker Compose (incluye backend)
docker-compose up -d
```

### 4. Poblar base de datos con datos de prueba

```bash
npm run seed
```

### 5. Iniciar servidor

```bash
npm run dev
```

¡Listo! El servidor estará corriendo en http://localhost:5000

## 🧪 Probar la API

### Health Check

```bash
curl http://localhost:5000/health
```

### Login de prueba

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"admin123"}'
```

### Obtener items (requiere token)

```bash
curl -X GET http://localhost:5000/api/items \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 👥 Usuarios de Prueba

| Email                  | Password    | Rol      |
| ---------------------- | ----------- | -------- |
| admin@inventory.com    | admin123    | admin    |
| manager@inventory.com  | manager123  | manager  |
| employee@inventory.com | employee123 | employee |

## 📊 Endpoints Principales

- `GET /health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/items` - Listar items
- `GET /api/categories` - Listar categorías
- `GET /api/dashboard/stats` - Estadísticas

## 🐳 Con Docker

```bash
# Iniciar todo (MongoDB + Backend)
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar servicios
docker-compose down
```

## 🔧 Comandos Útiles

```bash
npm run dev        # Desarrollo
npm run build      # Compilar
npm start          # Producción
npm run seed       # Datos de prueba
npm test           # Tests
```

## 🌐 Frontend

Para conectar con el frontend, asegúrate de que la variable `NEXT_PUBLIC_API_URL` en el frontend apunte a `http://localhost:5000/api`.
