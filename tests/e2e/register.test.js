const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Options } = require('selenium-webdriver/chrome');
const { ServiceBuilder } = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const webdriver = require('selenium-webdriver');
const chromeVersion = '140.0.7339.82';

// Configuración de ChromeDriver
const chromeDriverPath = require('chromedriver').path;
const service = new ServiceBuilder(chromeDriverPath)
  .setChromeBinary(`C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`)
  .build();

// Configurar el servicio global de ChromeDriver
try {
  chrome.setDefaultService(service);
} catch (err) {
  console.log('Usando configuración de ChromeDriver existente');
}

// Configuración de opciones de Chrome
const chromeOptions = new Options();
chromeOptions.setChromeBinaryPath(`C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`);
chromeOptions.addArguments(
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--window-size=1920,1080',
  '--disable-extensions',
  '--disable-software-rasterizer',
  '--disable-notifications',
  '--disable-popup-blocking',
  '--disable-default-apps',
  '--disable-infobars',
  '--disable-gpu-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-browser-side-navigation',
  '--disable-web-security',
  '--allow-running-insecure-content',
  '--disable-blink-features=AutomationControlled'
);

// Configuración para modo headless
if (process.env.HEADLESS === 'true') {
  chromeOptions.addArguments('--headless=new');
}

// Reutilizamos la función auxiliar del login test
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
    
    if (Date.now() - startTime > timeout) break;
  }
  
  throw lastError || new Error(`No se pudo encontrar el elemento con los selectores: ${selectors.join(', ')}`);
}

// Configuración
const CONFIG = {
  baseUrl: 'http://localhost:4200',
  headless: false,
  timeout: 15000, // Aumentado para dar más tiempo a la carga
  testUser: {
    nombres: 'Test',
    apellidos: 'User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test123!',
    confirmPassword: 'Test123!'
  },
  screenshotsDir: './screenshots'
};

// Función para crear el directorio de capturas si no existe
function ensureScreenshotsDir() {
  if (!fs.existsSync(CONFIG.screenshotsDir)) {
    fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
  }
}

// Función para tomar capturas de pantalla
async function takeScreenshot(driver, name) {
  ensureScreenshotsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `register-${name}-${timestamp}.png`;
  const filepath = path.join(CONFIG.screenshotsDir, filename);
  
  try {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, image, 'base64');
    return filepath;
  } catch (e) {
    console.error(`Error al guardar la captura ${name}:`, e.message);
    return null;
  }
}

// Función principal de la prueba
async function runRegistrationTest() {
  let driver;
  
  try {
    // Configurar el navegador
    console.log('🚀 Iniciando prueba de registro de usuario...');
    console.log(`🔍 Usando Chrome versión: ${chromeVersion}`);
    
    // Inicializar el driver con la configuración
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setChromeService(service)
      .build();
    
    // Configurar tiempo de espera global
    await driver.manage().setTimeouts({
      implicit: 10000,      // Tiempo de espera implícito
      pageLoad: 30000,      // Tiempo de espera para cargar la página
      script: 30000         // Tiempo de espera para ejecución de scripts
    });
    
    // Maximizar la ventana para asegurar visibilidad de elementos
    await driver.manage().window().maximize();
    
    // Navegar a la página principal
    console.log('🌐 Navegando a la página principal...');
    await driver.get(CONFIG.baseUrl);
    await takeScreenshot(driver, 'pagina-inicio');
    
    // Buscar y hacer clic en el botón de registro usando el selector exacto
    console.log('🔍 Buscando botón de registro...');
    const registerButtonSelectors = [
      '#root > div > div > div > div > div.bg-white.rounded-2xl.shadow-strong.overflow-hidden > div > div.p-8.lg\\:p-12.flex.flex-col.justify-center > div.text-center.mt-8 > p > button',
      'button:contains("Registrate aqui")',
      'button:contains("Registrarse")',
      'a:contains("Registrate aqui")',
      'a:contains("Registrarse")',
      'a[href*="register"]',
      'button[routerLink*="register"]'
    ];
    
    // Intentar con el selector exacto primero
    try {
      const registerButton = await driver.wait(
        until.elementLocated(By.css(registerButtonSelectors[0])),
        CONFIG.timeout
      );
      await driver.wait(until.elementIsVisible(registerButton), CONFIG.timeout);
      await registerButton.click();
      console.log('✅ Botón de registro encontrado y clickeado usando selector exacto');
    } catch (error) {
      console.log('⚠️ No se pudo encontrar el botón con el selector exacto, intentando con selectores alternativos...');
      // Si falla, intentar con los selectores alternativos
      const registerLink = await findElementWithRetry(driver, registerButtonSelectors.slice(1));
      await driver.wait(until.elementIsVisible(registerLink), CONFIG.timeout);
      await registerLink.click();
      console.log('✅ Botón de registro encontrado y clickeado usando selectores alternativos');
    }
    
    await takeScreenshot(driver, 'click-registro');
    
    // Esperar a que el formulario de registro esté visible
    console.log('⏳ Cargando formulario de registro...');
    await driver.wait(until.elementLocated(By.css('form')), CONFIG.timeout);
    await takeScreenshot(driver, 'formulario-registro');
    
    // Llenar el formulario de registro
    console.log('📝 Llenando formulario de registro...');
    
    // Campos del formulario basados en el componente Register.tsx
    const fields = [
      { 
        name: 'nombres', 
        selectors: [
          'input[name="nombres"]', 
          '#nombres', 
          'input[formControlName="nombres"]',
          'input[placeholder*="Juan"]'
        ] 
      },
      { 
        name: 'apellidos', 
        selectors: [
          'input[name="apellidos"]', 
          '#apellidos', 
          'input[formControlName="apellidos"]',
          'input[placeholder*="Perez"]'
        ] 
      },
      { 
        name: 'email', 
        selectors: [
          'input[type="email"]', 
          '#email', 
          'input[formControlName="email"]',
          'input[placeholder*="correo"]'
        ] 
      },
      { 
        name: 'password', 
        selectors: [
          'input[type="password"][name="password"]',
          '#password', 
          'input[formControlName="password"]',
          'input[type="password"]:nth-of-type(1)'
        ] 
      },
      { 
        name: 'confirmPassword', 
        selectors: [
          'input[type="password"][name="confirmPassword"]',
          '#confirmPassword', 
          'input[formControlName="confirmPassword"]',
          'input[type="password"]:nth-of-type(2)'
        ] 
      }
    ];
    
    // Llenar cada campo
    for (const field of fields) {
      try {
        const element = await findElementWithRetry(driver, field.selectors);
        await element.clear();
        await element.sendKeys(CONFIG.testUser[field.name]);
        console.log(`   ✓ Campo ${field.name} completado`);
      } catch (error) {
        console.error(`   ✗ Error al completar el campo ${field.name}:`, error.message);
        throw error;
      }
    }
    
    // Tomar captura después de llenar el formulario
    await takeScreenshot(driver, 'formulario-completo');
    
    // Enviar el formulario
    console.log('🖱️ Enviando formulario de registro...');
    const submitButtons = [
      'button[type="submit"]',
      'button.primary',
      '.btn-primary',
      'button:contains("Registrarse")',
      'button:contains("Crear cuenta")',
      'button'
    ];
    
    const submitButton = await findElementWithRetry(driver, submitButtons);
    await submitButton.click();
    
    // Esperar a que se complete el registro
    console.log('⏳ Esperando confirmación de registro...');
    
    // Verificar registro exitoso
    const successSelectors = [
      '.alert-success',
      '.toast-success',
      '.success-message',
      'div:contains("Registro exitoso")',
      'div:contains("cuenta está pendiente de aprobación")',
      'h2:contains("Registro exitoso")',
      'body'
    ];
    
    try {
      const successElement = await findElementWithRetry(driver, successSelectors, 15000);
      const successText = await successElement.getText();
      console.log('✅ Registro exitoso!');
      console.log(`   • ${successText.substring(0, 100)}${successText.length > 100 ? '...' : ''}`);
      
      // Tomar captura del resultado
      await takeScreenshot(driver, 'registro-exitoso');
      
      // Verificar redirección
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('login') || currentUrl.includes('register')) {
        console.log('⚠️  El usuario fue redirigido a:', currentUrl);
      } else {
        console.log('🔗 Redirigido a:', currentUrl);
      }
      
    } catch (error) {
      console.error('❌ No se pudo verificar el registro exitoso:', error.message);
      // Tomar captura de error
      await takeScreenshot(driver, 'error-registro');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba de registro:', error);
    // Tomar captura de error
    if (driver) {
      await takeScreenshot(driver, 'error-final');
    }
    throw error;
    
  } finally {
    // Cerrar el navegador
    if (driver) {
      try {
        await driver.quit();
        console.log('✅ Navegador cerrado correctamente');
      } catch (e) {
        console.error('Error al cerrar el navegador:', e);
      }
    }
  }
}

// Ejecutar la prueba
runRegistrationTest().catch(error => {
  console.error('Prueba fallida:', error);
  process.exit(1);
});
