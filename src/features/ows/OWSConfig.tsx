import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Target, FileText, Settings, Calendar, Type, CheckCircle } from 'lucide-react';
import { useOWSProgress } from './hooks/useOWSProgress';
import { Button } from '../../components/Button/Button';
import { InitialFilters, QuizMode } from '../quiz/types';
import { OneWord } from '../../types/models';
import { MultiSelectDropdown } from '../quiz/components/ui/MultiSelectDropdown';
import { SegmentedControl } from '../quiz/components/ui/SegmentedControl';
import { ActiveFiltersBar } from '../quiz/components/ui/ActiveFiltersBar';
import { cn } from '../../utils/cn';
import { SynapticLoader } from '../../components/ui/SynapticLoader';
import { getUniqueOwsFilters, getOwsCount, getFilteredOws } from './utils/supabaseOws';

interface OWSConfigProps {
    onStart: (data: OneWord[], filters?: InitialFilters) => void;
    onBack: () => void;
}

const emptyFilters: InitialFilters = {
    subject: [],
    topic: [],
    subTopic: [],
    difficulty: [],
    questionType: [],
    examName: [],
    examYear: [],
    examDateShift: [],
    tags: [],
    readStatus: [],
};

export const OWSConfig: React.FC<OWSConfigProps> = ({ onStart, onBack }) => {
    const [filters, setFilters] = useState<InitialFilters>(emptyFilters);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const { isLoaded: isProgressLoaded, getReadStatus } = useOWSProgress();

    // Metadata from DB
    const [allExamNames, setAllExamNames] = useState<string[]>([]);
    const [allExamYears, setAllExamYears] = useState<string[]>([]);
    const [matchedCount, setMatchedCount] = useState<number>(0);
    const alphabet = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

    useEffect(() => {
        let isMounted = true;
        const loadMetadata = async () => {
            setIsLoading(true);
            try {
                const { allExamNames, allExamYears } = await getUniqueOwsFilters();
                if (isMounted) {
                    setAllExamNames(allExamNames);
                    setAllExamYears(allExamYears);
                }
            } catch (err) {
                console.error("Error loading OWS metadata:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadMetadata();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchCount = async () => {
            const count = await getOwsCount(filters, selectedLetter);
            if (isMounted) {
                setMatchedCount(count);
            }
        };
        fetchCount();
        return () => { isMounted = false; };
    }, [filters, selectedLetter]);


    const handleStart = async () => {
        setIsFetchingData(true);
        try {
            const data = await getFilteredOws(filters, selectedLetter);

            let finalData = data;
            if (filters.readStatus && filters.readStatus.length > 0) {
                finalData = data.filter(item => {
                    const status = getReadStatus(item);
                    const isReadStr = status ? 'read' : 'unread';
                    return filters.readStatus.includes(isReadStr);
                });
            }

            if (finalData.length === 0) {
                alert("No words match the selected filters.");
                setIsFetchingData(false);
                return;
            }
            onStart(finalData, filters);
        } catch (error) {
            console.error("Failed to start session:", error);
            alert("Failed to fetch data for the session.");
            setIsFetchingData(false);
        }
    };

    const handleRemoveFilter = (key: keyof InitialFilters, value?: string) => {
        if (value) {
            setFilters(prev => ({ ...prev, [key]: prev[key].filter(v => v !== value) }));
        } else {
            setFilters(prev => ({ ...prev, [key]: [] }));
        }
    };

    if (!isProgressLoaded || isLoading || isFetchingData) {
        return <SynapticLoader />;
    }

    const counts: Record<string, number> = {};
    const letterCounts: Record<string, number> = {};

    return (
        <div className="flex flex-col min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 transition-colors duration-700 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 z-10 sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md pb-4 pt-2 -mt-2">
                <button
                    onClick={onBack}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Target className="w-7 h-7 text-teal-500" /> Session Config
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Filter One Word Substitutions</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative z-10 animate-fade-in w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alphabetical Filter */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-teal-100 border-l-4 border-l-teal-400 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-4 text-teal-800 font-bold text-sm uppercase tracking-wider">
                            <Type className="w-4 h-4" /> Alphabetical Order
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedLetter(null)}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm",
                                    !selectedLetter
                                        ? "bg-teal-500 text-white border-teal-500 ring-2 ring-teal-200"
                                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                ALL
                            </button>
                            {alphabet.map(letter => {
                                const isSelected = selectedLetter === letter;
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => setSelectedLetter(isSelected ? null : letter)}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border",
                                            isSelected
                                                ? "bg-teal-100 text-teal-900 border-teal-300 ring-1 ring-teal-300"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:text-teal-700"
                                        )}
                                    >
                                        {letter}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Source Name Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-teal-100 border-l-4 border-l-teal-400 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-4 text-teal-800 font-bold text-sm uppercase tracking-wider">
                            <FileText className="w-4 h-4" /> Source Material
                        </div>
                        <MultiSelectDropdown
                            label="Source Name"
                            options={allExamNames}
                            selectedOptions={filters.examName}
                            onSelectionChange={(sel) => setFilters(prev => ({ ...prev, examName: sel }))}
                            counts={counts}
                            placeholder="Select Source (e.g. Blackbook)"
                        />
                    </div>

                    {/* Exam Year Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-teal-100 border-l-4 border-l-teal-400 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-4 text-teal-800 font-bold text-sm uppercase tracking-wider">
                            <Calendar className="w-4 h-4" /> Exam Year
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allExamYears.map(year => {
                                const isSelected = filters.examYear.includes(year);
                                return (
                                    <button
                                        key={year}
                                        onClick={() => setFilters(prev => {
                                            const current = prev.examYear;
                                            return { ...prev, examYear: current.includes(year) ? current.filter(y => y !== year) : [...current, year] };
                                        })}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border select-none",
                                            isSelected
                                                ? "bg-teal-100 text-teal-900 border-teal-300 ring-1 ring-teal-300"
                                                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 hover:border-slate-300 dark:border-slate-600"
                                        )}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Read Status Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-teal-100 border-l-4 border-l-teal-400 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-4 text-teal-800 font-bold text-sm uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" /> Read Status
                        </div>
                        <SegmentedControl
                            options={['read', 'unread']}
                            selectedOptions={filters.readStatus || []}
                            onOptionToggle={(opt) => setFilters(prev => {
                                const current = prev.readStatus || [];
                                return { ...prev, readStatus: current.includes(opt as any) ? current.filter(i => i !== opt) : [...current, opt as any] };
                            })}
                            counts={counts}
                        />
                    </div>

                    {/* Difficulty Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-teal-100 border-l-4 border-l-teal-400 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-4 text-teal-800 font-bold text-sm uppercase tracking-wider">
                            <Settings className="w-4 h-4" /> Difficulty Level
                        </div>
                        <SegmentedControl
                            options={['Easy', 'Medium', 'Hard']}
                            selectedOptions={filters.difficulty}
                            onOptionToggle={(opt) => setFilters(prev => {
                                const current = prev.difficulty;
                                return { ...prev, difficulty: current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt] };
                            })}
                            counts={counts}
                        />
                    </div>
                </div>

                <div className="mt-8 sticky bottom-4 z-10">
                    <div className="bg-white dark:bg-slate-800 backdrop-blur-md border border-teal-200 shadow-xl rounded-2xl p-4">
                        <div className="mb-4">
                            <ActiveFiltersBar filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={() => setFilters(emptyFilters)} />
                        </div>
                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleStart}
                            disabled={matchedCount === 0}
                            className="bg-teal-500 hover:bg-teal-600 text-white border-none shadow-lg shadow-teal-200"
                        >
                            <Play className="w-5 h-5 mr-2 fill-current" /> Start Flashcards ({matchedCount})
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
