import React from 'react';
export const SynonymFlashcardSession: React.FC<any> = ({ onExit }) => {
    return (
        <div className="p-4 h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <h1 className="text-2xl font-bold mb-4">Synonym Flashcards</h1>
            <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>
        </div>
    );
};
