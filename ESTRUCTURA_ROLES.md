# 🎖️ Estructura de Roles y Permisos - Contabiliza Ágil

**Última actualización:** 2026-08-25

---

## 📊 Jerarquía de Roles

```
                    NIVEL 1
                 ┌──────────────┐
                 │ ADMINISTRADOR │
                 └──────────────┘
                        │
                    Control Total

                    NIVEL 2
                 ┌──────────────┐
                 │   CONTADOR    │
                 └──────────────┘
                        │
        Gestión Contable Completa
        (Incluyendo modificar informes)

                    NIVEL 3
                 ┌──────────────┐
                 │   ANALISTA    │
                 └──────────────┘
                        │
        Análisis sin crear/aceptar usuarios
        (NO puede modificar informes)

                    NIVEL 4
                 ┌──────────────┐
                 │   AUXILIAR    │
                 └──────────────┘
                        │
        Entrada de datos (lectura + creación limitada)
        (NO puede modificar ni crear cuentas contables)
```

---

## 🔑 Permisos Detallados por Rol

### 1️⃣ **ADMINISTRADOR** (Nivel 1 - Máximo)

**Descripción:** Control total del sistema

**Permisos:** `*` (Todos)

```
MÓDULO FACTURAS
✅ Crear facturas                (POST /api/facturas)
✅ Ver todas las facturas        (GET /api/facturas - sin filtro)
✅ Editar facturas               (PUT /api/facturas/:id)
✅ Eliminar facturas             (DELETE /api/facturas/:id)

MÓDULO FACTURA CARTERA
✅ Crear factura cartera         (POST /api/facturas-cartera)
✅ Ver todas                      (GET /api/facturas-cartera - sin filtro)
✅ Editar factura cartera        (PUT /api/facturas-cartera/:id)
✅ Eliminar factura cartera      (DELETE /api/facturas-cartera/:id)

MÓDULO TERCEROS
✅ Crear terceros                (POST /api/terceros)
✅ Ver todos los terceros        (GET /api/terceros)
✅ Editar terceros               (PUT /api/terceros/:id)
✅ Eliminar terceros             (DELETE /api/terceros/:id)

MÓDULO PUC (Cuentas Contables)
✅ Crear PUC                     (POST /api/puc)
✅ Ver todos los PUC             (GET /api/puc)
✅ Editar PUC                    (PUT /api/puc/:id)
✅ Eliminar PUC                  (DELETE /api/puc/:id)

MÓDULO USUARIOS
✅ Crear usuarios                (POST /api/users)
✅ Ver todos los usuarios        (GET /api/users)
✅ Editar usuarios               (PUT /api/users/:id)
✅ Cambiar roles                 (PUT /api/users/:id - role field)

MÓDULO APROBACIONES
✅ Ver pendientes                (GET /api/aprobaciones/pendientes)
✅ Ver historial                 (GET /api/aprobaciones/historial)
✅ Ver estadísticas              (GET /api/aprobaciones/estadisticas)
✅ Aprobar usuarios              (PUT /api/aprobaciones/:id/aprobar)
✅ Rechazar usuarios             (PUT /api/aprobaciones/:id/rechazar)
✅ Aprobar en batch              (POST /api/aprobaciones/batch/aprobar)

MÓDULO REPORTES
✅ Ver reportes                  (GET /api/reportes)
✅ Editar reportes               (PUT /api/reportes/:id)
✅ Eliminar reportes             (DELETE /api/reportes/:id)

MÓDULO PANEL/DASHBOARD
✅ Ver dashboard                 (GET /api/facturas/dashboard/stats)

OTROS
✅ Chat IA                       (POST /api/chat/message)
✅ Cambiar contraseña (suya)     (PUT /api/users/me)
✅ Ver perfil                    (GET /api/users/me)
```

**Acceso UI:** Todas las secciones

---

### 2️⃣ **CONTADOR** (Nivel 2)

**Descripción:** Gestión contable y financiera completa

```
MÓDULO FACTURAS
✅ Crear facturas                (POST /api/facturas)
✅ Ver todas las facturas        (GET /api/facturas - sin filtro)
✅ Editar facturas               (PUT /api/facturas/:id)
✅ Eliminar facturas             (DELETE /api/facturas/:id)

MÓDULO FACTURA CARTERA
✅ Crear factura cartera         (POST /api/facturas-cartera)
✅ Ver todas                      (GET /api/facturas-cartera - sin filtro)
✅ Editar factura cartera        (PUT /api/facturas-cartera/:id)
✅ Eliminar factura cartera      (DELETE /api/facturas-cartera/:id)

MÓDULO TERCEROS
✅ Crear terceros                (POST /api/terceros)
✅ Ver todos los terceros        (GET /api/terceros)
✅ Editar terceros               (PUT /api/terceros/:id)
✅ Eliminar terceros             (DELETE /api/terceros/:id)

MÓDULO PUC (Cuentas Contables)
✅ Crear PUC                     (POST /api/puc)
✅ Ver todos los PUC             (GET /api/puc)
✅ Editar PUC                    (PUT /api/puc/:id)
✅ Eliminar PUC                  (DELETE /api/puc/:id)

MÓDULO REPORTES
✅ Ver reportes                  (GET /api/reportes)
✅ EDITAR reportes               (PUT /api/reportes/:id)  ⭐ INCLUIDO
✅ Eliminar reportes             (DELETE /api/reportes/:id)

OTROS
✅ Chat IA                       (POST /api/chat/message)
✅ Cambiar contraseña (suya)     (PUT /api/users/me)
✅ Ver perfil                    (GET /api/users/me)

❌ NO PUEDE:
❌ Crear usuarios                (gestión de usuarios)
❌ Aceptar/Rechazar usuarios     (aprobaciones)
❌ Ver dashboard                 (solo administrador)
```

**Acceso UI:**
- ✅ Facturación
- ✅ Factura Cartera
- ✅ Terceros
- ✅ PUC
- ✅ Reportes (lectura + edición ⭐)
- ✅ Perfil
- ❌ Panel/Dashboard
- ❌ Usuarios
- ❌ Aprobaciones

---

### 3️⃣ **ANALISTA** (Nivel 3)

**Descripción:** Análisis y gestión sin creación de usuarios

```
MÓDULO FACTURAS
✅ Crear facturas                (POST /api/facturas)
✅ Ver todas las facturas        (GET /api/facturas - sin filtro)
✅ Editar facturas               (PUT /api/facturas/:id)
✅ Eliminar facturas             (DELETE /api/facturas/:id)

MÓDULO FACTURA CARTERA
✅ Crear factura cartera         (POST /api/facturas-cartera)
✅ Ver todas                      (GET /api/facturas-cartera - sin filtro)
✅ Editar factura cartera        (PUT /api/facturas-cartera/:id)
✅ Eliminar factura cartera      (DELETE /api/facturas-cartera/:id)

MÓDULO TERCEROS
✅ Crear terceros                (POST /api/terceros)
✅ Ver todos los terceros        (GET /api/terceros)
✅ Editar terceros               (PUT /api/terceros/:id)
✅ Eliminar terceros             (DELETE /api/terceros/:id)

MÓDULO PUC (Cuentas Contables)
✅ Ver todos los PUC             (GET /api/puc)
❌ NO puede crear/editar/eliminar

MÓDULO REPORTES
✅ Ver reportes                  (GET /api/reportes)
❌ NO puede editar/eliminar      

OTROS
✅ Chat IA                       (POST /api/chat/message)
✅ Cambiar contraseña (suya)     (PUT /api/users/me)
✅ Ver perfil                    (GET /api/users/me)

❌ NO PUEDE:
❌ Crear usuarios                (POST /api/users)
❌ Aceptar/Rechazar usuarios     (PUT /api/aprobaciones/:id/*)
❌ Editar reportes               ❌ CRÍTICO
❌ Crear cuentas contables       (POST /api/puc)
```

**Acceso UI:**
- ✅ Facturación
- ✅ Factura Cartera
- ✅ Terceros
- ✅ PUC (solo lectura)
- ✅ Reportes (solo lectura)
- ✅ Perfil
- ❌ Panel/Dashboard
- ❌ Usuarios
- ❌ Aprobaciones

---

### 4️⃣ **AUXILIAR** (Nivel 4 - Básico)

**Descripción:** Entrada de datos y consulta de información

```
MÓDULO FACTURAS
✅ Crear facturas de venta       (POST /api/facturas)
✅ Crear facturas de compra      (POST /api/facturas)
✅ Ver facturas                  (GET /api/facturas - solo suyas)
❌ NO puede editar/eliminar

MÓDULO FACTURA CARTERA
✅ Crear factura cartera         (POST /api/facturas-cartera)
✅ Ver factura cartera           (GET /api/facturas-cartera - solo suyas)
❌ NO puede editar/eliminar

MÓDULO TERCEROS
✅ Crear terceros                (POST /api/terceros)  ⭐ INCLUIDO
✅ Ver terceros                  (GET /api/terceros)
❌ NO puede editar/eliminar

MÓDULO PUC (Cuentas Contables)
✅ Ver PUC                       (GET /api/puc)
❌ NO puede crear/editar/eliminar ❌ CRÍTICO

MÓDULO REPORTES
✅ Ver reportes                  (GET /api/reportes)
❌ NO puede editar

OTROS
✅ Chat IA                       (POST /api/chat/message)
✅ Cambiar contraseña (suya)     (PUT /api/users/me)
✅ Ver perfil                    (GET /api/users/me)

❌ NO PUEDE:
❌ Crear usuarios                (POST /api/users)
❌ Aceptar/Rechazar usuarios     (aprobaciones)
❌ Editar facturas               (solo crear/leer)
❌ Editar terceros               (solo crear/leer)
❌ Crear cuentas contables       (PUC)
```

**Acceso UI:**
- ✅ Facturación (solo crear facturas)
- ✅ Factura Cartera (solo crear)
- ✅ Terceros (crear solo)
- ✅ Reportes (solo lectura)
- ✅ Perfil
- ❌ Panel/Dashboard
- ❌ Usuarios
- ❌ Aprobaciones
- ❌ PUC (edición)

---

## 📋 Matriz de Permisos Resumida

```
┌──────────────────────────────────┬──────────┬─────────┬───────────┬──────────┐
│ Acción                           │   ADM    │ CONTADOR│ ANALISTA  │ AUXILIAR │
├──────────────────────────────────┼──────────┼─────────┼───────────┼──────────┤
│ Crear factura                    │    ✅    │   ✅    │    ✅     │    ✅    │
│ Ver factura (todas/suyas)        │    ✅    │   ✅    │    ✅     │   Suyas  │
│ Editar factura                   │    ✅    │   ✅    │    ✅     │    ❌    │
│ Eliminar factura                 │    ✅    │   ✅    │    ✅     │    ❌    │
│                                  │          │         │           │          │
│ Crear tercero                    │    ✅    │   ✅    │    ✅     │    ✅    │
│ Ver tercero                      │    ✅    │   ✅    │    ✅     │    ✅    │
│ Editar tercero                   │    ✅    │   ✅    │    ✅     │    ❌    │
│ Eliminar tercero                 │    ✅    │   ✅    │    ✅     │    ❌    │
│                                  │          │         │           │          │
│ Crear PUC                        │    ✅    │   ✅    │    ❌     │    ❌    │
│ Ver PUC                          │    ✅    │   ✅    │    ✅     │    ✅    │
│ Editar PUC                       │    ✅    │   ✅    │    ❌     │    ❌    │
│ Eliminar PUC                     │    ✅    │   ✅    │    ❌     │    ❌    │
│                                  │          │         │           │          │
│ Ver reportes                     │    ✅    │   ✅    │    ✅     │    ✅    │
│ EDITAR reportes                  │    ✅    │   ✅    │    ❌     │    ❌    │
│ Eliminar reportes                │    ✅    │   ✅    │    ❌     │    ❌    │
│                                  │          │         │           │          │
│ Crear usuario                    │    ✅    │   ❌    │    ❌     │    ❌    │
│ Editar usuario                   │    ✅    │   ❌    │    ❌     │    ❌    │
│ Aceptar usuario nuevo            │    ✅    │   ❌    │    ❌     │    ❌    │
│ Ver panel/dashboard              │    ✅    │   ❌    │    ❌     │    ❌    │
│                                  │          │         │           │          │
│ Chat IA                          │    ✅    │   ✅    │    ✅     │    ✅    │
│ Cambiar contraseña (suya)        │    ✅    │   ✅    │    ✅     │    ✅    │
└──────────────────────────────────┴──────────┴─────────┴───────────┴──────────┘
```

---

## 🛠️ Instalación/Ejecución

### Script de Siembra de Roles

```bash
# Crear los 4 roles en la base de datos
node backend/scripts/seed-roles.js

# Output esperado:
# ✅ Conectado a MongoDB
# Rol administrador creado
# Rol contador creado
# Rol analista creado
# Rol auxiliar creado
# ✅ 4 roles creados:
#   📌 ADMINISTRADOR (Nivel 1)
#   📌 CONTADOR (Nivel 2)
#   📌 ANALISTA (Nivel 3)
#   📌 AUXILIAR (Nivel 4)
# ✨ Script de siembra completado
```

### Actualización Automática

El archivo `backend/database.js` ahora crea los 4 roles automáticamente al iniciar si no existen.

---

## 📝 Asignación de Roles

### Crear usuario con rol específico

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer {token-admin}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "role": "contador"  # o "analista", "auxiliar", "administrador"
  }'
```

### Cambiar rol de usuario existente

```bash
curl -X PUT http://localhost:3000/api/users/{userId} \
  -H "Authorization: Bearer {token-admin}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "analista"
  }'
```

---

## 🎓 Casos de Uso Típicos

### Empresa Pequeña
- 1 **Administrador** (dueño)
- 1 **Contador** (contador de la empresa)
- 1-2 **Auxiliar** (digitadores)

### Empresa Mediana
- 1-2 **Administrador** (TI/gerencia)
- 2-3 **Contador** (contadores principales)
- 2-3 **Analista** (analistas de contabilidad)
- 5-10 **Auxiliar** (personal de entrada de datos)

### Empresa Grande
- 2-3 **Administrador** (TI)
- 5+ **Contador** (gestión completa)
- 10+ **Analista** (análisis sin edición de reportes)
- 20+ **Auxiliar** (entrada de datos)

---

## 🔒 Notas de Seguridad

1. **Backend SIEMPRE valida:** El rol en localStorage es solo para UI
2. **Menor privilegio:** Asignar el rol mínimo necesario
3. **Auditoría:** Registrar cambios de rol
4. **Contraña fuerte:** Cambiar admin123 antes de producción

---

*Sistema de roles y permisos: 2026-08-25*
