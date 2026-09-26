# 🔐 Roles y Permisos - Contabiliza Ágil

## 📋 Roles Definidos

El sistema tiene **3 roles principales**:

```
┌─────────────┬──────────────────┬─────────────────────────┐
│ Rol         │ Código Backend   │ Descripción             │
├─────────────┼──────────────────┼─────────────────────────┤
│ admin       │ 'admin'          │ Administrador del sistema
│ user        │ 'user'           │ Usuario estándar
│ approver    │ 'approver'       │ Aprobador de solicitudes
└─────────────┴──────────────────┴─────────────────────────┘
```

---

## 🔑 Roles por Detalle

### 1️⃣ **Admin** (Administrador)

**Descripción:** Control total del sistema

**Permisos:**
```
✅ Dashboard/Panel                    (GET /api/facturas/dashboard/stats)
✅ Crear Facturas                     (POST /api/facturas)
✅ Ver todas las Facturas             (GET /api/facturas)
✅ Editar/Eliminar Facturas           (PUT/DELETE /api/facturas/:id)
✅ Crear FacturaCartera               (POST /api/facturas-cartera)
✅ Ver todas las FacturaCartera       (GET /api/facturas-cartera)
✅ Editar/Eliminar FacturaCartera     (PUT/DELETE /api/facturas-cartera/:id)
✅ Gestionar Usuarios                 (POST/PUT/GET /api/users)
✅ Cambiar Roles de Usuarios          (PUT /api/users/:id)
✅ Crear Terceros                     (POST /api/terceros)
✅ Gestionar PUC                      (POST/PUT/GET /api/puc)
✅ Aprobar Usuarios                   (PUT /api/aprobaciones/:id/aprobar)
✅ Rechazar Usuarios                  (PUT /api/aprobaciones/:id/rechazar)
✅ Aprobar en Batch                   (POST /api/aprobaciones/batch/aprobar)
✅ Ver Reportes                       (GET /api/reportes)
✅ Cambiar Contraseña (suya)          (PUT /api/users/me)
✅ Chat IA                            (POST /api/chat/message)
```

**Acceso UI:**
- ✅ Panel/Dashboard
- ✅ Facturación (crear/editar/eliminar)
- ✅ Factura Cartera
- ✅ Usuarios (crear/editar/eliminar)
- ✅ Terceros
- ✅ PUC
- ✅ Aprobaciones
- ✅ Reportes
- ✅ Perfil

---

### 2️⃣ **User** (Usuario Estándar)

**Descripción:** Usuario de facturación básico

**Permisos:**
```
✅ Ver sus propias Facturas           (GET /api/facturas - filtrado por usuario)
✅ Crear Facturas                     (POST /api/facturas)
✅ Editar sus propias Facturas        (PUT /api/facturas/:id - solo suyas)
✅ Eliminar sus propias Facturas      (DELETE /api/facturas/:id - solo suyas)
✅ Ver su propio FacturaCartera       (GET /api/facturas-cartera - filtrado)
✅ Crear FacturaCartera               (POST /api/facturas-cartera)
✅ Editar sus propias FacturaCartera  (PUT /api/facturas-cartera/:id - solo suyas)
✅ Ver Terceros                       (GET /api/terceros)
✅ Ver PUC                            (GET /api/puc)
✅ Cambiar Contraseña (suya)          (PUT /api/users/me)
✅ Ver su Perfil                      (GET /api/users/me)
✅ Chat IA                            (POST /api/chat/message)

❌ No puede ver facturas de otros usuarios
❌ No puede eliminar FacturaCartera de otros
❌ No puede gestionar usuarios
❌ No puede aprobar usuarios
❌ No puede ver panel/dashboard
❌ No puede ver reportes
❌ No puede crear/editar terceros
```

**Acceso UI:**
- ✅ Facturación (solo las suyas)
- ✅ Factura Cartera (solo las suyas)
- ✅ Perfil
- ❌ Panel/Dashboard
- ❌ Usuarios
- ❌ Terceros
- ❌ PUC
- ❌ Aprobaciones
- ❌ Reportes

---

### 3️⃣ **Approver** (Aprobador)

**Descripción:** Aprobador de solicitudes de usuarios

**Permisos:**
```
✅ Ver usuarios pendientes de aprobación    (GET /api/aprobaciones/pendientes)
✅ Ver historial de aprobaciones           (GET /api/aprobaciones/historial)
✅ Ver estadísticas de aprobaciones        (GET /api/aprobaciones/estadisticas)
✅ Aprobar usuario individual              (PUT /api/aprobaciones/:id/aprobar)
✅ Rechazar usuario individual             (PUT /api/aprobaciones/:id/rechazar)
✅ Aprobar múltiples usuarios (batch)      (POST /api/aprobaciones/batch/aprobar)
✅ Ver su Perfil                           (GET /api/users/me)
✅ Cambiar Contraseña (suya)               (PUT /api/users/me)
✅ Chat IA                                 (POST /api/chat/message)

❌ No puede crear ni editar facturas
❌ No puede gestionar otros usuarios
❌ No puede ver facturas
❌ No puede ver panel/dashboard
```

**Acceso UI:**
- ✅ Aprobaciones (solo gestión de aprobaciones)
- ✅ Perfil
- ❌ Panel/Dashboard
- ❌ Facturación
- ❌ Factura Cartera
- ❌ Usuarios
- ❌ Terceros
- ❌ PUC
- ❌ Reportes

---

## 🔄 Matriz de Control de Acceso

```
┌──────────────────────────────┬────────┬───────┬──────────┐
│ Funcionalidad                │ Admin  │ User  │ Approver │
├──────────────────────────────┼────────┼───────┼──────────┤
│ Ver Dashboard                │ ✅    │ ❌   │ ❌      │
│ Crear Factura                │ ✅    │ ✅   │ ❌      │
│ Ver Facturas (suyas)         │ ✅    │ ✅   │ ❌      │
│ Ver Facturas (todas)         │ ✅    │ ❌   │ ❌      │
│ Editar Factura               │ ✅    │ ✅*  │ ❌      │
│ Eliminar Factura             │ ✅    │ ✅*  │ ❌      │
│                              │        │       │          │
│ Gestionar Usuarios           │ ✅    │ ❌   │ ❌      │
│ Aprobar Usuario              │ ✅    │ ❌   │ ✅      │
│ Rechazar Usuario             │ ✅    │ ❌   │ ✅      │
│ Aprobar Batch                │ ✅    │ ❌   │ ✅      │
│                              │        │       │          │
│ Ver Terceros                 │ ✅    │ ✅   │ ❌      │
│ Crear/Editar Terceros        │ ✅    │ ❌   │ ❌      │
│                              │        │       │          │
│ Ver PUC                      │ ✅    │ ✅   │ ❌      │
│ Crear/Editar PUC             │ ✅    │ ❌   │ ❌      │
│                              │        │       │          │
│ Ver Reportes                 │ ✅    │ ❌   │ ❌      │
│ Chat IA                      │ ✅    │ ✅   │ ✅      │
│ Ver Perfil                   │ ✅    │ ✅   │ ✅      │
│ Cambiar Contraseña (suya)    │ ✅    │ ✅   │ ✅      │
└──────────────────────────────┴────────┴───────┴──────────┘

* = Solo de su propiedad
```

---

## 🛠️ Implementación Backend

### Middleware de Autenticación
**Archivo:** `backend/middleware/auth.js`

```javascript
// Verifica JWT y adjunta usuario a req.user
// req.user.roles = ['admin'] | ['user'] | ['approver']
```

### Middleware de Roles
**Archivo:** `backend/middleware/role.js`

```javascript
// Uso: router.use(role('admin', 'approver'))
// Verifica que el usuario tenga al menos uno de los roles

if (!userRoles.some(role => allowedRoles.includes(role))) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

### Ejemplo de Uso en Rutas

```javascript
// Solo admins
router.put('/:id', auth, role('admin'), updateUser);

// Admins y aprobadores
router.use(auth, role('admin', 'approver'));
router.get('/pendientes', getPendientes);

// Cualquier usuario autenticado
router.get('/me', auth, getMe);
```

---

## 🎯 Control a Nivel de Controlador

### Ejemplo: Factura Controller

```javascript
facturaCtrl.getFacturas = async (req, res) => {
  let query = {};
  
  // Si NO es admin, solo ver sus propias facturas
  if (!req.user.roles.includes('admin')) {
    query.usuario = req.user.id;
  }
  
  // El resto del código...
};

facturaCtrl.updateFactura = async (req, res) => {
  const factura = await Factura.findById(req.params.id);
  
  // Verificar permisos
  const isAdmin = req.user.roles.includes('admin');
  const isOwner = factura.usuario.toString() === req.user.id;
  
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ 
      error: 'No tienes permiso' 
    });
  }
  
  // Actualizar...
};
```

---

## 🎨 Control en Frontend

### App.tsx - Renderizado Condicional

```typescript
// Solo admins ven panel
{section === 'panel' && role !== 'user' && <Home />}

// Solo admins ven usuarios
{section === 'usuarios' && role !== 'user' && <Usuarios />}

// Solo admins y aprobadores ven aprobaciones
{section === 'aprobaciones' && role !== 'user' && <Aprobaciones />}

// Usuarios y admins ven facturación
{section === 'facturacion' && <Facturas />}
```

### Sidebar - Menú Dinámico

```typescript
// Sección Administración: solo si no es user
{role !== 'user' && (
  <>
    <button>Panel</button>
    <button>Usuarios</button>
    <button>Reportes</button>
    <button>Aprobaciones</button>
  </>
)}
```

---

## 🚀 Crear Nuevos Roles

### Paso 1: Crear el Rol en BD

```javascript
// En database.js o vía API
const Role = require('./models/role');
await Role.create({ name: 'nomina' });
```

### Paso 2: Registrar Permisos

En `middleware/role.js` y controladores:

```javascript
// En rutas
router.use(role('admin', 'nomina'));

// En controladores
if (!req.user.roles.includes('nomina')) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

### Paso 3: Actualizar UI

En `frontend/src/App.tsx`:

```typescript
{role === 'nomina' && <NominaSection />}
```

---

## 📊 Asignación de Roles a Usuarios

### Admin Management

**Crear usuario con rol específico:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "role": "user"  # o "admin" o "approver"
  }'
```

**Cambiar rol de usuario:**
```bash
curl -X PUT http://localhost:3000/api/users/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Frontend - User Management

En `Usuarios.tsx`:
```typescript
// Cambiar rol de usuario
await apiFetch(`/users/${userId}`, {
  method: 'PUT',
  body: JSON.stringify({ role: 'approver' })
});
```

---

## 🔍 Verificar Roles de Usuario Actual

### Backend

```javascript
// En cualquier endpoint protegido
console.log(req.user.roles); // ['admin'] o ['user'] o ['approver']
```

### Frontend

```javascript
// En localStorage
const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
console.log(userRoles); // ['admin']

// En estado React
console.log(role); // 'admin' | 'user' | 'approver'
```

---

## 🎖️ Estado Actual

### Roles Implementados ✅
- ✅ **admin** - Control total
- ✅ **user** - Facturación básica
- ✅ **approver** - Aprobación de usuarios

### Protecciones Aplicadas ✅
- ✅ JWT en todas las rutas protegidas
- ✅ Role checking en rutas críticas
- ✅ Filtrado de datos en controladores
- ✅ Control en frontend (UI)
- ✅ Control en backend (API)

### Pendiente de Implementar ⏳
- ⏳ Nuevos roles (ej: contador, gerente)
- ⏳ Permisos granulares (ej: solo lectura)
- ⏳ Auditoría de cambios por rol

---

## 📝 Notas de Seguridad

1. **Nunca confiar en el frontend:** El role en localStorage es solo para UI. El backend SIEMPRE verifica.

2. **Principio de Menor Privilegio:** Asignar el rol mínimo necesario.

3. **Auditoría:** Registrar quién hace qué cambios.

4. **Rotar Credenciales:** Cambiar JWT_SECRET en producción.

---

*Documento generado: 2026-08-25*  
*Última actualización: Fase de mejoras completada*
