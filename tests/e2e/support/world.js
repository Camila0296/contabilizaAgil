const { setWorldConstructor } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Cargar ChromeDriver
require('chromedriver');

class CustomWorld {
  constructor() {
    this.driver = null;
    this.currentPage = '';
    this.testData = {};
    this.screenshots = [];
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
      const screenshot = await this.driver.takeScreenshot();
      this.screenshots.push({ name, data: screenshot });
    }
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