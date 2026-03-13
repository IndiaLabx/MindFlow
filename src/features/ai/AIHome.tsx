import React, { useState } from 'react';
import { KINGS_DATA } from './data';
import { SamvadChat } from './components/SamvadChat';
import { Brain, Sparkles, MessageSquare } from 'lucide-react';

export const AIHome: React.FC = () => {
    const [selectedFigure, setSelectedFigure] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center p-6 animate-fade-in w-full max-w-4xl mx-auto pb-32">

            {/* Header */}
            <div className="text-center mb-10 mt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
                    <Brain className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Historical AI Chat</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                    Have live voice conversations with historical figures powered by AI. Experience history through immersive dialogue.
                </p>
            </div>

            {/* Figures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {Object.values(KINGS_DATA).map((figure) => (
                    <button
                        key={figure.id}
                        onClick={() => setSelectedFigure(figure.id)}
                        className="group flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                        <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 relative z-10 shadow-sm">
                            <MessageSquare className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {figure.summary.title}
                        </h3>
                        <p className="text-sm font-medium text-indigo-600/80 dark:text-indigo-400/80 mb-4 relative z-10 uppercase tracking-wide">
                            {figure.summary.reign}
                        </p>

                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 relative z-10 leading-relaxed">
                            {figure.content}
                        </p>

                        <div className="mt-6 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold relative z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            Start Conversation
                            <Sparkles className="w-4 h-4 ml-2" />
                        </div>
                    </button>
                ))}
            </div>

            {/* AI Modal */}
            <SamvadChat
                isOpen={selectedFigure !== null}
                onClose={() => setSelectedFigure(null)}
                figureId={selectedFigure}
            />

        </div>
    );
};
