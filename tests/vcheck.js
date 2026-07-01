const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

(async () => {
  const opts = new chrome.Options();
  opts.addArguments('--headless=new', '--no-sandbox', '--window-size=1280,900');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();

  try {
    // ── AUTH PAGE ───────────────────────────────────────────
    await driver.get('http://localhost:4200');
    await driver.sleep(2500);

    const authShot = await driver.takeScreenshot();
    fs.mkdirSync('screenshots/visual-checks', { recursive: true });
    fs.writeFileSync('screenshots/visual-checks/revision-01-pagina-auth.png', Buffer.from(authShot, 'base64'));
    console.log('[1] Auth page screenshot saved');

    // Button size check
    const btn = await driver.findElement(By.css('button[type="submit"]'));
    const btnH = await btn.getCssValue('height');
    const btnFS = await btn.getCssValue('font-size');
    const btnBg = await btn.getCssValue('background-image');
    console.log('[1] Submit btn — height:', btnH, '| font-size:', btnFS);
    console.log('[1] Btn background-image (gradient?):', btnBg.substring(0, 60));

    // Input size
    const inp = await driver.findElement(By.css('input[type="email"]'));
    const inpH = await inp.getCssValue('height');
    console.log('[1] Email input height:', inpH);

    // Body background
    const bodyBg = await driver.findElement(By.css('body'));
    console.log('[1] Body bg:', await bodyBg.getCssValue('background-color'));
    console.log('[1] Body font-size:', await bodyBg.getCssValue('font-size'));

    // ── LOGIN ───────────────────────────────────────────────
    await inp.sendKeys('admin@admin.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('admin');
    await btn.click();

    // Wait for dashboard
    await driver.wait(until.elementLocated(By.css('[class*="sidebar"]')), 12000);
    await driver.sleep(2500);

    const dashShot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/visual-checks/revision-02-dashboard.png', Buffer.from(dashShot, 'base64'));
    console.log('[2] Dashboard screenshot saved');

    // ── SIDEBAR ─────────────────────────────────────────────
    const sidebarEl = await driver.findElement(By.css('[class*="sidebar"]'));
    const sbBg = await sidebarEl.getCssValue('background-color');
    console.log('[2] Sidebar bg:', sbBg);

    // Active nav item (Panel de Control)
    const navBtns = await driver.findElements(By.css('[class*="sidebar"] nav button'));
    console.log('[2] Nav buttons found:', navBtns.length);
    if (navBtns.length > 0) {
      const activeBg = await navBtns[0].getCssValue('background-color');
      const activeColor = await navBtns[0].getCssValue('color');
      console.log('[2] Active nav — bg:', activeBg, '| color:', activeColor);
    }

    // ── STAT CARDS ──────────────────────────────────────────
    const icons = await driver.findElements(By.css('[class*="stat-icon"]'));
    console.log('[2] Stat icon elements:', icons.length);
    for (let i = 0; i < Math.min(icons.length, 4); i++) {
      const c = await icons[i].getCssValue('color');
      const bg = await icons[i].getCssValue('background-color');
      console.log('  Icon', i, '— color:', c, 'bg:', bg);
    }

    // ── TYPOGRAPHY ──────────────────────────────────────────
    const h1Els = await driver.findElements(By.css('h1'));
    if (h1Els.length > 0) {
      const h1fs = await h1Els[0].getCssValue('font-size');
      const h1col = await h1Els[0].getCssValue('color');
      console.log('[2] H1 — size:', h1fs, '| color:', h1col);
    }

    // Logo SVG
    const logos = await driver.findElements(By.css('svg[aria-label="Contabiliza Ágil"]'));
    console.log('[2] Logo SVGs in DOM:', logos.length);

    // ── PROBE: Mobile nav ────────────────────────────────────
    await driver.manage().window().setRect({ width: 390, height: 844 });
    await driver.sleep(1000);
    const mobileShot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/visual-checks/revision-03-mobile-responsive.png', Buffer.from(mobileShot, 'base64'));
    console.log('[3] Mobile (390px) screenshot saved');

    const hamburger = await driver.findElements(By.css('button[aria-expanded]'));
    console.log('[3] Hamburger button found:', hamburger.length > 0);

  } finally {
    await driver.quit();
  }
})().catch(e => console.error('FATAL:', e.message));
