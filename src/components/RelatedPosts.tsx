import { getPostsByCategory } from '@/services/postService';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  categorySlug: string;
  currentPostId: string;
}

export async function RelatedPosts({ categorySlug, currentPostId }: RelatedPostsProps) {
  const posts = await getPostsByCategory(categorySlug);
  const relatedPosts = posts.filter(p => p.id !== currentPostId).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-white mb-10 font-outfit">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedPosts.map((post: any, index: number) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
