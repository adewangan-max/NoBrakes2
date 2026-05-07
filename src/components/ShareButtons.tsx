"use client";

import { Share2 } from 'lucide-react';
import { LikeButton } from './LikeButton';

interface ShareButtonsProps {
  url: string;
  title: string;
  postId: string;
  initialLiked?: boolean;
}

export function ShareButtons({ url, title, postId, initialLiked = false }: ShareButtonsProps) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ url, title }).catch(console.error);
    } else if (typeof navigator !== 'undefined') {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      // We could use a toast here, but simple alert for now
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleShare}
        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 group"
        aria-label="Share on social media"
      >
        <Share2 size={18} className="text-slate-400 group-hover:text-indigo-400" />
      </button>

      <LikeButton
        postId={postId}
        initialLiked={initialLiked}
        className="w-10 h-10 p-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 group !bg-white/5 hover:!bg-indigo-500/20"
      />
    </div>
  );
}
