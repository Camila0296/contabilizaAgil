# Tests Automatizados - Sistema de Facturación

Este directorio contiene todos los tests automatizados para el sistema de facturación.

## 📁 Estructura del Proyecto

```
tests/
├── e2e/                          # Tests End-to-End con Cucumber
│   ├── features/                 # Archivos .feature (Gherkin)
│   │   ├── auth.feature         # Tests de autenticación
│   │   ├── facturas.feature     # Tests de gestión de facturas
│   │   └── dashboard.feature    # Tests del dashboard
│   ├── step-definitions/        # Implementación de los steps
│   │   ├── auth.steps.js        # Steps para autenticación
│   │   └── facturas.steps.js    # Steps para facturas
│   ├── support/                 # Configuración y utilidades
│   │   ├── world.js             # Configuración del World
│   │   └── hooks.js             # Hooks de Cucumber
│   └── cucumber.js              # Configuración de Cucumber
├── performance/                  # Tests de rendimiento
│   ├── load-tests/              # Tests de carga
│   │   └── load-test.yml        # Configuración Artillery
│   └── stress-tests/            # Tests de estrés
├── visual/                      # Tests visuales (Playwright)
├── reports/                     # Reportes generados
└── scripts/                     # Scripts de ejecución
    └── run-all-tests.sh         # Script principal
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm run install:all
```

### 2. Iniciar servicios
```bash
npm start
```

### 3. Ejecutar tests
```bash
# Todos los tests
npm run test:all

# Solo tests E2E
npm run test:e2e

# Solo tests de performance
npm run test:performance
```

## 🧪 Tipos de Tests

### Tests E2E (End-to-End)
- **Herramienta**: Cucumber + Selenium WebDriver
- **Propósito**: Probar flujos completos de usuario
- **Ejemplos**: Login, crear facturas, navegación

### Tests de Performance
- **Herramienta**: Artillery
- **Propósito**: Probar rendimiento bajo carga
- **Escenarios**: Carga normal, media y alta

### Tests Visuales
- **Herramienta**: Playwright (opcional)
- **Propósito**: Probar interfaz de usuario
- **Funcionalidades**: Screenshots, comparaciones visuales

## 📋 Comandos Disponibles

```bash
# Tests unitarios (backend + frontend)
npm run test:unit

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance

# Tests visuales
npm run test:visual

# Todos los tests
npm run test:all

# Tests para CI/CD
npm run test:ci
```

## 🏷️ Tags de Cucumber

- `@smoke` - Tests críticos para smoke testing
- `@auth` - Tests de autenticación
- `@facturas` - Tests de gestión de facturas
- `@dashboard` - Tests del dashboard
- `@negative` - Tests de casos negativos
- `@validation` - Tests de validación
- `@wip` - Work in progress (no se ejecutan)
- `@slow` - Tests lentos (no se ejecutan en CI)

### Ejecutar tests por tag
```bash
# Solo tests de autenticación
npm run test:e2e -- --tags @auth

# Excluir tests lentos
npm run test:e2e -- --tags "not @slow"
```

## 📊 Reportes

Los reportes se generan automáticamente en:
- `tests/reports/` - Reportes de Cucumber
- `tests/performance/reports/` - Reportes de Artillery
- Screenshots de tests fallidos

## 🔧 Configuración

### Variables de Entorno
```bash
# URLs de los servicios
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Configuración de tests
TEST_TIMEOUT=30000
BROWSER=chrome
```

### Configuración de Cucumber
- **Paralelización**: 2 workers por defecto
- **Timeouts**: 10s implícito, 30s carga de página
- **Formato**: Pretty formatter para desarrollo

## 🐛 Troubleshooting

### Problemas Comunes

1. **Chrome no encontrado**
   ```bash
   # Instalar ChromeDriver
   npm install -g chromedriver
   ```

2. **Servicios no responden**
   ```bash
   # Verificar que estén corriendo
   curl http://localhost:3000/api/health
   curl http://localhost:4200
   ```

3. **Tests fallan por timeouts**
   - Aumentar timeouts en `cucumber.js`
   - Verificar conectividad de red
   - Revisar logs de servicios

### Debugging

```bash
# Ejecutar tests con más información
npm run test:e2e -- --format progress

# Ejecutar un feature específico
npm run test:e2e -- tests/e2e/features/auth.feature

# Ejecutar un escenario específico
npm run test:e2e -- --tags "@smoke"
```

## 📈 Métricas de Performance

Los tests de performance generan métricas como:
- **RPS**: Requests por segundo
- **Latencia**: Tiempo de respuesta
- **Throughput**: Rendimiento general
- **Error Rate**: Tasa de errores

## 🤝 Contribución

1. Crear feature files en `tests/e2e/features/`
2. Implementar steps en `tests/e2e/step-definitions/`
3. Agregar configuraciones en `tests/e2e/support/`
4. Ejecutar tests antes de commit
5. Actualizar documentación

## 📚 Recursos Adicionales

- [Cucumber Documentation](https://cucumber.io/docs)
- [Selenium WebDriver](https://selenium.dev/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Playwright Documentation](https://playwright.dev/) 