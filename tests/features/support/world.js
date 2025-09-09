const { setWorldConstructor } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class CustomWorld {
  constructor({ attach }) {
    this.attach = attach;
    this.driver = null;
  }

  async init() {
    console.log('Inicializando WebDriver...');
    const options = new chrome.Options();
    
    // Ejecutar en modo sin cabeza (headless) por defecto
    if (process.env.HEADED !== 'true') {
      options.addArguments('--headless=new');
    }
    
    // Opciones adicionales
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');
    
    // Inicializar el WebDriver
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Configurar timeouts
    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000
    });
    
    return this.driver;
  }
  
  async quit() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }
}

setWorldConstructor(CustomWorld);
