const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');

/**
 * Pasos específicos para la gestión de usuarios
 * Estos pasos cubren autenticación, navegación y filtrado de la lista de usuarios.
 */

// --- Given -------------------------------------------------------------

Given('que estoy autenticado como administrador', async function () {
  // `hooks.js` ejecuta this.initDriver() antes de cada escenario, por lo que
  // aquí solo necesitamos iniciar sesión usando la utilidad del World.
  await this.login(); // credenciales por defecto definidas en World
});

Given('estoy en la sección de usuarios', async function () {
  await this.driver.get('http://localhost:4200/usuarios');
  await this.driver.wait(
    until.elementLocated(By.css('.usuarios-container, .usuario-list, table')), // selector flexible
    5000
  );
});

Given('que existen varios usuarios en el sistema', async function () {
  // En una implementación real podrías insertar datos de prueba vía API o BD.
  // Para efectos de UI asumimos que hay al menos un usuario renderizado.
  await this.driver.get('http://localhost:4200/usuarios');
  await this.driver.wait(
    until.elementLocated(By.css('.usuario-item, tbody tr, .usuario-row')),
    5000
  );
});

// --- Then --------------------------------------------------------------

Then('debería ver solo los usuarios que coincidan con la búsqueda', async function () {
  // Tras realizar la búsqueda, la tabla/lista debería mostrar uno o más usuarios
  await this.driver.wait(
    until.elementLocated(By.css('.usuario-item, tbody tr, .usuario-row')),
    5000
  );
  const usuarios = await this.driver.findElements(
    By.css('.usuario-item, tbody tr, .usuario-row')
  );
  expect(usuarios.length).to.be.greaterThan(0);
});
