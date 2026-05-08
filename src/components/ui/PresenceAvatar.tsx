import React from 'react';
import { usePresenceStore } from '../../stores/usePresenceStore';
import { cn } from '../../utils/cn';

interface PresenceAvatarProps {
  userId: string;
  avatarUrl?: string | null;
  altText?: string;
  className?: string; // used to control width and height
}

export const PresenceAvatar: React.FC<PresenceAvatarProps> = ({
  userId,
  avatarUrl,
  altText = 'User',
  className = 'w-10 h-10'
}) => {
  // Directly checking the store. We DO NOT filter out the current user,
  // so if the user is online, they see their own green dot.
  const isOnline = usePresenceStore(state => state.isUserOnline(userId));

  return (
    <div className={cn("relative inline-block", className)}>
      <div className="w-full h-full rounded-full bg-indigo-500 overflow-hidden shadow-sm flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={altText}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-sm uppercase">
            {altText.charAt(0)}
          </span>
        )}
      </div>

      {isOnline && (
        <div
          className="absolute bottom-0 right-0 w-[25%] h-[25%] min-w-[10px] min-h-[10px] bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"
          aria-label="Online status indicator"
        />
      )}
    </div>
  );
};
