import React, { useState, useRef } from 'react';
import { PresenceAvatar } from '../../../components/ui/PresenceAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, Post } from '../api/communityApi';
import { cn } from '../../../utils/cn';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export const PostCard: React.FC<{
  navigate: any;
  post: Post;
  user: any;
  onLike: () => void;
  onDoubleTap: (x: number, y: number) => void;
}> = React.memo(({ post, onLike, onDoubleTap, navigate, user }) => {
  const lastTapRef = useRef<number>(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useNotificationStore();

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
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

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(post.id, user!.id, content),
    onSuccess: () => {
      setCommentText('');
      setShowCommentBox(false);
      showToast({ title: 'Success', message: 'Comment added!', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: () => {
      showToast({ title: 'Error', message: 'Failed to post comment', variant: 'error' });
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    commentMutation.mutate(commentText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-4 mb-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.profiles?.username || post.user_id}`); }}>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 overflow-hidden">
            <PresenceAvatar
              userId={post.user_id}
              avatarUrl={post.profiles?.avatar_url}
              altText={post.profiles?.full_name || 'User'}
              className="w-full h-full"
            />
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
        onClick={() => navigate(`/community/post/${post.id}`)}
      >
        {post.content}
      </div>

      {post.media_url && (
        <div
          className="w-full rounded-2xl overflow-hidden mb-4 bg-gray-50 relative select-none cursor-pointer"
          onMouseUp={handleTouchEnd}
          onTouchEnd={handleTouchEnd}
          onClick={() => navigate(`/community/post/${post.id}`)}
        >
          <img src={post.media_url} alt="Post media" className="w-full h-auto object-cover max-h-[60vh]" loading="lazy" />
        </div>
      )}

      {post.hls_stream_url && (
        <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden mb-4 bg-black relative flex items-center justify-center">
          <span className="text-gray-500 text-sm">Video View</span>
        </div>
      )}

      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-gray-100">
        <button
          onClick={onLike}
          className="flex items-center gap-2 group"
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              post.is_liked_by_me
                ? "bg-red-500/10 text-red-500"
                : "bg-gray-50 text-gray-600 group-hover:bg-gray-100 group-hover:text-red-400"
            )}
          >
            <Heart size={20} className={cn(post.is_liked_by_me && "fill-current")} />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">{post.likes_count || 0}</span>
        </button>

        <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center gap-2 group"
        >
          <div className="p-2.5 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gray-100 transition-all duration-300 group-hover:text-indigo-400">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-medium text-gray-600">{post.comments_count || 0}</span>
        </button>

        <button className="flex items-center gap-2 group ml-auto">
          <div className="p-2.5 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gray-100 transition-all duration-300 hover:text-gray-900">
            <Share2 size={20} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showCommentBox && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-100 overflow-hidden"
            onSubmit={handleCommentSubmit}
          >
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                <PresenceAvatar
                  userId={user?.id || ''}
                  avatarUrl={user?.user_metadata?.avatar_url || "https://api.dicebear.com/6.x/avataaars/svg?seed=fallback"}
                  className="w-full h-full"
                  altText="Your avatar"
                />
              </div>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={commentMutation.isPending}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentMutation.isPending}
                className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default PostCard;
