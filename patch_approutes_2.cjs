const fs = require('fs');

const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace idioms
code = code.replace(
  /startFlashcards\(data as any, filters\);/,
  `flashcardStore.startIdioms(data as any, filters);`
);

// Synonyms
code = code.replace(
  /startSynonymFlashcards\(data, filters\);/,
  `flashcardStore.startSynonyms(data, filters);`
);

// OWS
code = code.replace(
  /startOWSFlashcards\(data, filters\);/,
  `flashcardStore.startOWS(data, filters);`
);

// Find exact block for SynonymFlashcardSession
const synBlock = `<SynonymFlashcardSession
                        data={state.activeSynonyms || []}
                        currentIndex={state.currentQuestionIndex}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onExit={() => navTo('/synonyms/config')}
                        onFinish={() => navTo('/flashcards/summary')}
                        filters={state.filters || {} as any}
                        onJump={jumpToQuestion}
                    />`;

const newSynBlock = `<SynonymFlashcardSession
                        data={flashcardStore.synonyms}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/synonyms/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}
                    />`;

code = code.replace(synBlock, newSynBlock);

const idiomsBlock = `<FlashcardSession
                        data={state.activeIdioms || []}
                        currentIndex={state.currentQuestionIndex}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onExit={() => navTo('/idioms/config')}
                        onFinish={() => navTo('/flashcards/summary')}
                        filters={state.filters || {} as any}
                        onJump={jumpToQuestion}
                    />`;

const newIdiomsBlock = `<FlashcardSession
                        data={flashcardStore.idioms}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/idioms/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}
                    />`;

code = code.replace(idiomsBlock, newIdiomsBlock);

const owsBlock = `<OWSSession
                        data={state.activeOWS || []}
                        currentIndex={state.currentQuestionIndex}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onExit={() => navTo('/ows/config')}
                        onFinish={() => navTo('/flashcards/summary')}
                        filters={state.filters || {} as any}
                        onJump={jumpToQuestion}
                    />`;

const newOwsBlock = `<OWSSession
                        data={flashcardStore.ows}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/ows/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}
                    />`;

code = code.replace(owsBlock, newOwsBlock);

fs.writeFileSync(file, code);
