const fs = require('fs');

const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

const summaryBlock = `<Route path="/flashcards/summary" element={
                        <FlashcardSummary
                            totalCards={state.activeOWS?.length || state.activeIdioms?.length || 0}
                            filters={state.filters || {} as any}
                            onRestart={() => { restartQuiz(); navTo(state.activeOWS ? '/ows/config' : '/idioms/config'); }}
                            onHome={navHome}
                        />
                    } />`;

const newSummaryBlock = `<Route path="/flashcards/summary" element={
                        <FlashcardSummary
                            totalCards={flashcardStore.idioms.length || flashcardStore.ows.length || flashcardStore.synonyms.length || 0}
                            filters={flashcardStore.filters || {} as any}
                            onRestart={() => {
                                flashcardStore.resetSession();
                                const dest = flashcardStore.type === 'ows' ? '/ows/config' : flashcardStore.type === 'synonyms' ? '/synonyms/config' : '/idioms/config';
                                navTo(dest);
                            }}
                            onHome={navHome}
                        />
                    } />`;

code = code.replace(summaryBlock, newSummaryBlock);

fs.writeFileSync(file, code);
