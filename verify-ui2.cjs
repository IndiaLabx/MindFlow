const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:4173/MindFlow/');
  await page.waitForTimeout(1000);

  // Set auth state so we don't get redirected
  await page.evaluate(() => {
    localStorage.setItem('mindflow_intro_seen', 'true');
    localStorage.setItem('mindflow_onboarding_seen', 'true');
  });

  await page.goto('http://localhost:4173/MindFlow/#/saved');

  await page.waitForTimeout(1000);

  // Now trigger sync. Handle context destruction by wrapping in try/catch if it navigates.
  try {
      await page.evaluate(async () => {
            window.dispatchEvent(new Event('mindflow-sync-start'));

            const quiz = {
              id: 'debug-id-123',
              name: 'Debug Quiz Sync Test',
              createdAt: Date.now(),
              filters: { subject: 'GK', difficulty: 'Medium' },
              mode: 'learning',
              questions: [],
              state: { status: 'in-progress', currentQuestionIndex: 0, answers: {} }
            };

            const request = indexedDB.open('MindFlowDB', 5);
            await new Promise((resolve) => {
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction('saved_quizzes', 'readwrite');
                    const store = tx.objectStore('saved_quizzes');
                    store.put(quiz);
                    tx.oncomplete = resolve;
                };
            });

            console.log("Mock quiz added to IndexedDB. Dispatching event...");
            window.dispatchEvent(new Event('mindflow-sync-complete'));
      });
  } catch(e) {
      console.log("Navigation interrupted evaluate, ignoring.");
  }

  await page.waitForTimeout(1500);

  const html = await page.content();
  if (html.includes('Debug Quiz Sync Test')) {
      console.log('SUCCESS: Debug Quiz rendered on page automatically after sync.');
  } else if (html.includes('No Created Quizzes')) {
      console.log('FAILURE: Empty state rendered instead of quiz.');
  } else {
      console.log('FAILURE: Something else rendered.');
  }

  await browser.close();
})();
