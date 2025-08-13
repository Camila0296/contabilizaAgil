const { Before, After, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const path = require('path');
const fs = require('fs');

// Configurar tiempo de espera global (2 minutos)
setDefaultTimeout(2 * 60 * 1000);

// Variable para controlar la ejecución secuencial
let testInProgress = false;

// Hook Before para cada escenario
Before(async function() {
  // Esperar a que la prueba anterior termine
  while (testInProgress) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  testInProgress = true;
  const scenario = this.scenario || this.test;
  if (scenario && scenario.pickle) {
    console.log(`\n🚀 Iniciando escenario: ${scenario.pickle.name}`);
  } else {
    console.log('\n🚀 Iniciando escenario (nombre no disponible)');
  }
  
  try {
    // Inicializar el driver si no está inicializado
    if (!this.driver) {
      if (typeof this.initDriver === 'function') {
        await this.initDriver();
        
        // Configurar timeouts del driver
        if (this.driver && typeof this.driver.manage === 'function') {
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
        }
      } else {
        console.warn('initDriver no está definido en el contexto del mundo');
      }
    }
  } catch (error) {
    console.error('Error en el hook Before:', error);
    testInProgress = false;
    throw error;
  }
});

After(async function(scenario) {
  const scenarioName = scenario.pickle.name;
  console.log(`🏁 Finalizando escenario: ${scenarioName}`);
  
  // Tomar screenshot si el escenario falló
  if (scenario.result.status === Status.FAILED) {
    console.error(`❌ El escenario falló: ${scenarioName}`);
    try {
      const screenshotPath = await this.takeScreenshot(`failed_${scenarioName}`);
      if (screenshotPath) {
        // Adjuntar la ruta del screenshot al resultado del escenario
        scenario.result.attachments = scenario.result.attachments || [];
        scenario.result.attachments.push({
          data: screenshotPath,
          media: { type: 'text/plain' },
          name: 'Screenshot Path'
        });
      }
    } catch (error) {
      console.error('Error al tomar screenshot:', error.message);
    }
  } else if (process.env.SCREENSHOT_ON_SUCCESS === 'true') {
    // Opcional: Tomar screenshot en éxito si está habilitado
    console.log('✅ Escenario completado exitosamente');
    await this.takeScreenshot(`success_${scenarioName}`);
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