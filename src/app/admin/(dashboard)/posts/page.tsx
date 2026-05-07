"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { getSessionAction } from '../../auth-actions';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2, Search, Sparkles, Filter, ArrowUpDown, Calendar, Clock, CheckCircle, Archive, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  categories: { name: string } | null;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchSessionAndPosts = async () => {
      setLoading(true);
      const sessionData = await getSessionAction();
      if (!sessionData) {
        router.push("/login");
        return;
      }
      setSession(sessionData);

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, title, slug, status, published_at, created_at, categories(name)')
        .order('created_at', { ascending: false });

      if (postsData) {
        const formattedPosts = postsData.map((post: any) => ({
          ...post,
          categories: Array.isArray(post.categories) ? post.categories[0] : post.categories
        }));
        setPosts(formattedPosts);
      }
      setLoading(false);
    };

    fetchSessionAndPosts();
  }, [router]);

  const isAdmin = session?.role === 'admin';

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return {
          icon: CheckCircle,
          text: 'Published',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'draft':
        return {
          icon: Clock,
          text: 'Draft',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'archived':
        return {
          icon: Archive,
          text: 'Archived',
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
      default:
        return {
          icon: Clock,
          text: status,
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-light tracking-wide">
            Loading posts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={24} className="text-indigo-400" />
              <span className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Content Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Posts
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your content and SEO optimization.
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/admin/posts/new"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create New Post
            </Link>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/20 transition-all duration-500">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-4 flex-wrap">
          <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm">
            <span className="text-indigo-400 font-semibold">Total: {posts.length}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm">
            <span className="text-emerald-400 font-semibold">Published: {posts.filter(p => p.status === 'published').length}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm">
            <span className="text-amber-400 font-semibold">Drafts: {posts.filter(p => p.status === 'draft').length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10">
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      Title
                      <ArrowUpDown size={12} className="text-slate-600" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, idx) => {
                    const statusBadge = getStatusBadge(post.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-white/5 transition-all duration-300 group"
                        style={{
                          animation: isVisible ? `fadeInUp 0.4s ease-out ${idx * 0.03}s both` : "none",
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium line-clamp-1 group-hover:text-indigo-400 transition-colors">
                              {post.title}
                            </span>
                            <span className="text-slate-500 text-[10px] mt-0.5">
                              {post.categories?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge.className}`}>
                            <StatusIcon size={10} />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {formatDate(post.published_at || post.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/post/${post.slug}`}
                              target="_blank"
                              className="p-2.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 group/btn"
                              title="View"
                            >
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </Link>
                            {isAdmin && (
                              <>
                                <Link
                                  href={`/admin/posts/${post.id}/edit`}
                                  className="p-2.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-all duration-200 group/btn"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                </Link>
                                <button
                                  className="p-2.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-all duration-200 group/btn"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <Search size={32} className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 italic">
                          {searchTerm || statusFilter !== "all"
                            ? "No posts match your filters."
                            : isAdmin
                              ? "No posts yet. Create your first one!"
                              : "No posts found."}
                        </p>
                        {isAdmin && !searchTerm && statusFilter === "all" && (
                          <Link
                            href="/admin/posts/new"
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-300"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Post
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination (placeholder) */}
        {filteredPosts.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-slate-500">
              Showing {filteredPosts.length} of {posts.length} posts
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium transition-all hover:scale-105">
                1
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}