// E2E: crear una factura con cálculo de impuestos y verla en la lista
const { CONFIG, runTest, login, goToSection, clickButton, fillByName, chooseReactSelect, waitForText, log } = require('./helpers');

async function runFacturasTest() {
  await runTest('Facturas', async (driver) => {
    await login(driver, CONFIG.admin.email, CONFIG.admin.password);
    await goToSection(driver, 'Facturación');
    await clickButton(driver, 'Nueva Factura');

    const numero = `E2E-${Date.now()}`;
    log(`🧾 Creando factura ${numero}`);
    await fillByName(driver, 'numero', numero);
    await driver.executeScript(
      "const i=document.querySelector('[name=fecha]'); const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; s.call(i, arguments[0]); i.dispatchEvent(new Event('input',{bubbles:true}));",
      new Date().toISOString().slice(0, 10)
    );
    await fillByName(driver, 'proveedor', 'Proveedor E2E SAS');
    await fillByName(driver, 'monto', '1000000');
    await fillByName(driver, 'detalle', 'Servicio de consultoría E2E');
    await chooseReactSelect(driver, 'Seleccione cuenta...', '5110');

    // IVA 19% calculado en vivo
    await waitForText(driver, '190.000,00');
    await clickButton(driver, 'Crear Factura');

    await waitForText(driver, numero);
    log('✅ La factura aparece en la lista');
  });
}

if (require.main === module) {
  runFacturasTest().catch(() => process.exit(1));
}

module.exports = { runFacturasTest };
