import { getPostsByCategory } from '@/services/postService';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  categorySlug: string;
  currentPostId: string;
  isSidebar?: boolean;
}

export async function RelatedPosts({ categorySlug, currentPostId, isSidebar }: RelatedPostsProps) {
  const posts = await getPostsByCategory(categorySlug);
  const relatedPosts = posts.filter(p => p.id !== currentPostId).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  if (isSidebar) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-6 font-quantico">Recommended</h3>
        <div className="flex flex-col gap-6">
          {relatedPosts.map((post: any, index: number) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 border-t border-white/10 pt-16">
      <h2 className="text-3xl font-bold text-white mb-10 font-quantico">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedPosts.map((post: any, index: number) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
