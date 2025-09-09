const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');

// Set default timeout to 60 seconds
setDefaultTimeout(60 * 1000);

BeforeAll(async function() {
  console.log('🚀 Starting test suite...');
});

Before(async function() {
  // Initialize the WebDriver before each scenario
  await this.init();
});

After(async function(scenario) {
  // Take a screenshot if the scenario failed
  if (scenario.result && scenario.result.status === 'FAILED') {
    const screenshot = await this.driver.takeScreenshot();
    this.attach(screenshot, 'image/png');
  }
  
  // Quit the WebDriver after each scenario
  await this.quit();
});

AfterAll(async function() {
  console.log('🏁 Test suite completed');
});
