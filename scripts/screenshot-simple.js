const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Screenshot Login Page
  try {
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'preview/login.png', fullPage: false });
    console.log('Screenshot: login.png');
  } catch (e) {
    console.log('Login page error:', e.message);
  }

  // Screenshot Register Page
  try {
    await page.goto('http://localhost:3000/auth/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'preview/register.png', fullPage: false });
    console.log('Screenshot: register.png');
  } catch (e) {
    console.log('Register page error:', e.message);
  }

  await browser.close();
  console.log('\nScreenshots saved to /preview/');
})();
