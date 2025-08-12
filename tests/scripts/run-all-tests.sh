#!/bin/bash

echo "🚀 Iniciando ejecución de todos los tests automatizados..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar que los servicios estén corriendo
echo "📋 Verificando servicios..."

# Verificar backend
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend corriendo en puerto 3000${NC}"
else
    echo -e "${RED}❌ Backend no está corriendo en puerto 3000${NC}"
    echo "💡 Ejecuta: cd backend && npm run dev"
    exit 1
fi

# Verificar frontend
if curl -f http://localhost:4200 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend corriendo en puerto 4200${NC}"
else
    echo -e "${RED}❌ Frontend no está corriendo en puerto 4200${NC}"
    echo "💡 Ejecuta: cd frontend && npm start"
    exit 1
fi

echo "✅ Servicios verificados"

# Verificar que Chrome esté instalado
if ! command_exists google-chrome && ! command_exists chrome && ! command_exists chromium; then
    echo -e "${YELLOW}⚠️  Chrome no encontrado. Instalando ChromeDriver...${NC}"
    # Aquí podrías agregar lógica para instalar Chrome
fi

# Crear directorio de reportes si no existe
mkdir -p tests/reports

# Ejecutar tests E2E
echo "🧪 Ejecutando tests E2E..."
cd tests
if npm run test:e2e; then
    echo -e "${GREEN}✅ Tests E2E completados exitosamente${NC}"
else
    echo -e "${RED}❌ Tests E2E fallaron${NC}"
    E2E_FAILED=true
fi

# Ejecutar tests de performance
echo "⚡ Ejecutando tests de performance..."
if npm run test:performance; then
    echo -e "${GREEN}✅ Tests de performance completados exitosamente${NC}"
else
    echo -e "${RED}❌ Tests de performance fallaron${NC}"
    PERF_FAILED=true
fi

# Ejecutar tests visuales (si están configurados)
echo "🎨 Ejecutando tests visuales..."
if npm run test:visual; then
    echo -e "${GREEN}✅ Tests visuales completados exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️  Tests visuales no configurados o fallaron${NC}"
fi

# Resumen final
echo ""
echo "📊 Resumen de ejecución:"
echo "========================"

if [ "$E2E_FAILED" = true ]; then
    echo -e "${RED}❌ Tests E2E: FALLARON${NC}"
else
    echo -e "${GREEN}✅ Tests E2E: EXITOSOS${NC}"
fi

if [ "$PERF_FAILED" = true ]; then
    echo -e "${RED}❌ Tests Performance: FALLARON${NC}"
else
    echo -e "${GREEN}✅ Tests Performance: EXITOSOS${NC}"
fi

echo ""
echo "📁 Reportes generados en: tests/reports/"
echo "🎉 Ejecución de tests completada" 