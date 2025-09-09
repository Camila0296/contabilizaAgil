const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testWebDriver() {
  console.log('Starting WebDriver test...');
  let driver;

  try {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    console.log('Initializing WebDriver...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('Navigating to Google...');
    await driver.get('https://www.google.com');
    
    const title = await driver.getTitle();
    console.log('Page title:', title);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      console.log('Quitting WebDriver...');
      await driver.quit();
    }
  }
}

testWebDriver().catch(console.error);
