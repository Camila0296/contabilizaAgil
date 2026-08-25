/**
 * Script para crear los roles del sistema
 * Ejecutar: node backend/scripts/seed-roles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function seedRoles() {
  try {
    // Conectar a MongoDB
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/CABD';

    if (process.env.USE_MEM_MONGO === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const Role = require('../models/role');

    // Definir los 4 roles con jerarquía
    const roles = [
      {
        name: 'administrador',
        nivel: 1,
        descripcion: 'Control total del sistema',
        permisos: ['*'] // Todos los permisos
      },
      {
        name: 'contador',
        nivel: 2,
        descripcion: 'Gestión contable y financiera completa',
        permisos: [
          'factura:crear',
          'factura:leer',
          'factura:editar',
          'factura:eliminar',
          'factura-cartera:crear',
          'factura-cartera:leer',
          'factura-cartera:editar',
          'factura-cartera:eliminar',
          'tercero:crear',
          'tercero:leer',
          'tercero:editar',
          'tercero:eliminar',
          'puc:crear',
          'puc:leer',
          'puc:editar',
          'puc:eliminar',
          'informe:leer',
          'informe:editar',      // ✅ Puede modificar informes
          'reporte:leer',
          'chat:usar'
        ]
      },
      {
        name: 'analista',
        nivel: 3,
        descripcion: 'Análisis y gestión sin creación de usuarios',
        permisos: [
          'factura:crear',
          'factura:leer',
          'factura:editar',
          'factura:eliminar',
          'factura-cartera:crear',
          'factura-cartera:leer',
          'factura-cartera:editar',
          'factura-cartera:eliminar',
          'tercero:crear',
          'tercero:leer',
          'tercero:editar',
          'tercero:eliminar',
          'puc:leer',
          'informe:leer',
          // ❌ NO: 'informe:editar' - No puede modificar informes
          'reporte:leer',
          // ❌ NO: 'usuario:crear' - No puede crear usuarios
          // ❌ NO: 'usuario:aprobar' - No puede aceptar usuarios nuevos
          'chat:usar'
        ]
      },
      {
        name: 'auxiliar',
        nivel: 4,
        descripcion: 'Entrada de datos y consulta de información',
        permisos: [
          'factura:crear',        // ✅ Digitalizar facturas
          'factura:leer',         // ✅ Ver facturas
          // ❌ NO: 'factura:editar' - Solo lectura/creación
          // ❌ NO: 'factura:eliminar'
          'factura-cartera:crear', // ✅ Digitalizar cartera
          'factura-cartera:leer',
          // ❌ NO: 'factura-cartera:editar'
          // ❌ NO: 'factura-cartera:eliminar'
          'tercero:crear',        // ✅ Crear terceros
          'tercero:leer',         // ✅ Ver terceros
          // ❌ NO: 'tercero:editar'
          // ❌ NO: 'tercero:eliminar'
          'puc:leer',             // ✅ Consultar PUC
          // ❌ NO: 'puc:crear/editar/eliminar' - No crear cuentas contables
          'informe:leer',         // ✅ Ver informes
          // ❌ NO: 'informe:editar' - No modificar informes
          'reporte:leer',
          'chat:usar'
          // ❌ NO: 'usuario:crear' - No crear usuarios
          // ❌ NO: 'usuario:aprobar' - No aceptar usuarios
        ]
      }
    ];

    // Limpiar roles existentes
    await Role.deleteMany({});
    console.log('🗑️  Roles anteriores eliminados');

    // Crear nuevos roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ ${createdRoles.length} roles creados:\n`);

    createdRoles.forEach(role => {
      console.log(`  📌 ${role.name.toUpperCase()} (Nivel ${role.nivel})`);
      console.log(`     └─ ${role.descripcion}`);
      console.log(`     └─ Permisos: ${role.permisos.length}`);
    });

    console.log('\n✨ Script de siembra completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRoles();
