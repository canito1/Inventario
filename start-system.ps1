# Script de PowerShell para iniciar el Sistema de Inventario
Write-Host "🚀 Iniciando Sistema de Inventario" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Función para verificar si un comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar dependencias
Write-Host "📋 Verificando dependencias..." -ForegroundColor Blue

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "mongod") -and -not (Test-Command "docker")) {
    Write-Host "❌ MongoDB o Docker no están instalados" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias verificadas" -ForegroundColor Green

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Blue
Set-Location backend

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ Dependencias del backend ya instaladas" -ForegroundColor Yellow
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ Creando archivo .env desde .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Verificar MongoDB
Write-Host "🗄️ Verificando MongoDB..." -ForegroundColor Blue
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue

if (-not $mongoProcess) {
    if (Test-Command "docker") {
        Write-Host "🐳 Iniciando MongoDB con Docker..." -ForegroundColor Yellow
        try {
            docker run -d --name inventory_mongodb -p 27017:27017 mongo:7.0 2>$null
        } catch {
            docker start inventory_mongodb 2>$null
        }
        Start-Sleep -Seconds 5
    } else {
        Write-Host "🔧 Por favor, inicia MongoDB manualmente: mongod" -ForegroundColor Yellow
        Read-Host "Presiona Enter cuando MongoDB esté corriendo"
    }
} else {
    Write-Host "✅ MongoDB ya está corriendo" -ForegroundColor Green
}

# Poblar base de datos
Write-Host "🌱 Poblando base de datos con datos de prueba..." -ForegroundColor Blue
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Error poblando datos (puede que ya existan)" -ForegroundColor Yellow
}

# Mostrar información
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Blue
Write-Host "✅ Backend iniciado en http://localhost:5000" -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:5000/health" -ForegroundColor Green
Write-Host ""
Write-Host "👥 Usuarios de prueba:" -ForegroundColor Yellow
Write-Host "   Admin: admin@inventory.com / admin123"
Write-Host "   Manager: manager@inventory.com / manager123"
Write-Host "   Employee: employee@inventory.com / employee123"
Write-Host ""
Write-Host "🔧 Para iniciar el frontend, ejecuta en otra terminal:" -ForegroundColor Blue
Write-Host "   npm run dev"
Write-Host ""
Write-Host "Para detener el servidor, presiona Ctrl+C" -ForegroundColor Red
Write-Host ""

# Iniciar backend
npm run dev