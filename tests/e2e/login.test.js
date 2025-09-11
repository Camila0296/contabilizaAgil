const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Función auxiliar para encontrar elementos con reintentos
async function findElementWithRetry(driver, selectors, timeout = 10000) {
  const startTime = Date.now();
  let lastError;
  
  for (const selector of selectors) {
    try {
      const element = await driver.wait(
        until.elementLocated(By.css(selector)),
        Math.max(1000, timeout / selectors.length)
      );
      if (element) {
        await driver.wait(until.elementIsVisible(element), 1000);
        return element;
      }
    } catch (e) {
      lastError = e;
      // Continuar con el siguiente selector
    }
    
    // Verificar si se agotó el tiempo
    if (Date.now() - startTime > timeout) break;
  }
  
  throw lastError || new Error(`No se pudo encontrar el elemento con los selectores: ${selectors.join(', ')}`);
}

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:4200',
  headless: false,  // Cambiar a true para modo sin interfaz gráfica
  timeout: 30000,
  user: {
    email: 'admin@admin.com',
    password: 'admin'
  }
};

// Función para formatear la hora
function getCurrentTime() {
  return new Date().toISOString().substring(11, 19);
}

// Función para imprimir mensajes con formato
function log(message) {
  console.log(`[${getCurrentTime()}] ${message}`);
}

async function runLoginTest() {
  log('🚀 INICIO: Prueba de inicio de sesión');
  log(`📋 Configuración:`);
  log(`- URL: ${CONFIG.baseUrl}`);
  log(`- Usuario: ${CONFIG.user.email}`);
  log(`- Headless: ${CONFIG.headless ? 'Sí' : 'No'}`);
  
  // Configuración de Chrome
  const options = new chrome.Options();
  if (CONFIG.headless) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--start-maximized');

  let driver;
  
  try {
    // Inicializar WebDriver
    log('🌐 PASO 1/6: Iniciando navegador Chrome...');
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
      log('✅ Navegador iniciado correctamente');
    } catch (error) {
      log('❌ Error al iniciar el navegador: ' + error.message);
      throw error;
    }

    // Configurar timeouts
    await driver.manage().setTimeouts({
      implicit: CONFIG.timeout,
      pageLoad: CONFIG.timeout * 3,
      script: CONFIG.timeout
    });

    // Navegar a la página de inicio de sesión
    log('🌐 PASO 2/6: Navegando a la página de inicio de sesión...');
    try {
      await driver.get(`${CONFIG.baseUrl}`);
      log(`✅ Navegación exitosa a: ${CONFIG.baseUrl}`);
    } catch (error) {
      log(`❌ Error al navegar a la página: ${error.message}`);
      throw error;
    }

    // Ingresar credenciales
    log('🔑 PASO 3/6: Ingresando credenciales...');
    try {
      // Tomar una captura de pantalla de la página de login
      try {
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        fs.writeFileSync('login-page.png', screenshot, 'base64');
        log('   • Captura de pantalla guardada como login-page.png');
      } catch (e) {
        log('   • No se pudo guardar la captura de pantalla: ' + e.message);
      }

      // Obtener el HTML de la página para depuración
      try {
        const pageSource = await driver.getPageSource();
        fs.writeFileSync('login-page.html', pageSource);
        log('   • Código fuente de la página guardado como login-page.html');
      } catch (e) {
        log('   • No se pudo guardar el código fuente de la página: ' + e.message);
      }

      // Intentar diferentes selectores para el campo de email
      const emailSelectors = [
        'input[type="email"]',
        '#email',
        '[name="email"]',
        'input[placeholder*="mail"]',
        'input[placeholder*="usuario"]',
        'input[formcontrolname="email"]',
        'input[type="text"]',
        '.form-control',
        'input:first-of-type'
      ];
      
      log(`   • Buscando campo de email con selectores: ${emailSelectors.join(', ')}`);
      const emailInput = await findElementWithRetry(driver, emailSelectors, CONFIG.timeout);
      log('   • Campo de email encontrado');
      await emailInput.clear();
      await emailInput.sendKeys(CONFIG.user.email);
      log(`   • Email ingresado: ${CONFIG.user.email}`);

      // Intentar diferentes selectores para el campo de contraseña
      const passwordSelectors = [
        'input[type="password"]',
        '#password',
        '[name="password"]',
        'input[placeholder*="contrase"]',
        'input[placeholder*="pass"]',
        'input[formcontrolname="password"]',
        '.form-control ~ input[type="password"]',
        'input:last-of-type'
      ];
      
      log(`   • Buscando campo de contraseña con selectores: ${passwordSelectors.join(', ')}`);
      const passwordInput = await findElementWithRetry(driver, passwordSelectors, CONFIG.timeout);
      log('   • Campo de contraseña encontrado');
      await passwordInput.clear();
      await passwordInput.sendKeys(CONFIG.user.password);
      log('   • Contraseña ingresada');
    } catch (error) {
      log(`❌ Error al ingresar credenciales: ${error.message}`);
      // Tomar captura de pantalla del error
      try {
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        fs.writeFileSync('login-error.png', screenshot, 'base64');
        log('   • Captura de error guardada como login-error.png');
      } catch (e) {
        log('   • No se pudo guardar la captura de error: ' + e.message);
      }
      throw error;
    }

    // Hacer clic en el botón de inicio de sesión
    log('🖱️ PASO 4/6: Enviando formulario...');
    try {
      // Tomar captura antes de hacer clic
      const preClickScreenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('pre-click.png', preClickScreenshot, 'base64');
      
      // Intentar diferentes selectores para el botón de login
      const buttonSelectors = [
        'button[type="submit"]',
        'button.primary',
        '.btn-primary',
        'button:contains("Iniciar sesión")',
        'button:contains("Ingresar")',
        'button:contains("Login")',
        'button',
        'input[type="submit"]',
        '.btn',
        '.btn-submit',
        // Selectores específicos de Angular Material
        'button[color="primary"]',
        'button.mat-button',
        'button.mat-raised-button',
        'button.mat-flat-button',
        'button.mat-stroked-button'
      ];
      
      log('   • Buscando botón de inicio de sesión...');
      const loginButton = await findElementWithRetry(driver, buttonSelectors, CONFIG.timeout);
      log('   • Botón encontrado, intentando hacer clic...');
      
      // Desplazarse al botón si es necesario
      await driver.executeScript("arguments[0].scrollIntoView(true);", loginButton);
      
      // Esperar a que sea clickeable
      await driver.wait(until.elementIsVisible(loginButton), CONFIG.timeout);
      await driver.wait(until.elementIsEnabled(loginButton), CONFIG.timeout);
      
      // Usar JavaScript para hacer clic si es necesario
      try {
        await loginButton.click();
      } catch (clickError) {
        log('   • Error al hacer clic, intentando con JavaScript...');
        await driver.executeScript("arguments[0].click();", loginButton);
      }
      
      log('✅ Formulario enviado correctamente');
      
      // Esperar un momento para que se procese el clic
      await driver.sleep(5000);
      
    } catch (error) {
      log(`❌ Error al enviar el formulario: ${error.message}`);
      // Tomar captura del error
      try {
        const screenshot = await driver.takeScreenshot();
        require('fs').writeFileSync('form-error.png', screenshot, 'base64');
        log('   • Captura de error guardada como form-error.png');
      } catch (e) {
        log('   • No se pudo guardar la captura de error: ' + e.message);
      }
      throw error;
    }

    // Verificar inicio de sesión exitoso
    log('⏳ PASO 5/6: Verificando inicio de sesión exitoso...');
    try {
      // Esperar a que aparezca el título "Sistema de Gestión Contable"
      const successHeadingSelector = 'h1';
      log('   • Buscando título "Sistema de Gestión Contable"...');
      
      // Esperar a que el título sea visible
      const heading = await driver.wait(
        until.elementLocated(By.css(successHeadingSelector)),
        CONFIG.timeout * 2,
        'No se encontró el título de la página de inicio'
      );
      
      await driver.wait(until.elementIsVisible(heading), CONFIG.timeout);
      
      // Verificar que el título sea el esperado
      const headingText = await heading.getText();
      log(`   • Texto del título: ${headingText}`);
      
      if (!headingText.includes('Sistema de Gestión Contable')) {
        throw new Error('No se encontró el título "Sistema de Gestión Contable" después del inicio de sesión');
      }
      
      log('✅ Inicio de sesión exitoso detectado');
      
      // Tomar captura del dashboard
      try {
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        fs.writeFileSync('dashboard.png', screenshot, 'base64');
        log('   • Captura del dashboard guardada como dashboard.png');
      } catch (e) {
        log('   • No se pudo guardar la captura del dashboard: ' + e.message);
      }
    } catch (error) {
      log(`❌ Error en el proceso de inicio de sesión: ${error.message}`);
      throw error;
    }
    
    // Tomar captura de pantalla
    log('📸 PASO 6/6: Tomando captura de pantalla...');
    try {
      const fs = require('fs');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('screenshot.png', screenshot, 'base64');
      log('✅ Captura de pantalla guardada como screenshot.png');
    } catch (error) {
      log(`⚠️ No se pudo guardar la captura de pantalla: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    
    // Tomar captura de pantalla en caso de error
    if (driver) {
      const fs = require('fs');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('error-screenshot.png', screenshot, 'base64');
      console.log('📸 Captura de error guardada como error-screenshot.png');
    }
    
  } finally {
    // Cerrar el navegador
    if (driver) {
      try {
        log('👋 Cerrando navegador...');
        await driver.quit();
        log('✅ Navegador cerrado correctamente');
      } catch (error) {
        log(`⚠️ Error al cerrar el navegador: ${error.message}`);
      }
    }
    log('🏁 Prueba finalizada');
  }
}

// Función para asegurar el cierre del navegador
async function runTestSafely() {
  let driver;
  try {
    await runLoginTest();
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exitCode = 1; // Marcar la ejecución como fallida
  } finally {
    // Asegurarse de que el navegador se cierre
    try {
      if (global.driver) {
        await global.driver.quit();
        console.log('✅ Navegador cerrado correctamente');
      }
    } catch (e) {
      console.error('❌ Error al cerrar el navegador:', e);
    }
    // Forzar la salida después de un tiempo para asegurar que todo se cierre
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
}

// Exportar la función para que pueda ser usada en otros archivos
module.exports = { runLoginTest };

// Si se ejecuta directamente este archivo, ejecutar la prueba
if (require.main === module) {
  runTestSafely().catch(console.error);
}
