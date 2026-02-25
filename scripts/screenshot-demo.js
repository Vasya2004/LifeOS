const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Сначала заходим на demo-login для установки данных
  await page.goto('http://localhost:3000/auth/demo-login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Теперь делаем скриншоты страниц
  const pages = [
    { url: 'http://localhost:3000/', name: 'dashboard-demo' },
    { url: 'http://localhost:3000/areas', name: 'areas-demo' },
    { url: 'http://localhost:3000/goals', name: 'goals-demo' },
    { url: 'http://localhost:3000/tasks', name: 'tasks-demo' },
    { url: 'http://localhost:3000/habits', name: 'habits-demo' },
    { url: 'http://localhost:3000/skills', name: 'skills-demo' },
    { url: 'http://localhost:3000/finance', name: 'finance-demo' },
    { url: 'http://localhost:3000/settings', name: 'settings-demo' },
  ];

  for (const { url, name } of pages) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `preview/${name}.png`, fullPage: false });
      console.log(`Screenshot: ${name}.png`);
    } catch (e) {
      console.log(`${name} error:`, e.message);
    }
  }

  await browser.close();
  console.log('\n✅ Демо-скриншоты сохранены в /preview/');
})();
