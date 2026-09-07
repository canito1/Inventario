@echo off
echo 🚀 Iniciando Sistema de Inventario
echo ==================================

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

echo ✅ Dependencias verificadas

REM Ir al directorio backend
cd backend

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias del backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del backend
        pause
        exit /b 1
    )
) else (
    echo ⚠️ Dependencias del backend ya instaladas
)

REM Crear .env si no existe
if not exist ".env" (
    echo ⚠️ Creando archivo .env desde .env.example
    copy ".env.example" ".env"
)

REM Verificar MongoDB
echo 🗄️ Verificando MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    where docker >nul 2>nul
    if %errorlevel% equ 0 (
        echo 🐳 Iniciando MongoDB con Docker...
        docker run -d --name inventory_mongodb -p 27017:27017 mongo:7.0 2>nul || docker start inventory_mongodb 2>nul
        timeout /t 5 /nobreak >nul
    ) else (
        echo 🔧 Por favor, inicia MongoDB manualmente: mongod
        pause
    )
) else (
    echo ✅ MongoDB ya está corriendo
)

REM Poblar base de datos
echo 🌱 Poblando base de datos con datos de prueba...
npm run seed
if %errorlevel% neq 0 (
    echo ⚠️ Error poblando datos (puede que ya existan)
)

REM Mostrar información
echo.
echo ✅ Backend iniciado en http://localhost:5000
echo 📊 Health check: http://localhost:5000/health
echo.
echo 👥 Usuarios de prueba:
echo    Admin: admin@inventory.com / admin123
echo    Manager: manager@inventory.com / manager123
echo    Employee: employee@inventory.com / employee123
echo.
echo 🔧 Para iniciar el frontend, ejecuta en otra terminal:
echo    npm run dev
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.

REM Iniciar backend
npm run dev

pause