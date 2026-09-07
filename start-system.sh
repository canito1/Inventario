#!/bin/bash

echo "🚀 Iniciando Sistema de Inventario"
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo -e "${BLUE}📋 Verificando dependencias...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

if ! command_exists mongod && ! command_exists docker; then
    echo -e "${RED}❌ MongoDB o Docker no están instalados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias verificadas${NC}"

# Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error instalando dependencias del backend${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ Dependencias del backend ya instaladas${NC}"
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Creando archivo .env desde .env.example${NC}"
    cp .env.example .env
fi

# Iniciar MongoDB si no está corriendo
echo -e "${BLUE}🗄️ Verificando MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    if command_exists docker; then
        echo -e "${YELLOW}🐳 Iniciando MongoDB con Docker...${NC}"
        docker run -d --name inventory_mongodb -p 27017:27017 mongo:7.0 2>/dev/null || docker start inventory_mongodb 2>/dev/null
        sleep 5
    else
        echo -e "${YELLOW}🔧 Por favor, inicia MongoDB manualmente: mongod${NC}"
        read -p "Presiona Enter cuando MongoDB esté corriendo..."
    fi
else
    echo -e "${GREEN}✅ MongoDB ya está corriendo${NC}"
fi

# Poblar base de datos
echo -e "${BLUE}🌱 Poblando base de datos con datos de prueba...${NC}"
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Error poblando datos (puede que ya existan)${NC}"
fi

# Iniciar backend
echo -e "${BLUE}🚀 Iniciando servidor backend...${NC}"
echo -e "${GREEN}✅ Backend iniciado en http://localhost:5000${NC}"
echo -e "${GREEN}📊 Health check: http://localhost:5000/health${NC}"
echo ""
echo -e "${YELLOW}👥 Usuarios de prueba:${NC}"
echo -e "   Admin: admin@inventory.com / admin123"
echo -e "   Manager: manager@inventory.com / manager123"
echo -e "   Employee: employee@inventory.com / employee123"
echo ""
echo -e "${BLUE}🔧 Para iniciar el frontend, ejecuta en otra terminal:${NC}"
echo -e "   npm run dev"
echo ""
echo -e "${RED}Para detener el servidor, presiona Ctrl+C${NC}"
echo ""

npm run dev