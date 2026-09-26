// Utilidades compartidas por las pruebas E2E (Selenium)
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const CONFIG = {
  baseUrl: process.env.E2E_BASE_URL || 'http://localhost:4200',
  apiUrl: process.env.E2E_API_URL || 'http://localhost:3000/api',
  headless: process.env.HEADLESS === 'true' || process.env.CI === 'true' || process.argv.includes('--headless'),
  timeout: 15000,
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin123'
  }
};

function log(message) {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${message}`);
}

async function buildDriver() {
  const options = new chrome.Options();
  if (CONFIG.headless) options.addArguments('--headless=new');
  options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: CONFIG.timeout * 3, script: CONFIG.timeout });
  return driver;
}

// Texto literal para XPath (admite comillas simples y dobles)
function xpathLiteral(text) {
  if (!text.includes("'")) return `'${text}'`;
  if (!text.includes('"')) return `"${text}"`;
  return `concat('${text.split("'").join(`', "'", '`)}')`;
}

async function waitVisible(driver, locator, timeout = CONFIG.timeout) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

const byText = (text, tag = '*') => By.xpath(`//${tag}[normalize-space(.)=${xpathLiteral(text)}]`);
const byTextContains = (text, tag = '*') => By.xpath(`//${tag}[contains(normalize-space(.), ${xpathLiteral(text)})]`);

async function waitForText(driver, text, timeout = CONFIG.timeout) {
  return waitVisible(driver, byTextContains(text), timeout);
}

async function clickButton(driver, text) {
  const btn = await waitVisible(driver, By.xpath(`//button[normalize-space(.)=${xpathLiteral(text)} or @aria-label=${xpathLiteral(text)} or @title=${xpathLiteral(text)}]`));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"})', btn);
  await btn.click();
  return btn;
}

async function fillByName(driver, name, value) {
  const el = await waitVisible(driver, By.css(`[name="${name}"]`));
  const tag = await el.getTagName();
  if (tag === 'select') {
    await el.findElement(By.css(`option[value="${value}"]`)).click();
  } else {
    await el.clear();
    await el.sendKeys(String(value));
  }
}

// react-select: escribe en el input asociado al placeholder y elige la primera coincidencia
async function chooseReactSelect(driver, placeholder, text) {
  const container = await waitVisible(driver, By.xpath(`//div[contains(@class,'react-select__control')][.//*[normalize-space(.)=${xpathLiteral(placeholder)}]]`));
  const input = await container.findElement(By.css('input'));
  await input.sendKeys(text);
  await waitVisible(driver, By.css('.react-select__option'));
  await input.sendKeys(Key.ENTER);
}

async function goToSection(driver, label) {
  const item = await waitVisible(driver, By.xpath(`//span[normalize-space(.)=${xpathLiteral(label)}]`));
  await item.click();
}

async function login(driver, email, password) {
  await driver.get(CONFIG.baseUrl);
  await driver.executeScript('window.localStorage.clear()');
  await driver.navigate().refresh();
  const emailInput = await waitVisible(driver, By.id('email'));
  await emailInput.sendKeys(email);
  await (await waitVisible(driver, By.id('password'))).sendKeys(password);
  await clickButton(driver, 'Iniciar sesión');
  await waitVisible(driver, byText('Cerrar sesión', 'button'));
}

async function screenshot(driver, name) {
  try {
    const fs = require('fs');
    fs.writeFileSync(`${name}.png`, await driver.takeScreenshot(), 'base64');
    log(`   • Captura guardada: ${name}.png`);
  } catch (e) {
    log(`   • No se pudo guardar la captura: ${e.message}`);
  }
}

// ---- Preparación de datos vía API (no depende del SMTP) ----

async function api(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(`${CONFIG.apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.error || JSON.stringify(data)}`);
  return data;
}

async function adminToken() {
  const { token } = await api('/auth/login', { method: 'POST', body: CONFIG.admin });
  return token;
}

let seq = 0;
// Registra un usuario, lo aprueba y le asigna el rol indicado. Devuelve { email, password }
async function createUserWithRole(roleName) {
  const token = await adminToken();
  const n = `${Date.now()}${seq++}`;
  const user = {
    nombres: 'E2E', apellidos: roleName.charAt(0).toUpperCase() + roleName.slice(1),
    email: `e2e-${roleName}-${n}@example.com`, password: 'E2e#Clave2026',
    telefono: '3001234567', tipoDocumento: 'CC', numeroDocumento: n.slice(-10),
    direccion: 'Calle 1 # 2-3', ciudad: 'Bogotá'
  };
  const { user: created } = await api('/auth/register', { method: 'POST', body: user });
  await api(`/aprobaciones/${created._id}/aprobar`, { token, method: 'PUT' });
  const roles = await api('/roles', { token });
  const role = roles.find(r => r.name === roleName);
  await api(`/users/${created._id}`, { token, method: 'PUT', body: { role: role._id } });
  return { email: user.email, password: user.password };
}

// Ejecuta una prueba con su propio navegador, captura si falla y siempre lo cierra
async function runTest(name, fn) {
  log(`🚀 INICIO: ${name}`);
  const driver = await buildDriver();
  try {
    await fn(driver);
    log(`✅ ${name}: OK`);
  } catch (error) {
    log(`❌ ${name}: ${error.message}`);
    await screenshot(driver, `error-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    throw error;
  } finally {
    await driver.quit();
  }
}

module.exports = {
  CONFIG, log, buildDriver, waitVisible, waitForText, byText, byTextContains, clickButton, fillByName,
  chooseReactSelect, goToSection, login, screenshot, api, adminToken, createUserWithRole, runTest, By, until
};
