import React from 'react';
import { PresenceAvatar } from '../../../components/ui/PresenceAvatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toggleLikeComment, toggleLikeReelComment } from '../api/communityApi';
import { cn } from '../../../utils/cn';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export const CommentThread: React.FC<{
  comment: any;
  onReply: (id: string, username: string) => void;
  currentUserId?: string;
  isReply?: boolean;
  isReelComment?: boolean;
}> = React.memo(({ comment, onReply, currentUserId, isReply, isReelComment }) => {
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
    <div className={cn("w-full flex items-start justify-between mb-5", isReply ? "mt-3 pl-12" : "mt-2")}>
      {/* Avatar Column */}
      <div onClick={(e) => { e.stopPropagation(); navigate(`/u/${comment.profiles?.username || comment.user_id}`); }} className={cn("shrink-0 cursor-pointer", isReply ? "w-8 h-8" : "w-10 h-10")}>
        <PresenceAvatar
          userId={comment.user_id}
          avatarUrl={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.full_name || 'User'}`}
          altText="avatar"
          className="w-full h-full"
        />
      </div>
        {/* Content Column */}
        <div className="flex-1 pr-4 ml-3 flex flex-col justify-start">
          {/* Username and Text */}
          <div className="text-[14px] leading-snug">
            <span 
              className="font-bold text-gray-900 mr-2 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/u/${comment.profiles?.username || comment.user_id}`);
              }}
            >
              {comment.profiles?.full_name || 'User'}
            </span>
            <span className="text-gray-900 whitespace-pre-wrap">{comment.content}</span>
          </div>


        {/* Metadata Row */}
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[12px] text-gray-500 font-medium">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => onReply(comment.id, comment.profiles?.full_name || 'User')}
            className="text-[12px] text-gray-500 font-semibold hover:text-gray-900 transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {/* View Replies button could go here in future */}
            <div className="flex items-center gap-3 mt-1 mb-2">
               <div className="w-8 h-px bg-gray-300"></div>
               <span className="text-xs font-semibold text-gray-500">View replies ({comment.replies.length})</span>
            </div>
            {comment.replies.map((reply: any) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUserId={currentUserId}
                  isReelComment={isReelComment}
                isReply
              />
            ))}
          </div>
        )}
      </div>

      {/* Like Button (Far Right) */}
      <div className="flex flex-col items-center justify-start ml-auto pl-3 pt-2">
        <button
          onClick={() => currentUserId && likeCommentMutation.mutate(!!comment.is_liked_by_me)}
          className={cn("p-1 transition-all", comment.is_liked_by_me ? "text-red-500 scale-110" : "text-gray-400 hover:text-gray-600")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={comment.is_liked_by_me ? "currentColor" : "none"} stroke="currentColor" strokeWidth={comment.is_liked_by_me ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
             <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        {comment.likes_count > 0 && (
          <span className="text-[10px] font-semibold text-gray-500 mt-0.5">{comment.likes_count}</span>
        )}
      </div>
    </div>
  );
});

export default CommentThread;
