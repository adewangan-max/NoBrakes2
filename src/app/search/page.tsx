import { searchPosts } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { Search as SearchIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;
  const results = query ? await searchPosts(query) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 font-outfit text-center">
          Search Articles
        </h1>
        
        <form action="/search" className="relative group">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search for topics, keywords..."
            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-3 p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </form>
      </header>

      {query && (
        <div className="mb-12">
          <p className="text-slate-400">
            Showing {results.length} results for <span className="text-white font-bold">"{query}"</span>
          </p>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((post: any, index: number) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-slate-400">No results found for your search. Try different keywords.</p>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <p className="text-slate-500 italic text-lg">Enter a search term above to find articles.</p>
        </div>
      )}
    </div>
  );
}
