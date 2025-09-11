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
  timeout: 10000,
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
      await driver.get(`${CONFIG.baseUrl}/login`);
      log(`✅ Navegación exitosa a: ${CONFIG.baseUrl}/login`);
    } catch (error) {
      log(`❌ Error al navegar a la página: ${error.message}`);
      throw error;
    }

    // Ingresar credenciales
    log('🔑 PASO 3/6: Ingresando credenciales...');
    try {
      // Intentar diferentes selectores para el campo de email
      const emailSelectors = [
        'input[type="email"]',
        '#email',
        '[name="email"]',
        'input[placeholder*="mail"]',
        'input[placeholder*="usuario"]',
        '.form-control',
        'input:first-of-type'
      ];
      
      log(`   • Ingresando email: ${CONFIG.user.email}`);
      const emailInput = await findElementWithRetry(driver, emailSelectors, CONFIG.timeout);
      await emailInput.clear();
      await emailInput.sendKeys(CONFIG.user.email);
      log('   • Email ingresado correctamente');

      // Intentar diferentes selectores para el campo de contraseña
      const passwordSelectors = [
        'input[type="password"]',
        '#password',
        '[name="password"]',
        'input[placeholder*="contrase"]',
        'input[placeholder*="pass"]',
        'input[type="password"]',
        'input:last-of-type'
      ];
      
      log(`   • Ingresando contraseña: ${'*'.repeat(CONFIG.user.password.length)}`);
      const passwordInput = await findElementWithRetry(driver, passwordSelectors, CONFIG.timeout);
      await passwordInput.clear();
      await passwordInput.sendKeys(CONFIG.user.password);
      log('   • Contraseña ingresada correctamente');
    } catch (error) {
      log(`❌ Error al ingresar credenciales: ${error.message}`);
      throw error;
    }

    // Hacer clic en el botón de inicio de sesión
    log('🖱️ PASO 4/6: Enviando formulario...');
    try {
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
        '.btn-submit'
      ];
      
      const loginButton = await findElementWithRetry(driver, buttonSelectors, CONFIG.timeout);
      await driver.wait(until.elementIsVisible(loginButton), CONFIG.timeout);
      await loginButton.click();
      log('✅ Formulario enviado correctamente');
    } catch (error) {
      log(`❌ Error al enviar el formulario: ${error.message}`);
      throw error;
    }

    // Verificar inicio de sesión exitoso
    log('⏳ PASO 5/6: Verificando inicio de sesión exitoso...');
    try {
      // Lista de posibles selectores que indican un inicio de sesión exitoso
      const successSelectors = [
        // Elementos de dashboard
        '.dashboard', '.main-content', '.app-container',
        // Menús de usuario
        '.user-menu', '.user-profile', '.user-avatar',
        // Mensajes de bienvenida
        '.welcome-message', '.welcome-text', '.greeting',
        // Selectores de datos
        '[data-test="dashboard"]', '[data-role="main"]',
        // Títulos de página
        'h1', 'h2', '.page-title',
        // Cualquier elemento que no esté en la página de login
        'nav', 'header', 'aside', 'main', 'section'
      ];

      // Esperar a que aparezca algún elemento que indique éxito
      const successElement = await findElementWithRetry(driver, successSelectors, CONFIG.timeout * 3);
      
      // Verificar que no estamos en la página de login
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('login')) {
        throw new Error('La URL aún muestra la página de login');
      }
      
      // Obtener información del elemento de éxito
      const tagName = await successElement.getTagName();
      const elementClass = await successElement.getAttribute('class');
      const elementText = await successElement.getText();
      
      log(`✅ ¡Inicio de sesión exitoso!`);
      log(`   • Elemento encontrado: <${tagName} class="${elementClass}">`);
      if (elementText && elementText.length < 100) { // Mostrar solo si el texto no es muy largo
        log(`   • Texto: "${elementText.trim()}"`);
      }
      
      // Tomar captura de pantalla del dashboard
      try {
        await driver.takeScreenshot().then(
          (image) => require('fs').writeFileSync('dashboard.png', image, 'base64')
        );
        log('   • Captura del dashboard guardada como dashboard.png');
      } catch (e) {
        log('   • No se pudo guardar la captura del dashboard');
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

// Ejecutar la prueba
runTestSafely().catch(console.error);
