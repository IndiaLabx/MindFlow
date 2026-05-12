import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { fetchPosts, toggleLikePost, createComment, Post } from '../api/communityApi';
import { useSocialRealtime } from '../hooks/useSocialRealtime';
import { useAuth } from '../../auth/context/AuthContext';
import { Heart, MessageCircle, Share2, MoreVertical, Plus, Send, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import { CreatePostModal } from '../components/CreatePostModal';
import { PostCardSkeleton } from '../components/PostCardSkeleton';
import { PostCard } from '../components/PostCard';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { SocialHeader } from '../components/SocialHeader';

// --- Particle Component for "Wow" Effect ---
const FloatingHeart: React.FC<{ x: number, y: number, onComplete: () => void }> = ({ x, y, onComplete }) => {
  const xOffset = (Math.random() - 0.5) * 60;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: x - 24, y: y - 24, rotate: -20 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: y - 150,
        x: x - 24 + xOffset,
        rotate: 20
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="fixed z-[9999] pointer-events-none drop-shadow-lg text-red-500"
    >
      <Heart size={48} className="fill-current" />
    </motion.div>
  );
};

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  useSocialRealtime();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const { showToast } = useNotificationStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['community-posts'],
    queryFn: ({ pageParam }) => fetchPosts(10, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const likeMutation = useMutation({
    mutationFn: ({ postId, currentlyLiked }: { postId: string, currentlyLiked: boolean }) => 
      toggleLikePost(postId, user!.id, currentlyLiked),
    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      const previousData = queryClient.getQueryData(['community-posts']);
      
      queryClient.setQueryData(['community-posts'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Post) => {
              if (p.id === postId) {
                return {
                  ...p,
                  is_liked_by_me: !currentlyLiked,
                  likes_count: p.likes_count ? p.likes_count + (currentlyLiked ? -1 : 1) : (currentlyLiked ? 0 : 1)
                };
              }
              return p;
            })
          }))
        };
      });
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['community-posts'], context.previousData);
      }
      showToast({ title: 'Error', message: 'Failed to like post. Please try again.', variant: 'error' });
    }
  });

  const handleDoubleTapLike = (postId: string, currentlyLiked: boolean, x: number, y: number) => {
    if (!currentlyLiked) {
      if (user) {
         likeMutation.mutate({ postId, currentlyLiked });
      }
      const newParticle = { id: Date.now() + Math.random(), x, y };
      setParticles(prev => [...prev, newParticle]);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-32 pt-0 px-0 md:px-4">
      <SocialHeader />
      <div className="w-full px-4">
        {[1, 2, 3].map(i => <PostCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-32 pt-0 px-0 md:px-4">
      <SocialHeader />
      <div className="w-full px-4 flex flex-col items-center">
      <AnimatePresence>
        {particles.map(p => (
          <FloatingHeart key={p.id} x={p.x} y={p.y} onComplete={() => removeParticle(p.id)} />
        ))}
      </AnimatePresence>

      {data?.pages.map((page: any, i: number) => (
        <React.Fragment key={i}>
          {page.data.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => {
                if (!user) return;
                likeMutation.mutate({ postId: post.id, currentlyLiked: !!post.is_liked_by_me });
              }}
              onDoubleTap={(x, y) => handleDoubleTapLike(post.id, !!post.is_liked_by_me, x, y)}
              navigate={navigate}
              user={user}
            />
          ))}
        </React.Fragment>
      ))}

      {/* Loading Indicator for Next Page */}
      <div ref={ref} className="w-full flex justify-center py-4">
        {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />}
      </div>

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 md:bottom-20 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      </div>
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} feedType="posts" />
    </div>
  );
};

