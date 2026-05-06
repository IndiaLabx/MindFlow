import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts, toggleLikePost, createPost, Post } from '../api/communityApi';
import { useSocialRealtime } from '../hooks/useSocialRealtime';
import { useAuth } from '../../auth/context/AuthContext';
import { Heart, MessageCircle, Share2, MoreVertical, Plus, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import { CreatePostModal } from '../components/CreatePostModal';
import { SocialHeader } from '../components/SocialHeader';

// --- Particle Component for "Wow" Effect ---
const FloatingHeart: React.FC<{ x: number, y: number, onComplete: () => void }> = ({ x, y, onComplete }) => {
  // Randomize float trajectory
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


  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => fetchPosts(),
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, currentlyLiked }: { postId: string, currentlyLiked: boolean }) => 
      toggleLikePost(postId, user!.id, currentlyLiked),
    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['community-posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['community-posts']);
      
      queryClient.setQueryData<Post[]>(['community-posts'], (old) => {
        if (!old) return [];
        return old.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked_by_me: !currentlyLiked,
              likes_count: p.likes_count ? p.likes_count + (currentlyLiked ? -1 : 1) : (currentlyLiked ? 0 : 1)
            };
          }
          return p;
        });
      });
      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['community-posts'], context.previousPosts);
      }
    }
  });

  const handleDoubleTapLike = (postId: string, currentlyLiked: boolean, x: number, y: number) => {
    // Only trigger if not already liked (like Insta)
    if (!currentlyLiked) {
      if (user) {
         likeMutation.mutate({ postId, currentlyLiked });
      }
      // Add particle
      const newParticle = { id: Date.now() + Math.random(), x, y };
      setParticles(prev => [...prev, newParticle]);

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full text-gray-900 pt-20">Loading Feed...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full mx-auto pb-32">
      <SocialHeader />
      <div className="w-full max-w-2xl px-4 pt-4">
      {/* Render Particles Overlay */}
      <AnimatePresence>
        {particles.map(p => (
          <FloatingHeart key={p.id} x={p.x} y={p.y} onComplete={() => removeParticle(p.id)} />
        ))}
      </AnimatePresence>

      {posts?.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={() => {
            if (!user) return;
            likeMutation.mutate({ postId: post.id, currentlyLiked: !!post.is_liked_by_me });
          }}
          onDoubleTap={(x, y) => handleDoubleTapLike(post.id, !!post.is_liked_by_me, x, y)}
          navigate={navigate}
        />
      ))}
          <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} feedType="posts" />
      </div>
    </div>
  );
};

const PostCard: React.FC<{
  navigate: any;
  post: Post,
  onLike: () => void,
  onDoubleTap: (x: number, y: number) => void
}> = ({ post, onLike, onDoubleTap, navigate }) => {
  const lastTapRef = useRef<number>(0);

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // It's a double tap
      let clientX = 0;
      let clientY = 0;
      if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      onDoubleTap(clientX, clientY);
    }
    lastTapRef.current = now;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-4 mb-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/community/user/${post.user_id}`); }}>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 overflow-hidden">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{post.profiles?.full_name || 'MindFlow User'}</div>
            <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <button className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
          <MoreVertical size={20} />
        </button>
      </div>

      <div
        className="text-gray-900 mb-4 whitespace-pre-wrap select-none cursor-pointer"
        onMouseUp={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
      >
        {post.content}
      </div>

      {post.media_url && (
        <div
          className="w-full rounded-2xl overflow-hidden mb-4 bg-gray-50 relative select-none cursor-pointer"
          onMouseUp={handleTouchEnd}
          onTouchEnd={handleTouchEnd}
        >
          <img src={post.media_url} alt="Post media" className="w-full h-auto object-cover max-h-[60vh]" loading="lazy" />
        </div>
      )}

      {post.hls_stream_url && (
        <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden mb-4 bg-black relative flex items-center justify-center">
          <span className="text-gray-500 text-sm">Video View (Intersection pending)</span>
        </div>
      )}

      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-gray-200">
        <button 
          onClick={onLike}
          className="flex items-center gap-2 group"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              post.is_liked_by_me
                ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-100 group-hover:text-red-400"
            )}
          >
            <Heart size={22} className={cn(post.is_liked_by_me && "fill-current")} />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">{post.likes_count || 0}</span>
        </button>

        <button className="flex items-center gap-2 group">
          <div className="p-2.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-100 transition-all duration-300 group-hover:text-indigo-400">
            <MessageCircle size={22} />
          </div>
          <span className="text-sm font-medium text-gray-600">{post.comments_count || 0}</span>
        </button>

        <button className="flex items-center gap-2 group ml-auto">
          <div className="p-2.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-100 transition-all duration-300 hover:text-gray-900">
            <Share2 size={22} />
          </div>
        </button>
      </div>
    </motion.div>
  );
};
