import React, { useState, useEffect } from 'react';
import { SynonymWord } from '../quiz/types';
import rawSynonymsData from '../quiz/data/processed_synonyms.json';

interface SynonymsConfigProps {
    onBack: () => void;
    onStart: (data: SynonymWord[], filters: any) => void;
}

export const SynonymsConfig: React.FC<SynonymsConfigProps> = ({ onBack, onStart }) => {
    const [data, setData] = useState<SynonymWord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load and sort data
        const load = async () => {
            try {
                // In a real scenario, this might be a fetch or complex parse
                const parsed = rawSynonymsData as unknown as SynonymWord[];

                // Sort by importance_score descending (Heatmap Hot first)
                parsed.sort((a, b) => b.importance_score - a.importance_score);

                setData(parsed);
            } catch(e) {
                console.error("Failed to load synonyms data", e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleStartLearning = () => {
        onStart(data, { mode: 'learning' });
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Vocabulary Engine...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Synonyms Master
                </h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">

                {/* Stats / Welcome Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 mb-8">
                    <h2 className="text-2xl font-bold mb-2">The Intelligent Engine</h2>
                    <p className="text-blue-100 opacity-90 mb-4 text-sm leading-relaxed">
                        Master {data.length}+ words using our Semantic Clustering engine. Learn one word, and we'll automatically track its entire family to save you time.
                    </p>
                    <div className="flex gap-4 text-sm font-medium">
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            📚 {data.length} Words
                        </div>
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            🔥 Heatmap Sorted
                        </div>
                    </div>
                </div>

                                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Phase 1: Foundation</h3>
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {/* Phase 1: Guided Learning */}
                    <button
                        onClick={() => window.location.hash = '#/synonyms/phase1'}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                            📖
                        </div>
                        <h4 className="text-lg font-bold mb-1">Guided Word Exploration</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Discover words with deep meanings, Hindi translations, and audio pronunciation. Perfect for building a strong foundation.</p>
                    </button>
                </div>

                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Phase 2: Learn & Master</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                    {/* Mode 1: Swipe Flashcards */}
                    <button
                        onClick={handleStartLearning}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                            🃏
                        </div>
                        <h4 className="text-lg font-bold mb-1">Smart Flashcards</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Swipe through High-Frequency words first. Tap to reveal meanings and Mark as Mastered.</p>
                    </button>

                    {/* Mode 2: Cluster List */}
                    <button
                        onClick={() => window.location.hash = '#/synonyms/list'}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <h4 className="text-lg font-bold mb-1">Word Families (List)</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View words grouped by meaning. See which words are hot (🔥) and review your Mastery spectrum.</p>
                    </button>
                </div>

                {/* Phase 3 Placeholder */}
                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200 mt-8">Phase 3: Gamified Practice</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Game 1 */}
                    <button
                        onClick={() => window.location.hash = '#/synonyms/quiz'}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all group opacity-80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🕵️‍♂️
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-md">Coming Soon</span>
                        </div>
                        <h4 className="text-lg font-bold mb-1">The Imposter Trap</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Spot the Antonym hiding among Synonyms before the 10-second timer runs out.</p>
                    </button>

                    {/* Game 2 */}
                    <button
                        onClick={() => window.location.hash = '#/synonyms/quiz'}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all group opacity-80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🔗
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 rounded-md">Coming Soon</span>
                        </div>
                        <h4 className="text-lg font-bold mb-1">Tap & Connect</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Match the main word with its synonym in a fast-paced dual-column challenge.</p>
                    </button>
                </div>

            </div>
        </div>
    );
};
