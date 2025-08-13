// Configuración global de timeouts para Cucumber
const { BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');

// Configura el tiempo de espera predeterminado para los pasos (60 segundos)
setDefaultTimeout(60 * 1000);

// Configuración global que se ejecuta antes de todos los escenarios
BeforeAll(function() {
  // Configuraciones adicionales pueden ir aquí
  console.log('Configuración global de timeouts inicializada');
});

// Manejador global de errores para pasos asíncronos
process.on('unhandledRejection', (reason, promise) => {
  console.error('Error no manejado en la promesa:', reason);
  // Opcional: finalizar el proceso con error
  // process.exit(1);
});
