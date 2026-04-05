const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:4173/MindFlow/#/saved');

  await page.waitForTimeout(1000);

  // Create a mock quiz in the db
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

  await browser.close();
})();
