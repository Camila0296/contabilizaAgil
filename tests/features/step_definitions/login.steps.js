const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');

Given('que estoy en la página de inicio de sesión', async function() {
  await this.driver.get('http://localhost:4200/login');
  await this.driver.wait(until.elementLocated(By.css('form')), 10000);
});

When('ingreso el email {string}', async function(email) {
  const emailInput = await this.driver.findElement(By.name('email'));
  await emailInput.clear();
  await emailInput.sendKeys(email);
});

When('ingreso la contraseña {string}', async function(password) {
  const passwordInput = await this.driver.findElement(By.name('password'));
  await passwordInput.clear();
  await passwordInput.sendKeys(password);
});

When('hago clic en el botón {string}', async function(buttonText) {
  const button = await this.driver.findElement(
    By.xpath(`//button[contains(text(), '${buttonText}')]`)
  );
  await button.click();
  
  // Add a small delay to allow for page transitions
  await this.driver.sleep(1000);
});

Then('debería ser redirigido al dashboard', async function() {
  await this.driver.wait(until.urlContains('/dashboard'), 10000);
  const currentUrl = await this.driver.getCurrentUrl();
  expect(currentUrl).to.include('/dashboard');
});

Then('debería ver un mensaje de error', async function() {
  // Wait for either an error message or alert to appear
  const errorSelectors = [
    '.error-message',
    '.alert',
    '.alert-danger',
    '[role="alert"]',
    '.toast-error',
    '.notification-error'
  ];
  
  // Try to find any error element
  let errorElement = null;
  for (const selector of errorSelectors) {
    try {
      const elements = await this.driver.findElements(By.css(selector));
      if (elements.length > 0) {
        errorElement = elements[0];
        break;
      }
    } catch (error) {
      // Ignore and try next selector
    }
  }
  
  // If no error element found, try to find any text that might indicate an error
  if (!errorElement) {
    const bodyText = await this.driver.findElement(By.tagName('body')).getText();
    const errorKeywords = ['error', 'incorrecto', 'inválido', 'falló'];
    
    const hasError = errorKeywords.some(keyword => 
      bodyText.toLowerCase().includes(keyword)
    );
    
    expect(hasError, 'No se encontró ningún mensaje de error visible').to.be.true;
  } else {
    // Verify the error element is visible
    const isDisplayed = await errorElement.isDisplayed();
    expect(isDisplayed, 'El mensaje de error no está visible').to.be.true;
    
    // Log the error message for debugging
    const errorText = await errorElement.getText();
    console.log('Mensaje de error encontrado:', errorText);
  }
});
