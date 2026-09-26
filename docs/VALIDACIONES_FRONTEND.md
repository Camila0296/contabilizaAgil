# Validaciones de Campos Frontend - Contabiliza Ágil

## Descripción General

Se han agregado validaciones exhaustivas para todos los campos de formularios en el frontend de la aplicación. Las validaciones se aplican en dos niveles:

1. **Validaciones en tiempo real** (onChange y onBlur)
2. **Validaciones al enviar el formulario** (handleSubmit)

## Archivo de Validaciones Centralizadas

`frontend/src/utils/validation.ts` contiene todas las funciones de validación reutilizables:

### Funciones de Validación Disponibles

#### Email
- `validateEmail(email: string)` - Valida formato de email
- `isValidEmail(email: string)` - Verifica si el formato es válido

#### Nombres y Apellidos
- `validateNombres(nombres: string)` - Validaciones para nombres
- `validateApellidos(apellidos: string)` - Validaciones para apellidos
- `validateName(value, fieldName)` - Validación genérica de nombres

**Reglas:**
- Mínimo 2 caracteres
- Máximo 50 caracteres
- Solo permite letras, espacios y algunos caracteres especiales (á, é, í, ó, ú, ñ, ', -)

#### Contraseña
- `validatePassword(password: string)` - Valida contraseña fuerte
- `isStrongPassword(password: string)` - Verifica si es fuerte
- `validatePasswordMatch(password, confirmPassword)` - Valida coincidencia

**Reglas:**
- Mínimo 8 caracteres
- Debe incluir: mayúscula, minúscula, número y carácter especial

#### Montos/Números
- `validateAmount(amount: number | string)` - Valida montos
- `validatePercentage(percentage: number | string)` - Valida porcentajes

**Reglas de Monto:**
- Debe ser positivo
- Mayor a 0
- Máximo 999,999,999,999.99

**Reglas de Porcentaje:**
- Entre 0 y 100

#### Documentos
- `validateNumeroFactura(numero: string)` - Número de factura
- `validateProveedor(proveedor: string)` - Nombre del proveedor
- `validateDetalle(detalle: string)` - Descripción/detalle
- `validatePuc(puc: string)` - Código PUC
- `validateFecha(fecha: string)` - Fecha válida
- `validateRole(role: string)` - Rol seleccionado

### Funciones de Validación Complejas

- `validateFactura(factura)` - Valida todos los campos de una factura
- `validateRegisterForm(form)` - Valida formulario de registro
- `validateUsuario(usuario)` - Valida datos de usuario
- `validateFieldError(errors, fieldName)` - Obtiene error de un campo
- `hasFieldError(errors, fieldName)` - Verifica si hay error en campo
- `getFieldError(errors, fieldName)` - Obtiene mensaje de error

## Componentes Actualizados

### 1. Login.tsx
- Validación de email en tiempo real
- Validación de contraseña requerida
- Mensajes de error mostrados debajo de cada campo
- Campos marcan con borde rojo cuando hay error

### 2. Register.tsx
- Validación de nombres y apellidos
- Validación de email único
- Validación de contraseña fuerte
- Confirmación de contraseña debe coincidir
- Mensajes de ayuda y errores

### 3. Usuarios.tsx (Crear/Editar Usuario)
- Validación de nombres y apellidos
- Validación de email
- Rol debe estar seleccionado
- Errores se muestran en modal

### 4. Facturas.tsx (Crear/Editar Factura)
- Número de factura requerido y único
- Fecha no puede ser mayor a hoy
- Proveedor: mín 3 caracteres, máx 100
- Monto: debe ser positivo y mayor a 0
- PUC debe estar seleccionado
- Detalle: mín 5 caracteres, máx 500
- ReteFuente: 0-100%
- ICA: 0-100%

### 5. Perfil.tsx (Editar Perfil)
- Validación de nombres y apellidos
- Validación de email
- Si cambia contraseña:
  - Nueva contraseña debe ser fuerte
  - Debe coincidir con confirmación
  - Requiere contraseña actual

## Características de las Validaciones

### Validación en Tiempo Real
- Se activa al perder el foco (onBlur)
- Se activa al cambiar (onChange) después de que el campo fue tocado
- Permite al usuario ver errores mientras escribe sin presionar envío
- Los campos con error se resaltan con borde rojo

### Validación al Enviar
- Se ejecuta completa validación de todos los campos
- Previene el envío si hay errores
- Muestra todos los errores encontrados
- El usuario puede corregir antes de reintentar

### Indicadores Visuales
- **Borde rojo**: Campo con error de validación
- **Fondo rojo tenue**: Indica el área del error
- **Mensaje en rojo**: Explicación específica del error
- **aria-invalid**: Atributo de accesibilidad para lectores de pantalla

## Estándares de Validación por Campo

| Campo | Tipo | Validaciones |
|-------|------|-------------|
| Email | Texto | Formato válido, no vacío |
| Nombres/Apellidos | Texto | 2-50 caracteres, solo letras y espacios |
| Contraseña | Texto | 8+ caracteres, mayús + minús + dígito + especial |
| Monto | Número | Positivo, >0, máx 999,999,999,999.99 |
| Porcentaje | Número | 0-100 |
| Proveedor | Texto | 3-100 caracteres |
| Detalle | Texto | 5-500 caracteres |
| Fecha | Fecha | Formato válido, no futura |
| PUC | Selección | Requerido |
| Rol | Selección | Requerido |

## Manejo de Errores

### Estructura del Objeto Error
```typescript
interface ValidationError {
  field: string;      // Nombre del campo
  message: string;    // Mensaje de error en español
}
```

### Flujo de Validación

1. Usuario toca el campo (onBlur)
2. Campo se marca como "touched"
3. Validación se ejecuta en cambios posteriores
4. Errores se muestran en tiempo real
5. Al enviar, se valida TODO el formulario
6. Si hay errores, se previene el envío

## Testing

Los tests han sido ajustados para considerar:
- Validaciones en tiempo real
- Errores mostrados en la UI
- Campos marcados con atributo aria-invalid

Para ejecutar tests:
```bash
npm run test:unit          # Tests unitarios
cd frontend && npm test    # Tests del frontend específicamente
```

## Accesibilidad

Todas las validaciones incluyen:
- Atributos `aria-invalid` para indicadores de accesibilidad
- Mensajes de error en español claro y conciso
- Colores de error accesibles (no solo color, también texto)
- Labels asociados correctamente a inputs

## Notas Importantes

1. **PASSWORD_HINT** se importa de validation.ts, no de password.ts
2. Las validaciones son consistentes entre frontend y backend
3. El archivo validation.ts es reutilizable en otros proyectos
4. Todos los mensajes están en español
5. Las reglas de validación siguen estándares internacionales

## Próximas Mejoras

- [ ] Agregar validaciones a componentes Terceros, PUC
- [ ] Internacionalizar mensajes de validación
- [ ] Agregar validaciones asincrónicas (verificar email único)
- [ ] Mejorar mensajes de error para usuarios
- [ ] Agregar tooltips con información de formato esperado
