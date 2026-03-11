const fs = require('fs');
const file = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
let content = fs.readFileSync(file, 'utf8');

const synonymsSearch = `<h3 className="font-bold text-xl mb-4 bg-white/10 inline-block px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">Synonyms</h3>
                                        <div className="flex flex-col gap-2">
                                            {currentWordObj.synonyms!.map((syn, idx) => (
                                                <ExpandableListItem key={idx} item={syn} isHindi={true} accentColor="emerald" />
                                            ))}
                                        </div>`;

const synonymsReplace = `<div className="flex items-center gap-3 mb-4">
                                            <h3 className="font-bold text-xl bg-white/10 inline-block px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 m-0">Synonyms</h3>
                                            <button
                                                onClick={() => setAllSynonymsExpanded(!allSynonymsExpanded)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                                                title={allSynonymsExpanded ? "Collapse all" : "Expand all"}
                                            >
                                                <span className={\`transition-transform duration-300 \${allSynonymsExpanded ? 'rotate-90' : ''}\`}>
                                                    ▶
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {currentWordObj.synonyms!.map((syn, idx) => (
                                                <ExpandableListItem key={idx} item={syn} isHindi={true} accentColor="emerald" forceExpanded={allSynonymsExpanded} />
                                            ))}
                                        </div>`;

const antonymsSearch = `<h3 className="font-bold text-xl mb-4 bg-white/10 inline-block px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">Antonyms</h3>
                                        <div className="flex flex-col gap-2">
                                            {currentWordObj.antonyms!.map((ant, idx) => (
                                                <ExpandableListItem key={idx} item={ant} isHindi={true} accentColor="pink" />
                                            ))}
                                        </div>`;

const antonymsReplace = `<div className="flex items-center gap-3 mb-4">
                                            <h3 className="font-bold text-xl bg-white/10 inline-block px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 m-0">Antonyms</h3>
                                            <button
                                                onClick={() => setAllAntonymsExpanded(!allAntonymsExpanded)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                                                title={allAntonymsExpanded ? "Collapse all" : "Expand all"}
                                            >
                                                <span className={\`transition-transform duration-300 \${allAntonymsExpanded ? 'rotate-90' : ''}\`}>
                                                    ▶
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {currentWordObj.antonyms!.map((ant, idx) => (
                                                <ExpandableListItem key={idx} item={ant} isHindi={true} accentColor="pink" forceExpanded={allAntonymsExpanded} />
                                            ))}
                                        </div>`;


content = content.replace(synonymsSearch, synonymsReplace);
content = content.replace(antonymsSearch, antonymsReplace);

fs.writeFileSync(file, content);
