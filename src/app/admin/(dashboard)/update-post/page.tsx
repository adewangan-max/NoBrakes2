import { getPostsForUpdate } from '@/services/postService';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UpdatePostTable from './UpdatePostTable';
import { RefreshCcw, Sparkles } from 'lucide-react';

export default async function UpdatePostPage() {
  const session = await getSession();
  
  // Basic guard (Middleware handles most, but this is for extra safety)
  if (!session) redirect('/login');
  
  // Strict check for editor role as requested
  if (session.role !== 'editor') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <RefreshCcw className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 font-quantico">Access Restricted</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          The "Update Post" module is exclusively available to users with the <span className="text-orange-400 font-bold">Editor</span> role. 
          Your current role is <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">{session.role}</span>.
        </p>
      </div>
    );
  }

  const posts = await getPostsForUpdate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <RefreshCcw size={28} className="text-orange-500 animate-pulse" />
            <span className="text-sm font-black text-orange-500 uppercase tracking-[0.2em]">Data Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2 font-quantico">
            Update Posts
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Review article performance and track modification history. Only editors can increment update counts and sync changes to the core database.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-orange-500/5 border border-orange-500/20 px-6 py-4 rounded-2xl backdrop-blur-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Active Postings</p>
            <p className="text-2xl font-black text-white">{posts.length}</p>
          </div>
          <div className="w-px h-10 bg-orange-500/20" />
          <Sparkles className="w-6 h-6 text-orange-400" />
        </div>
      </div>

      <UpdatePostTable posts={posts} />
    </div>
  );
}
