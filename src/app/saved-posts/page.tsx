import { getSession } from '@/lib/auth';
import { getLikedPosts } from '@/services/likeService';
import { redirect } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default async function SavedPostsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const posts = await getLikedPosts(session.id);

  return (
    <main className="min-h-screen bg-white dark:bg-[#202124] transition-colors duration-300 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/30 mb-4">
            <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Saved Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Articles you've bookmarked for later
          </p>
        </div>

        {posts.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-8 pb-4 border-b border-gray-200 dark:border-[#3c4043]">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Showing {posts.length} saved {posts.length === 1 ? 'post' : 'posts'}
              </p>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post as any} index={index} isLiked={true} />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3c4043] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No saved posts yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring and save your favorite articles to read them later.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors shadow-sm"
            >
              Browse Posts
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}