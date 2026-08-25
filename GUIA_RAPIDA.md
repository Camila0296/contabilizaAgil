# 🚀 GUÍA RÁPIDA - Cómo Usar Contabiliza Ágil

## 📦 Instalación

```bash
# Instalar todas las dependencias
npm run install:all

# O manualmente
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## ▶️ Ejecución

### Modo Desarrollo (Recomendado)
```bash
# Inicia backend + frontend concurrentemente
npm start

# Abre en navegador:
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### Solo Backend
```bash
cd backend && npm run dev
# o
npm run start:backend
```

### Solo Frontend
```bash
cd frontend && npm start
# o
npm run start:frontend
```

---

## 🧪 Tests

### Ejecutar Todos los Tests
```bash
# Ejecuta unit tests + e2e (requiere app corriendo)
npm run test:all
```

### Tests Unitarios
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# O ambos
npm run test:unit
```

### E2E Tests (Selenium)
```bash
# Requiere que la app esté corriendo (npm start)
# En otra terminal:
npm run test:e2e

# O manualmente
cd tests && npm run test:login    # Prueba login
cd tests && npm run test:register # Prueba registro
cd tests && npm run test:headless # Ambos en headless
```

### Cobertura de Tests
```bash
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

---

## 🔐 Credenciales por Defecto

### Admin
```
Email: admin@admin.com
Password: admin123
```

**⚠️ Cambiar en Producción**

---

## 🗂️ Estructura del Proyecto

```
ProyectoFinal/
├── backend/
│   ├── controllers/        ← Lógica de negocio (MEJORADO ✅)
│   ├── models/            ← Esquemas Mongoose
│   ├── routes/            ← Rutas API (NUEVO: aprobaciones ✅)
│   ├── middleware/        ← Auth, RBAC
│   ├── services/          ← Groq AI (MEJORADO ✅)
│   ├── tests/             ← Tests (104+ tests ✅)
│   ├── utils/             ← Password policy, validaciones
│   └── index.js           ← Punto de entrada
│
├── frontend/
│   ├── src/
│   │   ├── components/    ← React components
│   │   ├── pages/        ← Páginas
│   │   ├── api.ts        ← Cliente HTTP
│   │   └── App.tsx       ← Componente raíz
│   └── public/
│
├── tests/
│   └── e2e/              ← Tests Selenium
│
├── RESUMEN_EJECUTIVO.md  ← Este archivo 📄
├── MEJORAS_IMPLEMENTADAS.md
└── GUIA_RAPIDA.md        ← Tú estás aquí 👈
```

---

## 📚 APIs Principales

### Autenticación
```
POST   /api/auth/register      Registrar usuario
POST   /api/auth/login         Iniciar sesión
GET    /api/auth/verify        Verificar token
```

### Facturas (MEJORADO ✅)
```
GET    /api/facturas?page=1&limit=10         Lista con paginación
GET    /api/facturas/:id                     Detalles
POST   /api/facturas                         Crear (con validación ✅)
PUT    /api/facturas/:id                     Actualizar (con validación ✅)
DELETE /api/facturas/:id                     Eliminar
GET    /api/facturas/dashboard/stats         Estadísticas
```

### Usuarios (MEJORADO ✅)
```
GET    /api/users?page=1                     Lista con paginación ✅
GET    /api/users/:id                        Detalles
POST   /api/users                            Crear (validación email ✅)
PUT    /api/users/:id                        Actualizar (validación ✅)
PUT    /api/users/me                         Perfil personal (cambio contraseña ✅)
GET    /api/users/me                         Mi perfil
```

### Aprobaciones (NUEVO ✅)
```
GET    /api/aprobaciones/pendientes          Usuarios pendientes (paginado ✅)
GET    /api/aprobaciones/historial           Usuarios aprobados
GET    /api/aprobaciones/estadisticas        Conteos
PUT    /api/aprobaciones/:id/aprobar         Aprobar usuario
PUT    /api/aprobaciones/:id/rechazar        Rechazar usuario
POST   /api/aprobaciones/batch/aprobar       Aprobar batch (máx 100 ✅)
```

### Terceros (MEJORADO ✅)
```
GET    /api/terceros?page=1                  Lista con paginación ✅
POST   /api/terceros                         Crear (validación ✅)
PUT    /api/terceros/:id                     Actualizar
DELETE /api/terceros/:id                     Soft delete
```

### PUC (MEJORADO ✅)
```
GET    /api/puc?page=1                       Lista con paginación ✅
POST   /api/puc                              Crear (normalización ✅)
PUT    /api/puc/:id                          Actualizar
DELETE /api/puc/:id                          Soft delete
```

### Chat IA (Groq)
```
POST   /api/chat/message                     Enviar mensaje
GET    /api/chat/health                      Verificar estado
```

---

## ⚙️ Variables de Entorno

### Backend (.env)
```
# Base de Datos
MONGODB_URI=mongodb://localhost:27017/CABD
USE_MEM_MONGO=true          # En desarrollo: MongoDB en memoria

# JWT
JWT_SECRET=your_secret_key

# Puerto
PORT=3000

# SMTP (Credenciales extraídas ✅)
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=smtp@mailtrap.io
SMTP_PASS=ce7ada92e7135689be99c40614424e71
SMTP_FROM="Contabiliza Ágil" <hello@demomailtrap.co>

# IA
AI_PROVIDER=groq              # mock | groq | claude | openai
GROQ_API_KEY=gsk_...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
```

### Frontend
```
# Hardcoded: http://localhost:3000/api
# Sin .env needed para desarrollo
```

---

## 🔍 Validaciones Implementadas ✅

### Facturas
- ✅ Monto: número positivo
- ✅ Naturaleza: "credito" o "debito"
- ✅ Porcentajes: 0-100
- ✅ Fecha: ISO 8601
- ✅ Número: único

### Usuarios
- ✅ Email: formato válido, único
- ✅ Contraseña: 8+ chars, mayús, minús, número, especial
- ✅ Nombres: no vacío

### Terceros
- ✅ Número de documento: único
- ✅ Email: formato válido (opcional)
- ✅ Tipo: requerido

### PUC
- ✅ Código: único, UPPERCASE
- ✅ Naturaleza: "credito" o "debito"

---

## 🐛 Debugging

### Ver Logs del Backend
```bash
npm run start:backend
# Verás: [AI] Usando provider Groq
#        server activo en el puerto 3000
#        DB is connected
```

### Ver Swagger
```
http://localhost:3000/api-docs
```

### Verificar Groq
```bash
curl http://localhost:3000/api/chat/health
# Respuesta: {"provider":"groq","status":"ok"}
```

---

## 🚨 Troubleshooting

### "Chrome tab crashed" en E2E tests
```bash
# Problema: Versión de ChromeDriver no coincide
cd tests
npm install chromedriver@X   # X = tu versión Chrome
npm run test:e2e
```

### "EADDRINUSE: address already in use :::3000"
```bash
# Puerto ocupado
# Solución 1: Cambiar puerto en backend/index.js
# Solución 2: Matar proceso
# Windows: taskkill /PID <pid> /F
# Mac/Linux: kill -9 <pid>
```

### "MongoDB connection refused"
```bash
# Usar MongoDB en memoria (desarrollo)
# backend/.env: USE_MEM_MONGO=true

# O instalar MongoDB local
# https://www.mongodb.com/try/download/community
```

---

## 📊 Performance

### Paginación Aplicada ✅
- Todas las listas: 10 registros por defecto
- Máximo: 100 registros por página
- Total registros: incluido en respuesta

### Ejemplo: Traer página 2
```bash
GET /api/facturas?page=2&limit=10&proveedor=acme

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 50,      ← Total registros
    "pages": 5        ← Total páginas
  }
}
```

---

## 🔒 Seguridad

✅ **Implementado:**
- JWT autenticación (8 horas)
- Bcrypt contraseñas (12 rounds)
- RBAC (admin, user, approver)
- Validación server-side
- No hay credenciales en código
- Soft delete (datos nunca se pierden)

**⚠️ Cambiar antes de producción:**
- JWT_SECRET
- Admin password
- SMTP credentials
- API keys (Groq, Claude, OpenAI)

---

## 📞 Soporte

### Documentación
- Resumen Ejecutivo: `RESUMEN_EJECUTIVO.md`
- Mejoras Detalladas: `MEJORAS_IMPLEMENTADAS.md`
- Swagger API: `http://localhost:3000/api-docs`

### Commit Messages
```
git log --oneline
```

---

## ✅ Checklist de Primer Uso

- [ ] `npm run install:all`
- [ ] Verificar `.env` (SMTP, JWT_SECRET, etc)
- [ ] `npm start`
- [ ] Acceder a `http://localhost:4200`
- [ ] Login con admin@admin.com / admin123
- [ ] Probar crear factura
- [ ] Ver logs de Groq en terminal
- [ ] Visitar `http://localhost:3000/api-docs`

**¡Listo para usar!** 🚀

---

*Última actualización: 2026-08-25*
