// E2E: inicio de sesión (válido e inválido) y cierre de sesión
const { CONFIG, By, runTest, login, clickButton, waitVisible, waitForText, byText, log } = require('./helpers');

async function runLoginTest() {
  await runTest('Login', async (driver) => {
    log('🔑 Credenciales inválidas muestran error y no inician sesión');
    await driver.get(CONFIG.baseUrl);
    await driver.executeScript('window.localStorage.clear()');
    await driver.navigate().refresh();
    await (await waitVisible(driver, By.id('email'))).sendKeys(CONFIG.admin.email);
    await (await waitVisible(driver, By.id('password'))).sendKeys('ClaveIncorrecta#1');
    await clickButton(driver, 'Iniciar sesión');
    await waitForText(driver, 'Credenciales inválidas');
    const token = await driver.executeScript('return window.localStorage.getItem("token")');
    if (token) throw new Error('Se guardó un token con credenciales inválidas');

    log('🔑 Credenciales válidas del administrador');
    await login(driver, CONFIG.admin.email, CONFIG.admin.password);
    await waitForText(driver, 'Panel de Control');
    await waitVisible(driver, byText('Usuarios', 'span'));

    log('🚪 Cerrar sesión vuelve a la pantalla de login');
    await clickButton(driver, 'Cerrar sesión');
    await waitVisible(driver, By.id('email'));
    const tokenAfter = await driver.executeScript('return window.localStorage.getItem("token")');
    if (tokenAfter) throw new Error('El token sigue guardado después de cerrar sesión');
  });
}

if (require.main === module) {
  runLoginTest().catch(() => process.exit(1));
}

module.exports = { runLoginTest };
