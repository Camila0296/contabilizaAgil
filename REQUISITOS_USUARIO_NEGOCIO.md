# 🎯 REQUISITOS DEL PROGRAMA - Perspectiva de Usuario y Negocio

## 📌 OBJETIVO PRINCIPAL

**Desarrollar un sistema integral de facturación y gestión contable que automatice el proceso contable de una empresa colombiana, calculando automáticamente los impuestos según la normativa DIAN 2026.**

---

## 👥 USUARIOS DEL SISTEMA

### **1. Administrador del Sistema**
- Gestiona todo el sistema
- Crea y autoriza usuarios
- Define roles y permisos
- Revisa reportes y auditorías
- Resuelve problemas

### **2. Contador/Jefe Contable**
- Registra facturas de compra
- Genera reportes financieros
- Gestiona terceros (proveedores/clientes)
- Supervisa pagos
- Analiza cartera

### **3. Analista Financiero**
- Revisa facturas y reportes
- Analiza tendencias
- Genera informes ejecutivos
- Monitorea cartera

### **4. Auxiliar Contable/Facturador**
- Registra facturas
- Crea terceros
- Registra pagos
- Entrada de datos

---

## 🎯 REQUISITOS FUNCIONALES POR USUARIO

### **ADMINISTRADOR - 8 Funcionalidades**

#### 1. **Gestión de Usuarios**
```
Necesita:
✅ Crear nuevos usuarios
✅ Asignar roles (administrador, contador, analista, auxiliar)
✅ Aprobar/Desaprobar usuarios
✅ Activar/Desactivar usuarios
✅ Ver historial de acceso
✅ Resetear contraseñas
✅ Cambiar permisos

Beneficio: Control total de quién accede al sistema
```

#### 2. **Gestión de Roles y Permisos**
```
Necesita:
✅ Crear nuevos roles (4 predefinidos)
✅ Asignar permisos a roles
✅ Definir niveles jerárquicos
✅ Ver qué puede hacer cada rol

Beneficio: Seguridad y control de acceso granular
```

#### 3. **Reportes y Auditoría**
```
Necesita:
✅ Ver todas las transacciones del sistema
✅ Historial de cambios por usuario
✅ Reporte de accesos
✅ Auditoría de eliminaciones/modificaciones
✅ Exportar reportes

Beneficio: Cumplimiento normativo y seguridad
```

#### 4. **Configuración del Sistema**
```
Necesita:
✅ Configurar parámetros de facturación
✅ Definir consecutivos
✅ Establecer tasas de impuestos
✅ Configurar políticas de contraseña

Beneficio: Personalizar el sistema según la empresa
```

#### 5. **Gestión de Terceros (Administración)**
```
Necesita:
✅ Validar terceros creados
✅ Bloquear terceros problemáticos
✅ Ver historial de terceros

Beneficio: Control sobre datos maestros
```

#### 6. **Panel de Control (Dashboard Admin)**
```
Necesita:
✅ Ver estadísticas generales
✅ Usuarios activos/inactivos
✅ Facturas procesadas
✅ Alertas del sistema
✅ Performance del sistema

Beneficio: Monitoreo rápido de la salud del sistema
```

#### 7. **Respaldo y Recuperación**
```
Necesita:
✅ Generar respaldos
✅ Restaurar datos
✅ Ver historial de respaldos

Beneficio: Protección contra pérdida de datos
```

#### 8. **Aprobaciones y Autorizaciones**
```
Necesita:
✅ Aprobar facturas de alto monto
✅ Autorizar cambios de política
✅ Validar ingresos de terceros

Beneficio: Doble verificación de transacciones críticas
```

---

### **CONTADOR - 9 Funcionalidades**

#### 1. **Registro de Facturas de Compra**
```
Necesita:
✅ Crear nueva factura
✅ Ingresar número de factura
✅ Fecha de emisión
✅ Proveedor (tercero)
✅ Monto de la factura
✅ Concepto/Detalle
✅ Naturaleza (débito/crédito)
✅ Seleccionar cuenta PUC
✅ Definir retención fuente (%)
✅ Definir ICA (%)

Cálculos automáticos:
✓ IVA 19%
✓ ReteFuente (según %)
✓ ICA (según %)
✓ TOTAL A PAGAR

Beneficio: Registro automático y preciso de impuestos
```

#### 2. **Gestión de Cartera**
```
Necesita:
✅ Ver facturas pendientes de pago
✅ Ver fechas de vencimiento
✅ Identificar facturas vencidas
✅ Ver días de mora
✅ Filtrar por proveedor
✅ Filtrar por estado de pago

Cálculos automáticos:
✓ Fecha de vencimiento (según plazo)
✓ Saldo pendiente
✓ Días de mora
✓ Porcentaje pagado

Beneficio: Control total de lo que se debe pagar
```

#### 3. **Registro de Pagos**
```
Necesita:
✅ Registrar pago parcial
✅ Registrar pago total
✅ Ingresar fecha de pago
✅ Referencia bancaria
✅ Medio de pago (transferencia, cheque, efectivo)
✅ Cuenta bancaria usado
✅ Ver historial de pagos

Actualizaciones automáticas:
✓ Estado de pago
✓ Saldo pendiente
✓ Fecha de pago

Beneficio: Transparencia en pagos realizados
```

#### 4. **Gestión de Terceros (Proveedores)**
```
Necesita:
✅ Crear nuevo tercero
✅ Ingresar tipo de documento (NIT, CC)
✅ Número de documento
✅ Razón social
✅ Email
✅ Teléfono
✅ Dirección
✅ Ciudad
✅ Activo/Inactivo
✅ Ver historial de tercero

Beneficio: Tener centralizados todos los proveedores
```

#### 5. **Plan de Cuentas (Consulta)**
```
Necesita:
✅ Ver todas las cuentas
✅ Búsqueda por código
✅ Búsqueda por nombre
✅ Ver naturaleza (débito/crédito)
✅ Ver descripción

Beneficio: Seleccionar cuenta correcta en facturas
```

#### 6. **Reportes Financieros**
```
Necesita:
✅ Reporte de facturas por período
✅ Reporte de cartera
✅ Reporte de pagos efectuados
✅ Reporte de impuestos pagados
✅ Reporte por tercero
✅ Exportar a Excel
✅ Exportar a PDF

Beneficio: Información contable clara para análisis
```

#### 7. **Consultas y Búsquedas**
```
Necesita:
✅ Buscar factura por número
✅ Buscar por proveedor
✅ Filtrar por período
✅ Filtrar por monto
✅ Filtrar por estado

Beneficio: Acceso rápido a información
```

#### 8. **Perfil de Usuario**
```
Necesita:
✅ Ver información personal
✅ Cambiar contraseña
✅ Ver permisos asignados
✅ Cambiar datos de contacto

Beneficio: Seguridad y privacidad personal
```

#### 9. **Dashboard Contador**
```
Necesita:
✅ Total facturas ingresadas
✅ Total a pagar
✅ Facturas vencidas
✅ Pagos realizados
✅ Impuestos totales

Beneficio: Resumen ejecutivo al abrir la aplicación
```

---

### **ANALISTA - 5 Funcionalidades**

#### 1. **Consulta de Facturas**
```
Puede:
✅ Ver todas las facturas (solo lectura)
✅ Buscar por número
✅ Filtrar por período
✅ Ver detalles de factura

No puede: Crear, editar, eliminar

Beneficio: Acceso a información sin poder modificar
```

#### 2. **Análisis de Cartera**
```
Puede:
✅ Ver estado de cartera
✅ Ver facturas vencidas
✅ Analizar tendencias de pago
✅ Generar alertas

Beneficio: Análisis de riesgos crediticios
```

#### 3. **Reportes de Lectura**
```
Puede:
✅ Ver reportes financieros
✅ Generar análisis por período
✅ Comparar períodos
✅ Exportar reportes

Beneficio: Reportería para presentaciones
```

#### 4. **Consulta de Terceros**
```
Puede:
✅ Ver datos de proveedores/clientes
✅ Ver historial de transacciones
✅ Análisis de tercero

Beneficio: Información de contrapartes
```

#### 5. **Dashboard Analista**
```
Puede:
✅ Ver KPIs principales
✅ Análisis de tendencias
✅ Comparativas

Beneficio: Información ejecutiva para decisiones
```

---

### **AUXILIAR - 4 Funcionalidades**

#### 1. **Crear Facturas de Compra**
```
Puede:
✅ Crear nueva factura
✅ Ingresar datos básicos
✅ Seleccionar proveedor

No puede: Editar, eliminar, aprobar

Beneficio: Entrada de datos sin modificar datos existentes
```

#### 2. **Crear Terceros**
```
Puede:
✅ Crear nuevo proveedor/cliente
✅ Ingresar datos básicos

No puede: Editar, eliminar, desactivar

Beneficio: Agregar nuevos terceros
```

#### 3. **Registrar Pagos**
```
Puede:
✅ Registrar pago en factura
✅ Ingresar referencia
✅ Ingresar monto

No puede: Modificar, eliminar

Beneficio: Registro de pagos realizados
```

#### 4. **Ver Reportes Básicos**
```
Puede:
✅ Ver reportes (solo lectura)
✅ Exportar

No puede: Crear reportes complejos

Beneficio: Información para consultas
```

---

## 📊 REQUISITOS DE DATOS

### **Datos que Debe Registrar el Sistema**

#### **Facturas de Compra**
```
Campos obligatorios:
✅ Número de factura (FAC-YYYY-NNN) - Autogenerado
✅ Fecha de factura
✅ Proveedor (tercero)
✅ Monto bruto
✅ Cuenta PUC
✅ Detalle del concepto

Campos opcionales:
✅ Retención fuente (%)
✅ ICA (%)
✅ Observaciones

Campos calculados:
✅ IVA (19%)
✅ Retención fuente (monto)
✅ ICA (monto)
✅ Total a pagar
```

#### **Terceros (Proveedores/Clientes)**
```
Campos obligatorios:
✅ Tipo (Proveedor/Cliente)
✅ Razón social
✅ Tipo de documento (NIT, CC, etc)
✅ Número de documento

Campos opcionales:
✅ Email
✅ Teléfono
✅ Dirección
✅ Ciudad
✅ Notas

Campos de sistema:
✅ Estado (Activo/Inactivo)
✅ Fecha de creación
```

#### **Cartera de Facturas**
```
Campos generados automáticamente:
✅ Fecha de vencimiento
✅ Plazo (días)
✅ Estado de pago (Pendiente/Pagada/Parcial)
✅ Saldo pendiente
✅ Total pagado
✅ Historial de pagos
✅ Días de mora
```

#### **Plan de Cuentas**
```
Campos:
✅ Código de cuenta (único)
✅ Nombre de cuenta
✅ Naturaleza (Débito/Crédito)
✅ Descripción
✅ Estado (Activo/Inactivo)
```

---

## 🔐 REQUISITOS DE SEGURIDAD

### **Autenticación**
```
✅ Login con usuario y contraseña
✅ Token JWT (8 horas de sesión)
✅ Recuperación de contraseña
✅ Cambio de contraseña obligatorio en primer acceso
```

### **Autorización**
```
✅ Control de acceso por roles
✅ Cada rol tiene permisos específicos
✅ No puede ver datos de otros usuarios
✅ Admin puede ver todo
```

### **Encriptación**
```
✅ Contraseñas encriptadas (bcrypt)
✅ Comunicación HTTPS (en producción)
✅ Validación en backend
```

### **Auditoría**
```
✅ Registro de quién hizo qué y cuándo
✅ Historial de cambios
✅ Logs de acceso
✅ Trazabilidad completa
```

---

## 📱 REQUISITOS DE INTERFAZ

### **Usabilidad**
```
✅ Interfaz intuitiva y fácil de usar
✅ Menús claros y organizados
✅ Búsquedas rápidas
✅ Filtros disponibles
✅ Paginación en listas largas
```

### **Respuesta**
```
✅ Interfaz responsiva (móvil, tablet, desktop)
✅ Carga rápida de datos
✅ Tiempos de respuesta < 3 segundos
```

### **Notificaciones**
```
✅ Alertas de validación clara
✅ Mensajes de éxito/error
✅ Confirmaciones antes de acciones críticas
✅ Advertencias de campos obligatorios
```

### **Exportación**
```
✅ Exportar facturas a PDF
✅ Exportar reportes a Excel
✅ Exportar cartera a Excel
✅ Exportar facturas a CSV
```

---

## 📈 REQUISITOS DE REPORTES

### **Reportes Obligatorios**

#### **1. Reporte de Facturas**
```
Debe mostrar:
✅ Número de factura
✅ Fecha
✅ Proveedor
✅ Monto bruto
✅ IVA
✅ ReteFuente
✅ ICA
✅ Total a pagar
✅ Estado

Filtros:
✅ Por período
✅ Por proveedor
✅ Por monto
✅ Por estado
```

#### **2. Reporte de Cartera**
```
Debe mostrar:
✅ Factura
✅ Proveedor
✅ Monto original
✅ Fecha de vencimiento
✅ Estado de pago
✅ Saldo pendiente
✅ Días de mora

Resumen:
✅ Total por cobrar/pagar
✅ Total vencido
✅ Total pagado
```

#### **3. Reporte de Impuestos**
```
Debe mostrar:
✅ Total IVA recolectado
✅ Total ReteFuente
✅ Total ICA
✅ Por período
✅ Por tercero

Beneficio: Preparar declaraciones
```

#### **4. Reporte de Pagos**
```
Debe mostrar:
✅ Factura pagada
✅ Fecha de pago
✅ Monto pagado
✅ Referencia
✅ Medio de pago

Beneficio: Conciliación bancaria
```

#### **5. Dashboard Ejecutivo**
```
Debe mostrar:
✅ Total facturas del período
✅ Total monto facturado
✅ Total impuestos
✅ Cartera pendiente
✅ Facturas vencidas
✅ Gráficos de tendencias
```

---

## ⚡ REQUISITOS DE PERFORMANCE

```
✅ Tiempo de carga inicial: < 3 segundos
✅ Búsqueda de facturas: < 1 segundo
✅ Generación de reportes: < 5 segundos
✅ Soportar 1000+ facturas sin lag
✅ Paginación automática
✅ Caché de datos locales
```

---

## 🌐 REQUISITOS DE INTEGRACIÓN

### **Integraciones Futuras (Roadmap)**
```
✅ Integración bancaria (conciliación automática)
✅ ERP (sincronización de datos)
✅ Email (envío automático de recordatorios)
✅ SMS (notificaciones de vencimiento)
✅ API REST (para terceros)
```

---

## 📋 REQUISITOS DE CUMPLIMIENTO NORMATIVO

### **Colombia - DIAN 2026**
```
✅ Cálculo correcto de IVA (19%)
✅ Cálculo de ReteFuente según tabla DIAN
✅ Cálculo de ICA según municipio
✅ Consecutivo único y progresivo (FAC-YYYY-NNN)
✅ Retención en la fuente documentada
✅ Total a pagar después de retenciones
```

### **Auditoría**
```
✅ Trazabilidad completa de transacciones
✅ Historial de cambios
✅ Registro de accesos
✅ Validación de datos
```

---

## 🎯 REQUISITOS DE NEGOCIO

### **Beneficios Esperados**
```
✅ Reducir tiempo de facturación en 80%
✅ Eliminar errores de cálculo de impuestos
✅ Automatizar seguimiento de cartera
✅ Mejorar visibilidad de flujo de caja
✅ Cumplir normativa DIAN
✅ Generar reportes en minutos (vs. horas)
✅ Reducir costos de gestión contable
```

### **Métricas de Éxito**
```
✅ 0 errores en cálculo de impuestos
✅ 100% de facturas procesadas
✅ Tiempo promedio de pago mejorado
✅ 100% compliance normativo
✅ Satisfacción de usuarios > 4.5/5
✅ Disponibilidad > 99%
```

---

## 📝 RESUMEN EJECUTIVO

### **¿QUÉ ES LO QUE HACE EL PROGRAMA?**

**Contabiliza Ágil** es un sistema que:

1. **Registra facturas de compra** con automatización completa de impuestos
2. **Calcula impuestos** según normativa DIAN 2026
3. **Gestiona cartera** de facturas pendientes de pago
4. **Registra pagos** y mantiene historial
5. **Genera reportes** para análisis financiero
6. **Controla acceso** con roles y permisos
7. **Mantiene auditoría** de todas las transacciones
8. **Exporta datos** en PDF y Excel

### **¿PARA QUÉ LO NECESITA LA EMPRESA?**

✅ **Automatizar** la gestión contable
✅ **Reducir errores** en cálculo de impuestos
✅ **Ahorrar tiempo** en facturación
✅ **Cumplir** normativa DIAN
✅ **Mejorar** visibilidad financiera
✅ **Controlar** la cartera de pagos
✅ **Generar** reportes automáticos

---

## ✅ ESTADO: TODOS LOS REQUISITOS IMPLEMENTADOS

**El programa cumple con el 100% de los requisitos de negocio y usuario especificados.**

---

*Documento de requisitos de usuario y negocio*
*Última actualización: 2026-08-26*
