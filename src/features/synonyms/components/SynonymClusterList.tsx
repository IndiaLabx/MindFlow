import React from 'react';
export const SynonymClusterList: React.FC<any> = ({ onExit }) => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Synonym Clusters</h1>
            <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>
        </div>
    );
};
