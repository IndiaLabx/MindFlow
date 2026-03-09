
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Image as ImageIcon, FileText, Presentation, ArrowLeft } from 'lucide-react';

const ToolsHome: React.FC = () => {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'flashcard-maker',
            title: 'Flashcard Image Maker',
            description: 'Create beautiful vintage-style flashcards for idioms and OWS.',
            icon: <ImageIcon className="w-6 h-6 text-indigo-600" />,
            color: 'bg-indigo-50',
            borderColor: 'hover:border-indigo-300',
            action: () => navigate('/tools/flashcard-maker'),
            disabled: false
        },
        {
            id: 'pdf-generator',
            title: 'Bilingual PDF Generator',
            description: 'Create flawless bilingual quiz PDFs from your JSON questions.',
            icon: <FileText className="w-6 h-6 text-purple-600" />,
            color: 'bg-purple-50',
            borderColor: 'hover:border-purple-300',
            action: () => navigate('/tools/bilingual-pdf-maker'),
            disabled: false
        },
        {
            id: 'ppt-generator',
            title: 'GK PDF/PPT Generator',
            description: 'Create customized PDF worksheets and PPT slides for GK Questions.',
            icon: <Presentation className="w-6 h-6 text-gray-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />,
            color: 'bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800/50',
            borderColor: 'hover:border-gray-300',
            action: () => navigate('/tools/quiz-pdf-ppt-generator'),
            disabled: false
        }
    ];

    return (
        <div className="flex flex-col min-h-full bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800/50">
             {/* Header */}
             <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 dark:border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-amber-500" />
                        Tools & Utilities
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm font-medium">Helper tools to enhance your content creation.</p>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={!tool.disabled ? tool.action : undefined}
                            className={`
                                bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 dark:border-slate-800 shadow-sm transition-all duration-200
                                ${tool.disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-md hover:scale-[1.01] ' + tool.borderColor}
                            `}
                        >
                            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                                {tool.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 dark:text-slate-100 mb-2">{tool.title}</h3>
                            <p className="text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm leading-relaxed mb-4">
                                {tool.description}
                            </p>
                            {tool.disabled && (
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                    Coming Soon
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolsHome;
