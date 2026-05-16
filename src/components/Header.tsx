"use client";

import Link from 'next/link';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { performSearch } from '@/actions/search';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown and clear search when navigating to a different page
  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        const searchResults = await performSearch(query);
        setResults(searchResults);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
        {/* Logo - Left */}
        <div className="w-1/3 flex justify-start">
          <Link
            href="/"
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-400 dark:from-white dark:to-indigo-400 font-quantico tracking-tight hover:opacity-80 transition-opacity"
          >
            NoBrakes
          </Link>
        </div>

        {/* Center - Nav & Search */}
        <div className="w-1/3 flex justify-center items-center gap-6" ref={dropdownRef}>
          <nav className="hidden md:flex items-center">
            <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">
              Posts
            </Link>
            <Link href="/saved-posts" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ml-6">
              Saved Posts
            </Link>
          </nav>

          <div className="relative flex items-center h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-visible focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white dark:focus-within:bg-white/10 transition-all" style={{ width: '15vw', minWidth: '200px' }}>
            <div className="pl-3 pr-2 text-slate-500 dark:text-slate-400 flex-shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (query.trim().length > 0) setIsOpen(true); }}
              placeholder="Search articles..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none border-none py-2 pr-4 h-full rounded-r-full"
            />

            {/* Dropdown Results */}
            {isOpen && (
              <div className="absolute top-full mt-3 w-[300px] sm:w-[400px] left-1/2 -translate-x-1/2 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 z-50 flex flex-col max-h-[60vh] overflow-y-auto">
                {results.length > 0 ? (
                  results.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 block"
                    >
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">{post.title}</h4>
                      {post.excerpt && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{post.excerpt}</p>}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right - Theme Toggle */}
        <div className="w-1/3 flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
