const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:4200',
  headless: false,
  timeout: 10000,
  testUser: {
    nombres: 'Test',
    apellidos: 'User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test123!',
    confirmPassword: 'Test123!'
  },
  screenshotsDir: './screenshots'
};

// Función para formatear la hora
function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// Función para imprimir mensajes con formato
function log(message) {
  console.log(`[${getCurrentTime()}] ${message}`);
}

// Función para pausar la ejecución
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Configuración del navegador
const chromeOptions = new chrome.Options();
if (CONFIG.headless) {
  chromeOptions.addArguments('--headless=new');
}
chromeOptions.addArguments(
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--window-size=1920,1080',
  '--start-maximized'
);

// Función principal de la prueba
async function runRegistrationTest() {
  log('🚀 INICIO: Prueba de registro de usuario');
  log(`📋 Configuración:`);
  log(`- URL: ${CONFIG.baseUrl}`);
  log(`- Headless: ${CONFIG.headless ? 'Sí' : 'No'}`);
  
  let driver;
  
  try {
    // Inicializar WebDriver
    log('🌐 PASO 1/6: Iniciando navegador Chrome...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    log('✅ Navegador iniciado correctamente');
    
    // Configurar timeouts
    await driver.manage().setTimeouts({
      implicit: CONFIG.timeout,
      pageLoad: CONFIG.timeout * 3,
      script: CONFIG.timeout
    });

    // Navegar a la página principal
    log('🌐 PASO 2/6: Navegando a la página principal...');
    await driver.get(CONFIG.baseUrl);
    log(`✅ Navegación exitosa a: ${CONFIG.baseUrl}`);
    await sleep(1000);
    
    // Maximizar la ventana para asegurar visibilidad de elementos
    await driver.manage().window().maximize();
    await sleep(1000);
    
    // Buscar y hacer clic en el enlace de registro usando el XPath proporcionado
    log('🔍 Buscando enlace de registro con el XPath proporcionado...');
    try {
      // Usar el XPath exacto proporcionado
      const registerXPath = '//*[@id="root"]/div/div/div/div/div[2]/div/div[1]/div[2]/p/button';
      
      // Esperar a que el elemento esté presente y sea visible
      const registerButton = await driver.wait(
        until.elementLocated(By.xpath(registerXPath)),
        CONFIG.timeout,
        'No se encontró el botón de registro con el XPath proporcionado'
      );
     
      await driver.wait(until.elementIsVisible(registerButton), CONFIG.timeout);
      await driver.wait(until.elementIsEnabled(registerButton), CONFIG.timeout);
      
      // Desplazarse al elemento para asegurar visibilidad
      await driver.executeScript("arguments[0].scrollIntoView(true);", registerButton);
      
      // Tomar captura antes de hacer clic
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('before-register-click.png', screenshot, 'base64');
      await sleep(1000);
      // Hacer clic en el botón
      log('✅ Haciendo clic en el botón de registro...');
      try {
        await registerButton.click();
      } catch (clickError) {
        log('   • Intento de clic normal fallido, usando JavaScript...');
        await driver.executeScript("arguments[0].click();", registerButton);
      }
      
      // Esperar a que se cargue la vista de registro usando el XPath proporcionado
      log('⏳ Validando que estamos en la vista de registro...');
      const registrationTitleXPath = '//*[@id="root"]/div/div/div/div/div[2]/div/div[1]/div[1]/div[1]/h2';
      await sleep(1000);
      try {
        const registrationTitle = await driver.wait(
          until.elementLocated(By.xpath(registrationTitleXPath)),
          CONFIG.timeout,
          'No se pudo encontrar el título de la vista de registro'
        );
        
        await driver.wait(
          until.elementIsVisible(registrationTitle),
          CONFIG.timeout,
          'El título de la vista de registro no es visible'
        );
       
        const titleText = await registrationTitle.getText();
        log(`✅ Vista de registro cargada correctamente. Título: "${titleText}"`);
        
        // Verificar que el formulario de registro esté presente
        await driver.wait(
          until.elementLocated(By.css('form')),
          CONFIG.timeout,
          'No se encontró el formulario de registro'
        );
        await sleep(1000);
        log('✅ Formulario de registro cargado correctamente');
        
      } catch (error) {
        const screenshot = await driver.takeScreenshot();
        require('fs').writeFileSync('register-view-error.png', screenshot, 'base64');
        throw new Error(`Error al validar la vista de registro: ${error.message}`);
      }
      
      // Llenar el formulario de registro
      log('📝 Llenando el formulario de registro...');
   
      // Función auxiliar para llenar campos del formulario
      const fillField = async (id, value, description) => {
        const element = await driver.wait(
          until.elementLocated(By.id(id)),
          CONFIG.timeout,
          `No se encontró el campo ${description} (${id})`
        );
        await element.clear();
        await element.sendKeys(value);
        log(`   • ${description} completado`);
      };
      
      // Llenar los campos del formulario
      await fillField('nombres', CONFIG.testUser.nombres, 'Nombres');
      await fillField('apellidos', CONFIG.testUser.apellidos, 'Apellidos');
      await fillField('email', CONFIG.testUser.email, 'Correo electrónico');
      await fillField('password', CONFIG.testUser.password, 'Contraseña');
      await fillField('confirmPassword', CONFIG.testUser.confirmPassword, 'Confirmar contraseña');
      await sleep(1000);
      // Tomar captura después de llenar el formulario
      const filledFormScreenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('filled-register-form.png', filledFormScreenshot, 'base64');
      
      // Enviar el formulario
      log('🔄 Enviando el formulario de registro...');
      const submitButton = await driver.wait(
        until.elementLocated(By.css('button[type="submit"]')),
        CONFIG.timeout,
        'No se encontró el botón de enviar el formulario'
      );
      
      await driver.wait(until.elementIsVisible(submitButton), CONFIG.timeout);
      await driver.wait(until.elementIsEnabled(submitButton), CONFIG.timeout);

      try {
        await submitButton.click();
      } catch (clickError) {
        log('   • Intento de clic normal fallido, usando JavaScript...');
        await driver.executeScript("arguments[0].click();", submitButton);
      }
      
      // Esperar a que se complete el registro
      log('⏳ Esperando a que se complete el registro...');
      await driver.wait(
        async () => {
          const currentUrl = await driver.getCurrentUrl();
          return !currentUrl.includes('register') && !currentUrl.endsWith('register');
        },
        15000,
        'No se completó el registro después de 15 segundos'
      );
      
      log('✅ Registro completado exitosamente');
      
    } catch (e) {
      log(`❌ Error durante la prueba de registro: ${e.message}`);
      // Tomar captura de la página actual para depuración
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('register-error.png', screenshot, 'base64');
      throw e;
    }
    await sleep(1000);
  } catch (error) {
    log(`❌ Error en la prueba de registro: ${error.message}`);
    throw error;
    
  } finally {
    await sleep(1000);
    // Cerrar el navegador
    if (driver) {
      log('👋 Cerrando navegador...');
      await driver.quit();
      log('✅ Navegador cerrado correctamente');
    }
    log('🏁 Prueba finalizada');
  }
}

// Función para asegurar el cierre del navegador
async function runTestSafely() {
  try {
    await runRegistrationTest();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la prueba de registro:', error);
    process.exit(1);
  }
}

// Exportar la función para que pueda ser usada en otros archivos
module.exports = { runRegistrationTest };

// Si se ejecuta directamente este archivo, ejecutar la prueba
if (require.main === module) {
  runTestSafely();
}
