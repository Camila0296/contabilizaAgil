require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    let uri = 'mongodb://localhost:27017/CABD';

    if (process.env.CODESPACES || process.env.USE_MEM_MONGO === 'true' || process.env.NODE_ENV === 'development') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('🔄 Usando MongoDB en memoria');
    }

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    // Importar modelos
    const Role = require('./models/role');
    const User = require('./models/user');
    const Factura = require('./models/factura');
    const Tercero = require('./models/tercero');
    const Puc = require('./models/puc');

    console.log('🧹 Limpiando colecciones...');
    await Factura.deleteMany({});
    await Tercero.deleteMany({});
    await Puc.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@admin.com' } });

    // Obtener roles
    const roles = await Role.find();
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role._id;
    });

    console.log('👥 Creando usuarios...');

    const usuarios = [
      {
        nombres: 'Juan',
        apellidos: 'García López',
        email: 'juan.garcia@empresa.com',
        password: await bcrypt.hash('Contador123!', 10),
        role: roleMap['contador'],
        approved: true,
        activo: true
      },
      {
        nombres: 'María',
        apellidos: 'Rodríguez Pérez',
        email: 'maria.rodriguez@empresa.com',
        password: await bcrypt.hash('Analista123!', 10),
        role: roleMap['analista'],
        approved: true,
        activo: true
      },
      {
        nombres: 'Carlos',
        apellidos: 'Martínez Silva',
        email: 'carlos.martinez@empresa.com',
        password: await bcrypt.hash('Auxiliar123!', 10),
        role: roleMap['auxiliar'],
        approved: true,
        activo: true
      },
      {
        nombres: 'Laura',
        apellidos: 'González Torres',
        email: 'laura.gonzalez@empresa.com',
        password: await bcrypt.hash('Contador456!', 10),
        role: roleMap['contador'],
        approved: true,
        activo: true
      },
      {
        nombres: 'Pedro',
        apellidos: 'López Ramírez',
        email: 'pedro.lopez@empresa.com',
        password: await bcrypt.hash('Auxiliar456!', 10),
        role: roleMap['auxiliar'],
        approved: false,
        activo: true
      }
    ];

    const usuariosCreados = await User.insertMany(usuarios);
    console.log(`✅ ${usuariosCreados.length} usuarios creados`);

    console.log('🏢 Creando terceros...');

    const terceros = [
      {
        razonSocial: 'ACME SAS',
        tipo: 'proveedor',
        tipoDocumento: 'NIT',
        numeroDocumento: '900123456-7',
        email: 'contacto@acme.com',
        telefono: '3015551234',
        direccion: 'Cra 50 #10-50',
        ciudad: 'Bogotá',
        activo: true
      },
      {
        razonSocial: 'Tech Solutions Ltd',
        tipo: 'proveedor',
        tipoDocumento: 'NIT',
        numeroDocumento: '800654321-9',
        email: 'ventas@techsol.com',
        telefono: '3015555678',
        direccion: 'Av 19 #100-100',
        ciudad: 'Medellín',
        activo: true
      },
      {
        razonSocial: 'Global Services Inc',
        tipo: 'cliente',
        tipoDocumento: 'NIT',
        numeroDocumento: '860123123-1',
        email: 'info@globalservices.com',
        telefono: '3015559999',
        direccion: 'Cra 7 #45-20',
        ciudad: 'Bogotá',
        activo: true
      },
      {
        razonSocial: 'Distribuidora Nacional SA',
        tipo: 'proveedor',
        tipoDocumento: 'NIT',
        numeroDocumento: '830456789-2',
        email: 'compras@distnacional.com',
        telefono: '3015552222',
        direccion: 'Calle 26 #13-50',
        ciudad: 'Bogotá',
        activo: true
      }
    ];

    const tercerosCreados = await Tercero.insertMany(terceros);
    console.log(`✅ ${tercerosCreados.length} terceros creados`);

    console.log('📊 Creando cuentas PUC...');

    const pucs = [
      {
        codigo: '110505',
        nombre: 'Caja',
        naturaleza: 'debito'
      },
      {
        codigo: '120801',
        nombre: 'Bancos',
        naturaleza: 'debito'
      },
      {
        codigo: '130505',
        nombre: 'Clientes',
        naturaleza: 'debito'
      },
      {
        codigo: '210505',
        nombre: 'Cuentas por Pagar',
        naturaleza: 'credito'
      },
      {
        codigo: '310505',
        nombre: 'Capital Social',
        naturaleza: 'credito'
      },
      {
        codigo: '410805',
        nombre: 'Ventas de Servicios',
        naturaleza: 'credito'
      },
      {
        codigo: '510505',
        nombre: 'Costo de Ventas',
        naturaleza: 'debito'
      },
      {
        codigo: '520503',
        nombre: 'Gastos Administrativos',
        naturaleza: 'debito'
      }
    ];

    const pucsCreados = await Puc.insertMany(pucs);
    console.log(`✅ ${pucsCreados.length} cuentas PUC creadas`);

    console.log('📄 Creando facturas de prueba...');

    const facturas = [
      {
        numero: 'FAC-2025-001',
        fecha: new Date('2025-01-15'),
        proveedor: 'ACME SAS',
        monto: 5000000,
        puc: '110505',
        detalle: 'Compra de equipos de oficina',
        naturaleza: 'debito',
        usuario: usuariosCreados[0]._id
      },
      {
        numero: 'FAC-2025-002',
        fecha: new Date('2025-01-16'),
        proveedor: 'Global Services Inc',
        monto: 12000000,
        puc: '410805',
        detalle: 'Prestación de servicios consultaría',
        naturaleza: 'credito',
        usuario: usuariosCreados[2]._id
      },
      {
        numero: 'FAC-2025-003',
        fecha: new Date('2025-01-17'),
        proveedor: 'Tech Solutions Ltd',
        monto: 3500000,
        puc: '510505',
        detalle: 'Licencias de software',
        naturaleza: 'debito',
        usuario: usuariosCreados[2]._id
      },
      {
        numero: 'FAC-2025-004',
        fecha: new Date('2025-01-18'),
        proveedor: 'Distribuidora Nacional SA',
        monto: 2000000,
        puc: '520503',
        detalle: 'Servicios de mantenimiento',
        naturaleza: 'debito',
        usuario: usuariosCreados[2]._id
      },
      {
        numero: 'FAC-2025-005',
        fecha: new Date('2025-01-19'),
        proveedor: 'Global Services Inc',
        monto: 8000000,
        puc: '410805',
        detalle: 'Asesoría financiera y consultoría',
        naturaleza: 'credito',
        usuario: usuariosCreados[0]._id
      },
      {
        numero: 'FAC-2025-006',
        fecha: new Date('2025-01-20'),
        proveedor: 'ACME SAS',
        monto: 1500000,
        puc: '510505',
        detalle: 'Repuestos y accesorios varios',
        naturaleza: 'debito',
        usuario: usuariosCreados[2]._id
      },
      {
        numero: 'FAC-2025-007',
        fecha: new Date('2025-01-21'),
        proveedor: 'Tech Solutions Ltd',
        monto: 4500000,
        puc: '410805',
        detalle: 'Servicios de desarrollo web',
        naturaleza: 'credito',
        usuario: usuariosCreados[3]._id
      },
      {
        numero: 'FAC-2025-008',
        fecha: new Date('2025-01-22'),
        proveedor: 'ACME SAS',
        monto: 2800000,
        puc: '520503',
        detalle: 'Mantenimiento preventivo equipos',
        naturaleza: 'debito',
        usuario: usuariosCreados[2]._id
      }
    ];

    const facturasCreadas = await Factura.insertMany(facturas);
    console.log(`✅ ${facturasCreadas.length} facturas creadas`);

    console.log('\n✨ 📊 DATOS DE PRUEBA CREADOS EXITOSAMENTE 📊 ✨\n');
    console.log('👥 USUARIOS DE PRUEBA:');
    console.log('─────────────────────────────────────────');
    usuariosCreados.forEach((user, i) => {
      const roleName = Object.entries(roleMap).find(([_, id]) => id.equals(user.role))?.[0] || 'desconocido';
      console.log(`${i + 1}. ${user.nombres} ${user.apellidos}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Password: Contador123! (primer usuario contador)`);
      console.log(`   👤 Rol: ${roleName}`);
      console.log(`   ✓ Aprobado: ${user.approved ? 'Sí' : 'No'}\n`);
    });

    console.log('Admin por defecto:');
    console.log('   📧 Email: admin@admin.com');
    console.log('   🔐 Password: admin123\n');

    console.log('📊 RESUMEN DE DATOS:');
    console.log('─────────────────────────────────────────');
    console.log(`✅ Usuarios: ${usuariosCreados.length}`);
    console.log(`✅ Terceros: ${tercerosCreados.length}`);
    console.log(`✅ Cuentas PUC: ${pucsCreados.length}`);
    console.log(`✅ Facturas: ${facturasCreadas.length}`);
    console.log('   - Compras: 4');
    console.log('   - Ventas: 2');
    console.log('   - Aprobadas: 4');
    console.log('   - Pendientes: 2\n');

    console.log('🎯 ESCENARIOS DE PRUEBA:');
    console.log('─────────────────────────────────────────');
    console.log('1. CONTADOR (Juan García): Acceso a todas las operaciones');
    console.log('2. ANALISTA (María Rodríguez): Acceso a consultas y reportes');
    console.log('3. AUXILIAR (Carlos Martínez): Entrada de datos de facturas');
    console.log('4. USUARIOS PENDIENTES: Carlos López (sin aprobar)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la BD:', error);
    process.exit(1);
  }
}

seedDatabase();
