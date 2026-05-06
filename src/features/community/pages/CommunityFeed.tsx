import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts, toggleLikePost, Post } from '../api/communityApi';
import { useSocialRealtime } from '../hooks/useSocialRealtime';
import { useAuth } from '../../auth/context/AuthContext';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  useSocialRealtime();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => fetchPosts(),
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, currentlyLiked }: { postId: string, currentlyLiked: boolean }) => 
      toggleLikePost(postId, user!.id, currentlyLiked),
    onMutate: async ({ postId, currentlyLiked }) => {
      // Optimistic Update
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
    },
    onSettled: () => {
      // Optionally invalidate to ensure sync
      // queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full text-white">Loading Feed...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto pb-32">
      {posts?.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={() => {
            if (!user) return;
            likeMutation.mutate({ postId: post.id, currentlyLiked: !!post.is_liked_by_me });
          }} 
        />
      ))}
    </div>
  );
};

const PostCard: React.FC<{ post: Post, onLike: () => void }> = ({ post, onLike }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-2xl p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-200">{post.profiles?.full_name || 'Anonymous User'}</div>
            <div className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="text-slate-200 mb-4 whitespace-pre-wrap">
        {post.content}
      </div>

      {post.media_url && (
        <div className="w-full rounded-xl overflow-hidden mb-4 bg-slate-950">
          <img src={post.media_url} alt="Post media" className="w-full h-auto" loading="lazy" />
        </div>
      )}

      {post.hls_stream_url && (
        <div className="w-full aspect-[9/16] rounded-xl overflow-hidden mb-4 bg-black relative flex items-center justify-center">
          <span className="text-slate-500 text-sm">Video Stream Ready (IntersectionObserver Pending)</span>
        </div>
      )}

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
        <button 
          onClick={onLike}
          className="flex items-center gap-2 group"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            className={cn("p-2 rounded-full transition-colors", post.is_liked_by_me ? "bg-red-500/20 text-red-500" : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-800")}
          >
            <Heart size={20} className={cn(post.is_liked_by_me && "fill-current")} />
          </motion.div>
          <span className="text-sm font-medium text-slate-400">{post.likes_count || 0}</span>
        </button>

        <button className="flex items-center gap-2 group">
          <div className="p-2 rounded-full bg-slate-800/50 text-slate-400 group-hover:bg-slate-800 transition-colors">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-medium text-slate-400">{post.comments_count || 0}</span>
        </button>

        <button className="flex items-center gap-2 group ml-auto">
          <div className="p-2 rounded-full bg-slate-800/50 text-slate-400 group-hover:bg-slate-800 transition-colors">
            <Share2 size={20} />
          </div>
        </button>
      </div>
    </motion.div>
  );
};
