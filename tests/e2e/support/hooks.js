const { Before, After, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');

// Allow up to 30 s for hooks & steps (slow UI / driver startup)
setDefaultTimeout(30000);

Before(async function() {
  // Configuración antes de cada escenario
  console.log('🚀 Iniciando escenario...');
  await this.initDriver();
  
  // Configurar timeouts
  await this.driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
  
  // Maximizar ventana
  await this.driver.manage().window().maximize();
});

After(async function(scenario) {
  // Limpieza después de cada escenario
  console.log('🧹 Limpiando después del escenario...');
  
  // Tomar screenshot si el escenario falló
  if (scenario.result.status === 'FAILED') {
    await this.takeScreenshot(`failed-${scenario.pickle.name.replace(/\s+/g, '-')}`);
    console.log('📸 Screenshot tomado para escenario fallido');
  }
  
  await this.cleanup();
});

AfterAll(async function() {
  // Limpieza final después de todos los tests
  console.log('🎉 Todos los tests han terminado');
  
  // Aquí podrías agregar lógica adicional como:
  // - Enviar reportes por email
  // - Subir screenshots a un servidor
  // - Limpiar datos de prueba
}); 