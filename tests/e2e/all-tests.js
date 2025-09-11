const { runLoginTest } = require('./login.test');
const { runRegistrationTest } = require('./register.test');

async function runAllTests() {
  let loginSuccess = false;
  
  try {
    console.log('🚀 INICIANDO TODAS LAS PRUEBAS');
    console.log('=============================');
    
    // Ejecutar primero la prueba de login
    console.log('\n🔐 EJECUTANDO PRUEBA DE LOGIN');
    console.log('---------------------------');
    await runLoginTest();
    loginSuccess = true;
    
    if (loginSuccess) {
      // Esperar un momento entre pruebas
      console.log('\n⏳ Esperando 3 segundos antes de la prueba de registro...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Luego ejecutar la prueba de registro
      console.log('\n📝 EJECUTANDO PRUEBA DE REGISTRO');
      console.log('----------------------------');
      await runRegistrationTest();
      
      console.log('\n✅ TODAS LAS PRUEBAS SE HAN COMPLETADO CON ÉXITO');
    } else {
      console.log('\n❌ La prueba de login falló. No se ejecutará la prueba de registro.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA EJECUCIÓN DE LAS PRUEBAS:', error);
    process.exit(1);
  }
}

// Si se ejecuta directamente este archivo, ejecutar las pruebas
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
}

// Exportar la función para que pueda ser usada en otros archivos
module.exports = { runAllTests };
