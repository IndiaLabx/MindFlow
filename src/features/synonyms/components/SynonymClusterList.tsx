import React, { useState, useMemo } from 'react';
import { SynonymWord } from '../../quiz/types';
import { useSynonymProgress } from '../hooks/useSynonymProgress';
import { FiSearch, FiChevronLeft } from 'react-icons/fi';

interface SynonymClusterListProps {
  data: SynonymWord[];
  onExit: () => void;
  onSelectWord: (word: SynonymWord) => void;
}

export const SynonymClusterList: React.FC<SynonymClusterListProps> = ({
  data,
  onExit,
  onSelectWord,
}) => {
  const { getStatus } = useSynonymProgress();
  const [searchQuery, setSearchQuery] = useState('');

  // Group data by cluster_id or theme, and filter by search
  const clusters = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // Filter data first
    const filteredData = data.filter(word =>
      word.word.toLowerCase().includes(query) ||
      (word.hindiMeaning && word.hindiMeaning.toLowerCase().includes(query)) ||
      (word.meaning && word.meaning.toLowerCase().includes(query))
    );

    const grouped = filteredData.reduce((acc, word) => {
      // Use cluster_id if available, otherwise fallback to theme or 'Uncategorized'
      const key = word.cluster_id || word.theme || 'Uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(word);
      return acc;
    }, {} as Record<string, SynonymWord[]>);

    // Ensure highest importance words are first within clusters
    for (const key in grouped) {
      grouped[key].sort((a, b) => b.importance_score - a.importance_score);
    }

    return grouped;
  }, [data, searchQuery]);

  const getHeatmapStyle = (score: number) => {
    if (score > 10) return {
      border: 'border-red-200 dark:border-red-900/50',
      bg: 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      icon: '🔥',
      freqColor: 'text-red-500/80 dark:text-red-400/80',
    };
    if (score >= 5) return {
      border: 'border-amber-200 dark:border-amber-900/50',
      bg: 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-500',
      icon: '⭐',
      freqColor: 'text-amber-600/80 dark:text-amber-500/80',
    };
    return {
      border: 'border-slate-200 dark:border-slate-700',
      bg: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50',
      text: 'text-slate-800 dark:text-slate-200',
      icon: null,
      freqColor: 'text-slate-400 dark:text-slate-500',
    };
  };

  const getStatusIcon = (status: 'new' | 'familiar' | 'mastered') => {
    switch (status) {
      case 'mastered': return '🟢';
      case 'familiar': return '🟡';
      case 'new': return '🔴';
    }
  };

  const totalClusters = Object.keys(clusters).length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="flex flex-col bg-white dark:bg-slate-800 shadow-sm z-10 sticky top-0">
        <div className="flex items-center p-4">
          <button
            onClick={onExit}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors mr-2"
            aria-label="Exit list view"
          >
             <FiChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif leading-tight">Master Word Families</h1>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {totalClusters} Unique Semantic Clusters
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for a word or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-slate-200 dark:placeholder-slate-400 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {Object.entries(clusters).map(([clusterId, words], index) => {
          // Derive core meaning from the first word's Hindi meaning
          const coreMeaning = words[0]?.hindiMeaning || '';
          // We can use the index to show "FAMILY 1", "FAMILY 2" etc.
          const familyNumber = index + 1;

          return (
            <div key={clusterId} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    FAMILY {familyNumber}
                  </h3>
                  {coreMeaning && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      Core Meaning: {coreMeaning}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 flex flex-wrap gap-3">
                {words.map(word => {
                  const status = getStatus(word);
                  const style = getHeatmapStyle(word.importance_score);

                  // Extract frequency and trend safely, defaulting to 0 if not present
                  // The type says lifetime_frequency, recent_trend
                  const freq = word.lifetime_frequency ?? 0;
                  const trend = word.recent_trend ?? 0;
                  const trendSign = trend > 0 ? '+' : '';

                  return (
                    <button
                      key={word.id}
                      onClick={() => onSelectWord(word)}
                      className={`flex flex-col items-start px-4 py-3 rounded-xl border ${style.border} ${style.bg} transition-all active:scale-95 text-left min-w-[120px] max-w-full ${status === 'mastered' ? 'opacity-60 grayscale' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-base ${style.text}`}>
                          {word.word}
                        </span>
                        {style.icon && (
                          <span className="text-sm" aria-hidden="true">{style.icon}</span>
                        )}
                        {word.confusable_with?.length > 0 && (
                          <span title={`Confusable with ${word.confusable_with.join(', ')}`} className="text-orange-500 cursor-help ml-1 border border-orange-200 rounded-full px-1.5 text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 dark:border-orange-800">!</span>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 text-[10px] font-bold tracking-wider ${style.freqColor}`}>
                        {freq > 0 && <span>FREQ: {freq}</span>}
                        {trend !== 0 && <span>TREND: {trendSign}{trend}</span>}
                        {freq === 0 && trend === 0 && <span>FREQ: {word.importance_score}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(clusters).length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="text-lg font-medium mb-2">No words found</p>
            <p className="text-sm">Try searching for a different word or meaning.</p>
          </div>
        )}
      </div>
    </div>
  );
};
