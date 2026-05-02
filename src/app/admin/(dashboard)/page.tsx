import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FileText, TrendingUp, Users, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  const { data: posts } = await supabase
    .from('posts')
    .select('id, status, created_at');

  const { data: tags } = await supabase.from('tags').select('id');
  const { data: categories } = await supabase.from('categories').select('id');

  const totalPosts = posts?.length ?? 0;
  const publishedPosts = posts?.filter((p) => p.status === 'published').length ?? 0;
  const draftPosts = posts?.filter((p) => p.status === 'draft').length ?? 0;
  const archivedPosts = posts?.filter((p) => p.status === 'archived').length ?? 0;

  const stats = [
    {
      label: 'Total Articles',
      value: totalPosts,
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Published',
      value: publishedPosts,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Drafts',
      value: draftPosts,
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Categories',
      value: categories?.length ?? 0,
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  const isAdmin = session.role === 'admin';

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white font-outfit">
          Welcome back, {session.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin ? 'You have full admin access.' : `You are logged in as ${session.role}.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-white/5 border ${stat.border} flex items-start justify-between`}
          >
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white font-outfit">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6 font-outfit">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {isAdmin && (
              <Link
                href="/admin/posts/new"
                className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/50 text-center transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/30 transition-colors">
                  <span className="text-2xl text-indigo-400">+</span>
                </div>
                <span className="text-sm font-bold text-white">New Post</span>
              </Link>
            )}
            <Link
              href="/admin/posts"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-bold text-white">All Posts</span>
            </Link>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <span className="text-sm font-bold text-white">Sitemap</span>
            </a>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6 font-outfit">Content Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Published', count: publishedPosts, total: totalPosts, color: 'bg-emerald-500' },
              { label: 'Draft', count: draftPosts, total: totalPosts, color: 'bg-amber-500' },
              { label: 'Archived', count: archivedPosts, total: totalPosts, color: 'bg-slate-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white font-bold">{item.count} / {item.total}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {totalPosts === 0 && (
              <p className="text-slate-500 text-sm text-center py-4 italic">
                No posts yet. Create your first one!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
