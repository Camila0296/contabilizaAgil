const { setWorldConstructor, After, Before } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');

// Cargar ChromeDriver
require('chromedriver');

class CustomWorld {
  constructor({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters;
    this.driver = null;
    this.currentPage = '';
    this.testData = {};
    this.screenshots = [];
    
    // Crear directorio de screenshots si no existe
    this.screenshotsDir = path.join(process.cwd(), 'reports', 'screenshots');
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async initDriver() {
    if (this.driver) {
      return this.driver;
    }

    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,1024'
    );

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
      
    // Configurar timeouts
    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000
    });
    
    return this.driver;
  }

  async navigateTo(url) {
    await this.driver.get(url);
  }

  async waitForElement(selector, timeout = 50000) {
    await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
  }

  async clickElement(selector) {
    const element = await this.driver.findElement(By.css(selector));
    await element.click();
  }

  async fillInput(selector, value) {
    const element = await this.driver.findElement(By.css(selector));
    await element.clear();
    await element.sendKeys(value);
  }

  async getText(selector) {
    const element = await this.driver.findElement(By.css(selector));
    return await element.getText();
  }

  async isElementVisible(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async takeScreenshot(name) {
    if (this.driver) {
      try {
        // Crear nombre de archivo seguro
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeName}_${timestamp}.png`;
        const screenshotPath = `${process.cwd()}/reports/screenshots/${fileName}`;
        
        // Tomar el screenshot
        const screenshot = await this.driver.takeScreenshot();
        
        // Guardar en memoria para el reporte
        this.screenshots.push({ 
          name: safeName, 
          data: screenshot,
          path: screenshotPath
        });
        
        // Guardar archivo en disco
        const fs = require('fs');
        const path = require('path');
        
        // Asegurarse de que exista el directorio
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Guardar el archivo
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        console.log(`📸 Screenshot guardado en: ${screenshotPath}`);
        
        return screenshotPath;
      } catch (error) {
        console.error('Error al guardar el screenshot:', error);
        return null;
      }
    }
    return null;
  }

  async login(email = 'admin@admin.com', password = 'admin') {
    await this.driver.get('http://localhost:4200');
    
    const emailInput = await this.driver.findElement(By.name('email'));
    const passwordInput = await this.driver.findElement(By.name('password'));
    const loginButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Iniciar sesión')]"));
    
    await emailInput.sendKeys(email);
    await passwordInput.sendKeys(password);
    await loginButton.click();
    
    await this.driver.wait(until.urlContains('/dashboard'), 50000);
  }

  async logout() {
    try {
      const logoutButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Cerrar sesión')]"));
      await logoutButton.click();
    } catch (error) {
      // Buscar en el menú de usuario
      const userMenu = await this.driver.findElement(By.css('.user-menu, .dropdown'));
      await userMenu.click();
      const logoutOption = await this.driver.findElement(By.xpath("//*[contains(text(), 'Cerrar sesión')]"));
      await logoutOption.click();
    }
  }

  async waitForUrl(url, timeout = 50000) {
    await this.driver.wait(until.urlContains(url), timeout);
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async cleanup() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

setWorldConstructor(CustomWorld); 