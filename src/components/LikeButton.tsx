'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleLikeAction } from '@/actions/likeActions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  className?: string;
  showText?: boolean;
}

export function LikeButton({ postId, initialLiked = false, className, showText = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    // Optimistic update
    const previousState = isLiked;
    setIsLiked(!previousState);

    try {
      const result = await toggleLikeAction(postId);
      if (!result.success) {
        // Rollback on error
        setIsLiked(previousState);
        if (result.error === 'Unauthorized') {
           router.push('/login');
        }
      } else {
        setIsLiked(result.liked ?? !previousState);
      }
    } catch (error) {
      setIsLiked(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
        isLiked 
          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white",
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      <div className="relative">
        <Heart 
          className={cn(
            "w-5 h-5 transition-all duration-300",
            isLiked && "fill-current scale-110"
          )} 
        />
        <AnimatePresence>
          {isLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-rose-500 rounded-full"
            />
          )}
        </AnimatePresence>
      </div>
      {showText && (
        <span className="text-sm font-medium">
          {isLiked ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
