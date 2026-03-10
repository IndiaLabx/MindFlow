import React from 'react';
export const SynonymsConfig: React.FC<any> = ({ onBack, onStart }) => {
    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-4 text-blue-500">Back</button>
            <h1 className="text-2xl font-bold mb-4">Synonyms & Antonyms Config</h1>
            <button onClick={() => onStart([], {})} className="bg-blue-600 text-white px-4 py-2 rounded">Start</button>
        </div>
    );
};
