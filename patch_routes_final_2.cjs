const fs = require('fs');
const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldBlock = `<Route path="/flashcards/session" element={
                    <FlashcardSession
                        idioms={state.activeIdioms || []}
                        currentIndex={state.currentQuestionIndex}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onExit={navHome}
                        onFinish={() => { finishFlashcards(); navTo('/flashcards/summary'); }}
                        filters={state.filters || {} as any}
                    />
                } />`;

const newBlock = `<Route path="/flashcards/session" element={
                    <FlashcardSession
                        idioms={flashcardStore.idioms}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={navHome}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                    />
                } />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync(file, code);
