const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Inject some mock data into IndexedDB on load
  await context.addInitScript(() => {
    window.addEventListener('mindflow-sync-complete', () => {
        console.log("SYNC COMPLETE EVENT RECEIVED");
    });

    // Override db methods for debugging
    window.__DEBUG_DB__ = true;
  });

  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://localhost:4173/MindFlow/#/saved');

  await page.waitForTimeout(2000);

  // Trigger sync complete
  await page.evaluate(() => {
    window.dispatchEvent(new Event('mindflow-sync-complete'));
    console.log("Dispatched mindflow-sync-complete");
  });

  await page.waitForTimeout(1000);

  await browser.close();
})();
