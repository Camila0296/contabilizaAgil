// E2E: crear un tercero cliente, emitir una factura de cartera y registrar un abono
const { CONFIG, By, runTest, login, goToSection, clickButton, fillByName, chooseReactSelect, waitForText, waitVisible, log } = require('./helpers');

async function setDate(driver, name, value) {
  await driver.executeScript(
    "const i=document.querySelector(`[name=${arguments[0]}]`); const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; s.call(i, arguments[1]); i.dispatchEvent(new Event('input',{bubbles:true}));",
    name, value
  );
}

async function runTercerosCarteraTest() {
  await runTest('Terceros y Cartera', async (driver) => {
    await login(driver, CONFIG.admin.email, CONFIG.admin.password);

    const razonSocial = `Cliente E2E ${Date.now()}`;
    log(`👥 Creando tercero ${razonSocial}`);
    await goToSection(driver, 'Terceros');
    await clickButton(driver, 'Nuevo Tercero');
    await fillByName(driver, 'tipo', 'ambos');
    await fillByName(driver, 'razonSocial', razonSocial);
    await fillByName(driver, 'numeroDocumento', `9${Date.now()}`.slice(0, 10));
    await clickButton(driver, 'Crear');
    await waitForText(driver, razonSocial);

    log('🧾 Creando factura de cartera para el tercero (tipo "ambos" debe aparecer como cliente)');
    await goToSection(driver, 'Cartera');
    await clickButton(driver, 'Nueva Factura');
    await setDate(driver, 'fecha', new Date().toISOString().slice(0, 10));
    await chooseReactSelect(driver, 'Seleccione cliente...', razonSocial);
    await fillByName(driver, 'monto', '500000');
    await chooseReactSelect(driver, 'Seleccione cuenta...', '5110');
    await fillByName(driver, 'detalle', 'Venta E2E');
    await clickButton(driver, 'Crear Factura');

    const fila = await waitVisible(driver, By.xpath(`//tr[.//*[contains(normalize-space(.), "${razonSocial}")]]`));
    log('💵 Registrando abono parcial');
    await fila.findElement(By.css('button[aria-label="Registrar pago"]')).click();
    const monto = await waitVisible(driver, By.css('input[placeholder="0.00"][max]'));
    await monto.clear();
    await monto.sendKeys('200000');
    await clickButton(driver, 'Registrar Pago');
    await waitForText(driver, 'Pago registrado correctamente');
  });
}

if (require.main === module) {
  runTercerosCarteraTest().catch(() => process.exit(1));
}

module.exports = { runTercerosCarteraTest };
