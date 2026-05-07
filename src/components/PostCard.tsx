'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Post } from '@/types/database';
import { cn, formatDate } from '@/lib/utils';
import { LikeButton } from './LikeButton';

interface PostCardProps {
  post: Post & { category?: { name: string; slug: string } };
  index?: number;
  isLiked?: boolean;
}

export function PostCard({ post, index = 0, isLiked = false }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 shadow-xl"
    >
      <Link href={`/post/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-white/20 text-4xl font-bold">SEO</span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white text-xs font-medium">
                {post.category.name}
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 z-10">
            <LikeButton postId={post.id} initialLiked={isLiked} className="bg-black/20 backdrop-blur-md border-white/20" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{Math.max(1, Math.ceil((post.content?.split(/\s+/).filter(Boolean).length ?? 0) / 200))} min read</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-slate-400 text-sm line-clamp-3 mb-4">
            {post.excerpt || (post.content?.substring(0, 150).replace(/[#*`]/g, '') ?? '') + '...'}
          </p>

          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold group-hover:gap-3 transition-all">
            Read More
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
