const { setWorldConstructor } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

class CustomWorld {
  constructor({ attach }) {
    this.attach = attach;
    this.driver = null;
  }

  async init() {
    const options = new firefox.Options();
    
    // Run in headless mode by default
    if (process.env.HEADED !== 'true') {
      options.headless();
    }
    
    // Additional options
    options.setPreference('browser.privatebrowsing.autostart', true);
    
    // Initialize the WebDriver
    this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
      
    // Set timeouts
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
