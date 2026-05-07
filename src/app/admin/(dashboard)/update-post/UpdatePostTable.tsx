'use client';

import { useState } from 'react';
import { Edit, RefreshCcw, X, Save, AlertCircle } from 'lucide-react';
import { incrementUpdateAction } from '../posts/actions';

interface PostForUpdate {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  updated_counts: number | null;
  updated_at: string;
  status: string;
}

export default function UpdatePostTable({ posts }: { posts: PostForUpdate[] }) {
  const [editingPost, setEditingPost] = useState<PostForUpdate | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsUpdating(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
    };

    const result = await incrementUpdateAction(editingPost.id, updates);

    if (result.success) {
      setEditingPost(null);
    } else {
      setError(result.error || 'Failed to update post');
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-orange-500/20 bg-black/20 backdrop-blur-sm shadow-2xl shadow-orange-500/5">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-orange-500/10 bg-orange-500/5">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-400">Post Title</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-400">Slug</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-400 text-center">Update Count</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-500/10">
            {posts.map((post) => (
              <tr 
                key={post.id} 
                className="group hover:bg-orange-500/5 transition-all duration-300 cursor-pointer"
                onClick={() => setEditingPost(post)}
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{post.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Last Modified: {new Date(post.updated_at).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 font-mono">{post.slug}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 font-black border border-orange-500/20">
                    {post.updated_counts || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all transform group-hover:scale-110"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            onClick={() => !isUpdating && setEditingPost(null)} 
          />
          
          <div className="relative w-full max-w-lg bg-[#0c0e14] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                  <RefreshCcw className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Update Post</h3>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Editor Access Only</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingPost(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                disabled={isUpdating}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-widest">Article Title</label>
                <input 
                  name="title"
                  defaultValue={editingPost.title}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-widest">Article Slug</label>
                <input 
                  name="slug"
                  defaultValue={editingPost.slug}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-widest">Article Content</label>
                <textarea 
                  name="content"
                  defaultValue={editingPost.content || ''}
                  rows={8}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    Updating Database...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Apply Changes & Increment Count
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
