# Proyecto Final - Sistema de Gestión

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/tu-usuario/proyecto-final/actions/workflows/node.js.yml/badge.svg)](https://github.com/tu-usuario/proyecto-final/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/tu-usuario/proyecto-final/graph/badge.svg?token=YOUR-TOKEN)](https://codecov.io/gh/tu-usuario/proyecto-final)

## 📋 Descripción

Sistema de gestión integral desarrollado con una arquitectura moderna que incluye frontend, backend y pruebas automatizadas.

## 🚀 Características Principales

- **Autenticación de Usuarios**
  - Inicio de sesión seguro
  - Control de acceso basado en roles
  - Gestión de sesiones

- **Dashboard Interactivo**
  - Visualización de métricas clave
  - Gráficos y reportes
  - Interfaz responsiva

- **Gestión de Datos**
  - CRUD de entidades principales
  - Búsqueda y filtrado avanzado
  - Exportación de datos

- **Pruebas Automatizadas**
  - Pruebas unitarias
  - Pruebas de integración
  - Pruebas E2E con Cucumber

## 🛠️ Tecnologías Utilizadas

### Frontend
- React.js
- Redux para gestión de estado
- Material-UI para componentes de interfaz
- Axios para peticiones HTTP

### Backend
- Node.js con Express
- MongoDB como base de datos
- JWT para autenticación
- Mongoose para ODM

### Testing
- Jest para pruebas unitarias
- Supertest para pruebas de API
- Cucumber para pruebas E2E
- Selenium WebDriver para automatización

## 🚀 Instalación

### Requisitos Previos

- Node.js 16.x o superior
- MongoDB 5.0 o superior
- npm 8.x o superior

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/proyecto-final.git
   cd proyecto-final
   ```

2. **Instalar dependencias**
   ```bash
   # Instalar dependencias del backend
   cd backend
   npm install
   
   # Instalar dependencias del frontend
   cd ../frontend
   npm install
   
   # Instalar dependencias de pruebas
   cd ../tests
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   # Backend
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/proyecto-final
   JWT_SECRET=tu_clave_secreta_jwt
   
   # Frontend
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Iniciar la aplicación**
   ```bash
   # En la raíz del proyecto
   npm start
   ```
   Esto iniciará tanto el backend como el frontend en modo desarrollo.

## 🧪 Ejecución de Pruebas

### Pruebas Unitarias
```bash
# En la raíz del proyecto
npm test
```

### Pruebas E2E
```bash
# Asegurarse de que la aplicación esté en ejecución
cd tests
npm run test:e2e
```

## 📂 Estructura del Proyecto

```
proyecto-final/
├── backend/               # Código del servidor
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas de la API
│   └── index.js          # Punto de entrada
├── frontend/             # Aplicación React
│   ├── public/          # Archivos estáticos
│   └── src/             # Código fuente
├── tests/               # Pruebas automatizadas
│   ├── e2e/            # Pruebas de extremo a extremo
│   ├── unit/           # Pruebas unitarias
│   └── integration/    # Pruebas de integración
├── .gitignore
├── package.json
└── README.md
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Tu Nombre - [@tu_usuario](https://twitter.com/tu_usuario) - email@ejemplo.com

Enlace del Proyecto: [https://github.com/tu-usuario/proyecto-final](https://github.com/tu-usuario/proyecto-final)
