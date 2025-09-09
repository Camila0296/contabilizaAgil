const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');

// Establecer tiempo de espera predeterminado a 60 segundos
setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
  console.log('🚀 Iniciando suite de pruebas...');
  console.log('Entorno:', process.env.NODE_ENV || 'development');
  console.log('Versión de Node.js:', process.version);
});

Before(async function() {
  console.log('\n🌱 Iniciando un nuevo escenario...');
  try {
    console.log('Inicializando WebDriver...');
    await this.init();
    console.log('WebDriver inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar WebDriver:', error);
    throw error;
  }
});

After(async function(scenario) {
  console.log('\n🏁 Escenario finalizado con estado:', scenario.result?.status || 'desconocido');
  
  if (scenario.result?.status === 'FAILED') {
    console.log('❌ ¡Escenario fallido!');
    try {
      console.log('Tomando captura de pantalla...');
      const screenshot = await this.driver.takeScreenshot();
      this.attach(screenshot, 'image/png');
      console.log('Captura de pantalla guardada');
    } catch (error) {
      console.error('❌ Error al tomar la captura de pantalla:', error);
    }
  }
  
  try {
    console.log('Cerrando WebDriver...');
    await this.quit();
    console.log('WebDriver cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar WebDriver:', error);
  }
});

AfterAll(async function() {
  console.log('\n🏁 Suite de pruebas finalizada');
});
