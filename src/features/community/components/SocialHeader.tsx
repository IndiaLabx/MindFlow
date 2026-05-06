import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { cn } from '../../../utils/cn';

export const SocialHeader: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    // Mock stories for future use
    const mockStories = [
        { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
        { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' },
        { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
        { id: 4, name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
        { id: 5, name: 'Eve', avatar: 'https://i.pravatar.cc/150?u=eve' },
        { id: 6, name: 'Frank', avatar: 'https://i.pravatar.cc/150?u=frank' },
    ];

    return (
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 p-3 sticky top-0 z-40 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* My Profile / Add Story */}
                <div
                    className="flex flex-col items-center gap-1 cursor-pointer shrink-0 snap-start"
                    onClick={() => navigate('/community/user/me')}
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-[3px] border-white dark:border-slate-900 shadow-sm overflow-hidden flex items-center justify-center">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="My Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-indigo-500">{profile?.full_name?.charAt(0) || 'M'}</span>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Your Story</span>
                </div>

                {/* Mock Stories */}
                {mockStories.map((story) => (
                    <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 snap-start opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                            <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-white">
                                <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{story.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
