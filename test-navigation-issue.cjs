const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
      // Don't log the tailwind warning
      if (!msg.text().includes('tailwindcss')) {
          console.log('BROWSER CONSOLE:', msg.text());
      }
  });

  await page.goto('http://localhost:4173/MindFlow/');
  await page.waitForTimeout(500);

  // Set auth state so we don't get redirected back to root
  await page.evaluate(() => {
    localStorage.setItem('mindflow_intro_seen', 'true');
    localStorage.setItem('mindflow_onboarding_seen', 'true');
    // Set some mock auth state for supabase to prevent redirects
    localStorage.setItem('sb-xkqwdfzntfofgksdjgqg-auth-token', JSON.stringify({
        access_token: 'dummy',
        user: { id: 'test-user', email: 'test@example.com' }
    }));
  });

  await page.goto('http://localhost:4173/MindFlow/#/saved');
  await page.waitForTimeout(1000);

  // Check URL
  console.log("Current URL:", page.url());

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
      console.log("Navigation interrupted evaluate.");
  }

  await page.waitForTimeout(1500);
  console.log("Final URL:", page.url());

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
