const { chromium } = require('playwright');
const fs = require('fs');

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

  // Intercept and log
  await page.goto('http://localhost:4173/MindFlow/#/saved');

  await page.evaluate(() => {
    // Override db.getQuizzes
    window.__mockData = false;
    const origGet = window.indexedDB.open.bind(window.indexedDB);
    // actually, let's just use DOM mutation observer to see what gets rendered
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.addedNodes.length > 0) {
                // console.log("Added nodes", m.addedNodes);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  await page.waitForTimeout(1000);

  // Now trigger sync
  await page.evaluate(async () => {
        const quiz = {
          id: 'debug-id-123',
          name: 'Debug Quiz',
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

  await page.waitForTimeout(2000);

  const html = await page.content();
  if (html.includes('Debug Quiz')) {
      console.log('SUCCESS: Debug Quiz rendered on page.');
  } else if (html.includes('No Created Quizzes')) {
      console.log('FAILURE: Empty state rendered instead of quiz.');
  } else {
      console.log('FAILURE: Something else rendered.');
  }

  await browser.close();
})();
