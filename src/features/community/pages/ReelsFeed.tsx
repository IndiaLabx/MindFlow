import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReels, toggleLikeReel, Reel } from '../api/communityApi';
import { useAuth } from '../../auth/context/AuthContext';
import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { CreatePostModal } from '../components/CreatePostModal';
import { Plus } from 'lucide-react';
import { ReelSkeleton } from '../components/ReelSkeleton';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export const ReelsFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: reelsData, isLoading } = useQuery({
    queryKey: ['community-reels'],
    queryFn: () => fetchReels(50),
  });

  const reels = reelsData?.data || [];

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full bg-gray-900 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative z-50">
         <ReelSkeleton />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-gray-900 overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative z-50">
      {/* Absolute Back Button */}
      <div className="absolute top-safe left-4 z-50 mt-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-900/40 backdrop-blur-md text-white border border-white/10 shadow-md">
          <ArrowLeft size={24} />
        </button>
      </div>

      {reels.length === 0 ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
          <p className="mb-4">No reels available</p>
          <button
             onClick={() => setIsCreateModalOpen(true)}
             className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-500 transition-colors"
          >
             Create the first Reel!
          </button>
        </div>
      ) : (
        reels.map((reel) => (
          <ReelItem key={reel.id} reel={reel} currentUser={user} />
        ))
      )}

      {/* Floating Action Button for Create Reel */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 md:bottom-20 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} feedType="reels" />
    </div>
  );
};

const ReelItem: React.FC<{ reel: Reel, currentUser: any }> = ({ reel, currentUser }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationStore();

  const likeReelMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) => toggleLikeReel(reel.id, currentUser!.id, currentlyLiked),
    onMutate: async (currentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: ['community-reels'] });
      const previousReels = queryClient.getQueryData(['community-reels']);

      queryClient.setQueryData(['community-reels'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((r: any) => r.id === reel.id ? {
            ...r,
            is_liked_by_me: !currentlyLiked,
            likes_count: r.likes_count ? r.likes_count + (currentlyLiked ? -1 : 1) : (currentlyLiked ? 0 : 1)
          } : r)
        };
      });
      return { previousReels };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousReels) {
        queryClient.setQueryData(['community-reels'], context.previousReels);
      }
      showToast({ title: 'Error', message: 'Failed to like reel', variant: 'error' });
    }
  });

  const handleLike = () => {
    if (!currentUser) return;
    likeReelMutation.mutate(!!reel.is_liked_by_me);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log('Auto-play blocked:', e));
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // trigger when 60% of the reel is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full snap-start relative bg-black overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={togglePlay}
    >
      {/* Background Media (Video) using Byte-Range Requests */}
      {reel.video_url && (
        <video
          ref={videoRef}
          src={reel.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* Overlay Gradient for Text Readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Side Action Bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10" onClick={(e: any) => e.stopPropagation()}>
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-gray-900/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-90 transition-transform">
            <Heart size={28} className={cn(reel.is_liked_by_me && "fill-red-500 text-red-500")} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{reel.likes_count || 0}</span>
        </button>

        <button onClick={() => navigate(`/community/reels/${reel.id}/comments`)} className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-gray-900/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-90 transition-transform">
            <MessageCircle size={28} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{reel.comments_count || 0}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-gray-900/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-90 transition-transform">
            <Share2 size={28} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
        </button>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-16 p-4 z-10" onClick={(e: any) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/u/${reel.profiles?.username || reel.user_id}`)}>
          <div className="w-10 h-10 rounded-full bg-gray-200 border border-white/20 overflow-hidden">
            {reel.profiles?.avatar_url ? (
              <img src={reel.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            )}
          </div>
          <span className="text-white font-semibold drop-shadow-md">{reel.profiles?.full_name || reel.profiles?.username || 'MindFlow User'}</span>
          <button className="px-3 py-1 rounded-full border border-white/50 text-white text-xs font-semibold backdrop-blur-sm bg-white/10">
            Follow
          </button>
        </div>

        {reel.caption && (
          <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-2">
            {reel.caption}
          </p>
        )}
      </div>

      {/* Playing indicator / Pause icon overlay */}
      <AnimatePresence>
        {!isPlaying && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
          >
             <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
