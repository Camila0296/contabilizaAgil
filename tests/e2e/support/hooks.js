const { Before, After, AfterAll, setDefaultTimeout, Status } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');

// Aumentar el timeout a 2 minutos
setDefaultTimeout(120000);

// Variable para controlar la ejecución secuencial
let testInProgress = false;

Before(async function() {
  // Esperar a que la prueba anterior termine
  while (testInProgress) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  testInProgress = true;
  console.log('🚀 Iniciando nuevo escenario...');
  
  // Inicializar el driver
  await this.initDriver();
  
  // Configurar timeouts
  await this.driver.manage().setTimeouts({
    implicit: 30000,
    pageLoad: 60000,
    script: 60000
  });
  
  // Maximizar ventana
  try {
    await this.driver.manage().window().maximize();
  } catch (error) {
    console.warn('No se pudo maximizar la ventana:', error.message);
  }
});

After(async function(scenario) {
  console.log(`🏁 Finalizando escenario: ${scenario.pickle.name}`);
  
  // Tomar screenshot si el escenario falló
  if (scenario.result.status === Status.FAILED) {
    console.error(`❌ El escenario falló: ${scenario.pickle.name}`);
    try {
      await this.takeScreenshot(`failed-${scenario.pickle.name}`);
      console.log('📸 Se tomó un screenshot del error');
    } catch (error) {
      console.error('Error al tomar screenshot:', error.message);
    }
  } else {
    console.log('✅ Escenario completado exitosamente');
  }
  
  // Limpieza después de cada escenario
  try {
    if (this.driver) {
      // Cerrar todas las pestañas y ventanas
      const handles = await this.driver.getAllWindowHandles();
      for (const handle of handles) {
        await this.driver.switchTo().window(handle);
        await this.driver.close();
      }
      
      // Cerrar el driver
      await this.driver.quit();
      this.driver = null;
      console.log('🔌 WebDriver cerrado correctamente');
    }
  } catch (error) {
    console.error('Error durante la limpieza:', error.message);
  } finally {
    // Marcar que la prueba ha terminado
    testInProgress = false;
  }
});

AfterAll(async function() {
  console.log('🎉 Todos los tests han terminado');
  
  // Forzar cierre de procesos de Chrome que puedan haber quedado
  try {
    if (process.platform === 'win32') {
      require('child_process').execSync('taskkill /f /im chromedriver.exe /t', { stdio: 'ignore' });
      require('child_process').execSync('taskkill /f /im chrome.exe /t', { stdio: 'ignore' });
    } else {
      require('child_process').execSync('pkill -f chromedriver', { stdio: 'ignore' });
      require('child_process').execSync('pkill -f chrome', { stdio: 'ignore' });
    }
  } catch (error) {
    // Ignorar errores si no hay procesos para matar
  }
});