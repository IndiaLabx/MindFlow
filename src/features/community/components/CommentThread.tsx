import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toggleLikeComment } from '../api/communityApi';
import { cn } from '../../../utils/cn';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export const CommentThread: React.FC<{
  comment: any;
  onReply: (id: string, username: string) => void;
  currentUserId?: string;
  isReply?: boolean;
}> = React.memo(({ comment, onReply, currentUserId, isReply }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useNotificationStore();
  const likeCommentMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) => toggleLikeComment(comment.id, currentUserId!, currentlyLiked),
    onMutate: async (currentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: ['community-comments', comment.post_id] });
      const previousData = queryClient.getQueryData(['community-comments', comment.post_id]);

      queryClient.setQueryData(['community-comments', comment.post_id], (old: any) => {
          if (!old) return old;
          return old.map((c: any) => {
             if (c.id === comment.id) {
                return { ...c, is_liked_by_me: !currentlyLiked, likes_count: c.likes_count + (currentlyLiked ? -1 : 1) }
             }
             return c;
          });
      });
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['community-comments', comment.post_id], context.previousData);
      }
      showToast({ title: 'Error', message: 'Failed to like comment', variant: 'error' });
    }
  });

  return (
    <div className={cn("flex gap-3", isReply ? "mt-4 ml-8 relative before:absolute before:-left-5 before:top-5 before:w-4 before:h-px before:bg-gray-200" : "")}>
      <img
        onClick={(e) => { e.stopPropagation(); navigate(`/u/${comment.profiles?.username || comment.user_id}`); }}
        src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.full_name || 'User'}`}
        className={cn("rounded-full object-cover shrink-0 border border-gray-100 cursor-pointer", isReply ? "w-8 h-8" : "w-10 h-10")}
        alt="avatar"
      />
      <div className="flex-1">
        <div className="bg-gray-50/80 rounded-2xl p-3 inline-block max-w-full">
          <div
            className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
            onClick={(e) => { e.stopPropagation(); navigate(`/u/${comment.profiles?.username || comment.user_id}`); }}
          >{comment.profiles?.full_name || 'User'}</div>
          <div className="text-gray-800 text-sm whitespace-pre-wrap mt-0.5">{comment.content}</div>
        </div>

        <div className="flex items-center gap-4 mt-1 px-2">
          <span className="text-xs text-gray-500 font-medium">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => currentUserId && likeCommentMutation.mutate(!!comment.is_liked_by_me)}
            className={cn("text-xs font-semibold hover:text-gray-900 transition-colors", comment.is_liked_by_me ? "text-red-500" : "text-gray-500")}
          >
            {comment.is_liked_by_me ? 'Liked' : 'Like'} {comment.likes_count > 0 && `(${comment.likes_count})`}
          </button>
          <button
            onClick={() => onReply(comment.id, comment.profiles?.full_name || 'User')}
            className="text-xs text-gray-500 font-semibold hover:text-gray-900 transition-colors"
          >
            Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="relative before:absolute before:-left-[21px] before:top-2 before:bottom-6 before:w-px before:bg-gray-200">
            {comment.replies.map((reply: any) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUserId={currentUserId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default CommentThread;
