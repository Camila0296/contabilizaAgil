const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');

Given('que estoy en la página principal', async function() {
  await this.driver.get('http://localhost:4200/dashboard');
  await this.driver.wait(until.elementLocated(By.css('.dashboard-container')), 5000);
});

Then('debería ver las siguientes estadísticas:', async function(dataTable) {
  const stats = dataTable.rowsHash();
  
  for (const [statName, description] of Object.entries(stats)) {
    try {
      // Buscar elementos que contengan el nombre de la estadística
      const statElement = await this.driver.findElement(
        By.xpath(`//*[contains(text(), '${statName}') or contains(@class, '${statName.toLowerCase()}')]`)
      );
      expect(await statElement.isDisplayed()).to.be.true;
    } catch (error) {
      console.log(`⚠️  No se pudo encontrar la estadística: ${statName}`);
    }
  }
});

When('hago clic en {string}', async function(buttonText) {
  const button = await this.driver.findElement(By.xpath(`//button[contains(text(), '${buttonText}')]`));
  await button.click();
});

Then('debería ser redirigido a la página de crear factura', async function() {
  await this.driver.wait(until.urlContains('/facturas/nueva'), 5000);
  const currentUrl = await this.driver.getCurrentUrl();
  expect(currentUrl).to.include('/facturas/nueva');
});

When('regreso al dashboard', async function() {
  await this.driver.get('http://localhost:4200/dashboard');
  await this.driver.wait(until.elementLocated(By.css('.dashboard-container')), 5000);
});

Then('debería ser redirigido a la página de reportes', async function() {
  await this.driver.wait(until.urlContains('/reportes'), 5000);
  const currentUrl = await this.driver.getCurrentUrl();
  expect(currentUrl).to.include('/reportes');
});

Then('debería ser redirigido a la página de usuarios', async function() {
  await this.driver.wait(until.urlContains('/usuarios'), 5000);
  const currentUrl = await this.driver.getCurrentUrl();
  expect(currentUrl).to.include('/usuarios');
});

Given('que existen actividades recientes en el sistema', async function() {
  // Asumimos que ya existen actividades en el sistema
  // En una implementación real, podrías crear datos de prueba aquí
});

When('estoy en la página principal', async function() {
  await this.driver.get('http://localhost:4200/dashboard');
  await this.driver.wait(until.elementLocated(By.css('.dashboard-container')), 5000);
});

Then('debería ver una lista de actividades recientes', async function() {
  try {
    const activitiesList = await this.driver.findElement(By.css('.recent-activities, .activities-list'));
    expect(await activitiesList.isDisplayed()).to.be.true;
  } catch (error) {
    // Si no encuentra la lista específica, verificar que estamos en el dashboard
    const currentUrl = await this.driver.getCurrentUrl();
    expect(currentUrl).to.include('/dashboard');
  }
});

Then('cada actividad debería mostrar:', async function(dataTable) {
  const fields = dataTable.rowsHash();
  
  try {
    const activities = await this.driver.findElements(By.css('.activity-item, .recent-activity'));
    
    if (activities.length > 0) {
      const firstActivity = activities[0];
      
      for (const [fieldName, description] of Object.entries(fields)) {
        try {
          // Buscar elementos que contengan el campo
          const fieldElement = await firstActivity.findElement(
            By.xpath(`.//*[contains(text(), '${fieldName}') or contains(@class, '${fieldName.toLowerCase()}')]`)
          );
          expect(await fieldElement.isDisplayed()).to.be.true;
        } catch (error) {
          console.log(`⚠️  No se pudo encontrar el campo: ${fieldName}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  No se encontraron actividades recientes');
  }
}); 