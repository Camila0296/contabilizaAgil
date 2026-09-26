// E2E: el menú y las acciones visibles dependen del rol (usuarios creados vía API)
const { runTest, login, createUserWithRole, byText, waitVisible, goToSection, waitForText, log } = require('./helpers');

const MENU = ['Panel de Control', 'Facturación', 'Cartera', 'Reportes', 'Terceros', 'PUC', 'Mi Perfil', 'Usuarios', 'Aprobaciones'];
const ESPERADO = {
  contador: MENU.filter(m => !['Usuarios', 'Aprobaciones'].includes(m)),
  auxiliar: MENU.filter(m => !['Panel de Control', 'Usuarios', 'Aprobaciones'].includes(m)),
};

async function visibleMenu(driver) {
  const visibles = [];
  for (const label of MENU) {
    const found = await driver.findElements(byText(label, 'span'));
    if (found.length && await found[0].isDisplayed()) visibles.push(label);
  }
  return visibles;
}

async function runRolesTest() {
  for (const role of Object.keys(ESPERADO)) {
    await runTest(`Roles (${role})`, async (driver) => {
      const { email, password } = await createUserWithRole(role);
      log(`👤 Usuario ${role} creado: ${email}`);
      await login(driver, email, password);
      await waitVisible(driver, byText('Mi Perfil', 'span'));

      const menu = await visibleMenu(driver);
      if (JSON.stringify(menu) !== JSON.stringify(ESPERADO[role])) {
        throw new Error(`Menú de ${role}: ${menu.join(', ')} (esperado: ${ESPERADO[role].join(', ')})`);
      }

      // El PUC solo lo administran admin/contador
      await goToSection(driver, 'PUC');
      await waitForText(driver, 'Plan Único de Cuentas');
      const nuevaCuenta = await driver.findElements(byText('Nueva Cuenta', 'span'));
      if ((nuevaCuenta.length > 0) !== (role === 'contador')) {
        throw new Error(`Botón "Nueva Cuenta" visible=${nuevaCuenta.length > 0} para ${role}`);
      }
    });
  }
}

if (require.main === module) {
  runRolesTest().catch(() => process.exit(1));
}

module.exports = { runRolesTest };
