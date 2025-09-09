const { Given, When, Then, After } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let driver;

Given('que estoy en la página de inicio de sesión', async function () {
  console.log('Navegando a la página de inicio de sesión...');
  
  const options = new firefox.Options();
  if (process.env.HEADED !== 'true') {
    options.headless();
  }
  
  driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
    
  await driver.get('http://localhost:4200/login');
  await driver.wait(until.elementLocated(By.css('body')), 10000);
});

Then('debería ver el título {string}', async function (tituloEsperado) {
  console.log(`Verificando que el título contenga: ${tituloEsperado}`);
  const titulo = await driver.getTitle();
  expect(titulo).to.include(tituloEsperado);
});

// Limpieza después de cada escenario
After(async function() {
  if (driver) {
    console.log('Cerrando el navegador...');
    await driver.quit();
  }
});
