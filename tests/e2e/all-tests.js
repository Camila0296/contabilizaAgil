// Ejecuta todas las pruebas E2E en orden. Requiere la app corriendo (npm start).
const { runLoginTest } = require('./login.test');
const { runRegistrationTest } = require('./register.test');
const { runFacturasTest } = require('./facturas.test');
const { runTercerosCarteraTest } = require('./terceros-cartera.test');
const { runRolesTest } = require('./roles.test');

const SUITES = [
  ['Login', runLoginTest],
  ['Registro', runRegistrationTest],
  ['Facturas', runFacturasTest],
  ['Terceros y Cartera', runTercerosCarteraTest],
  ['Roles', runRolesTest],
];

async function runAllTests() {
  console.log('🚀 INICIANDO TODAS LAS PRUEBAS E2E');
  const fallidas = [];
  for (const [name, run] of SUITES) {
    console.log(`\n=== ${name} ===`);
    try {
      await run();
    } catch (error) {
      fallidas.push(name);
    }
  }

  console.log(`\nResultado: ${SUITES.length - fallidas.length}/${SUITES.length} suites exitosas`);
  if (fallidas.length) {
    console.log(`❌ Fallaron: ${fallidas.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ TODAS LAS PRUEBAS E2E SE COMPLETARON CON ÉXITO');
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
