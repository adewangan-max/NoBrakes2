import { getLatestPosts } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { motion } from 'framer-motion';

export const revalidate = 3600; // 1 hour

export default async function Home() {
  const posts = await getLatestPosts(100); // Fetch a large number of posts

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Simple Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-white font-outfit">
          Our <span className="text-indigo-500">Articles</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Explore our latest insights and stories.
        </p>
      </div>

      {/* Latest Posts */}
      <section id="latest">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any, index: number) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No posts found.
          </div>
        )}
      </section>
    </div>
  );
}
