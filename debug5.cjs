const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:4173/MindFlow/');
  await page.waitForTimeout(2000);

  // Set auth state so we don't get redirected
  await page.evaluate(() => {
    localStorage.setItem('mindflow_intro_seen', 'true');
    localStorage.setItem('mindflow_onboarding_seen', 'true');
    // Mock user session might be needed, but let's try without
  });

  await page.goto('http://localhost:4173/MindFlow/#/saved');
  await page.waitForTimeout(2000);

  // Create a mock quiz in the db
  try {
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

        // Assume db is available globally or we can use indexeddb directly
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

        console.log("Mock quiz added to IndexedDB");

        window.dispatchEvent(new Event('mindflow-sync-complete'));
        console.log("Dispatched sync complete event");
      });

      await page.waitForTimeout(2000);

      // Capture html text to see if the quiz was rendered
      const html = await page.content();
      if (html.includes('Debug Quiz')) {
          console.log('SUCCESS: Debug Quiz rendered on page.');
      } else if (html.includes('No Created Quizzes')) {
          console.log('FAILURE: Empty state rendered instead of quiz.');
      } else {
          console.log('FAILURE: Something else rendered.');
      }
  } catch (e) {
      console.log("Evaluation error:", e);
  }

  await browser.close();
})();
