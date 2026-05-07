import { getSession } from '@/lib/auth';
import { getLikedPosts } from '@/services/likeService';
import { redirect } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { Heart } from 'lucide-react';

export default async function SavedPostsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const posts = await getLikedPosts(session.id);

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
            <Heart className="w-8 h-8 text-rose-500 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-white font-quantico mb-2">Saved Posts</h1>
          <p className="text-slate-400 text-lg">Articles you've bookmarked for later</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post as any} index={index} isLiked={true} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No saved posts yet</h2>
            <p className="text-slate-400 mb-6">
              Start exploring and save your favorite articles to read them later.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
            >
              Browse Posts
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
