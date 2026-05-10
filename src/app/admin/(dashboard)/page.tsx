"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { getSessionAction } from '../auth-actions';
import { FileText, TrendingUp, Users, Layers, LogOut, Sparkles, ArrowRight, Plus, Clock, CheckCircle, Archive, Globe, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";


interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Stats state
  const [totalPosts, setTotalPosts] = useState(0);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [draftPosts, setDraftPosts] = useState(0);
  const [archivedPosts, setArchivedPosts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      setLoading(true);
      const sessionData = await getSessionAction();
      if (!sessionData) {
        router.push("/login");
        return;
      }
      setSession(sessionData);

      // Fetch stats
      const { data: posts } = await supabase
        .from('posts')
        .select('id, status, created_at, title, content')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: tags } = await supabase.from('tags').select('id');
      const { data: categories } = await supabase.from('categories').select('id');

      setTotalPosts(posts?.length ?? 0);
      setPublishedPosts(posts?.filter((p) => p.status === 'published').length ?? 0);
      setDraftPosts(posts?.filter((p) => p.status === 'draft').length ?? 0);
      setArchivedPosts(posts?.filter((p) => p.status === 'archived').length ?? 0);
      setTotalCategories(categories?.length ?? 0);
      setRecentPosts(posts || []);

      setLoading(false);
    };

    fetchSessionAndData();
  }, [router]);

  const handleLogout = async () => {
    // Add logout logic here
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-light tracking-wide">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const stats = [
    {
      label: 'Total Articles',
      value: totalPosts,
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      gradient: 'from-indigo-600 to-indigo-400',
    },
    {
      label: 'Published',
      value: publishedPosts,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-600 to-emerald-400',
    },
    {
      label: 'Drafts',
      value: draftPosts,
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      gradient: 'from-amber-600 to-amber-400',
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-600 to-purple-400',
    },
  ];

  const statusItems = [
    { label: 'Published', count: publishedPosts, total: totalPosts, color: 'bg-emerald-500', icon: CheckCircle },
    { label: 'Draft', count: draftPosts, total: totalPosts, color: 'bg-amber-500', icon: Clock },
    { label: 'Archived', count: archivedPosts, total: totalPosts, color: 'bg-slate-500', icon: Archive },
  ];

  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className={`relative px-6 md:px-10 py-8 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={28} className="text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Admin Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                Welcome back, {session.name.split(' ')[0]} 👋
              </h1>
              <p className="text-slate-400 text-base">
                {isAdmin ? 'You have full admin access to manage your content.' : `You are logged in as ${session.role}.`}
              </p>
            </div>

            {/* Time Display */}
            <div className="text-right">
              <div className="text-4xl font-bold tracking-tighter leading-none bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {time}
              </div>
              <div className="text-xs text-slate-500 font-light mt-1">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border ${stat.border} hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
              style={{
                animation: isVisible ? `fadeInUp 0.6s ease-out ${0.1 * idx}s both` : "none",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions & Posts List - Left Column (spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/20 transition-all duration-500">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(isAdmin || session.role === 'editor') && (
                  <Link
                    href="/admin/posts/new"
                    className="group p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/50 text-center transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">New Post</span>
                  </Link>
                )}
                <Link
                  href="/admin/posts"
                  className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-center transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/10 transition-all">
                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-white">All Posts</span>
                </Link>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText size={20} className="text-indigo-400" />
                  Recent Posts
                </h3>
                <Link href="/admin/posts" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                  View all
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No posts yet. Create your first post!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                      style={{
                        animation: isVisible ? `fadeInUp 0.4s ease-out ${0.2 + idx * 0.05}s both` : "none",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.status === 'published' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                              <CheckCircle size={10} />
                              Published
                            </span>
                          )}
                          {post.status === 'draft' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400">
                              <Clock size={10} />
                              Draft
                            </span>
                          )}
                          {post.status === 'archived' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/20 text-slate-400">
                              <Archive size={10} />
                              Archived
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <Edit size={16} className="text-slate-400 hover:text-indigo-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <Trash2 size={16} className="text-slate-400 hover:text-red-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <MoreHorizontal size={16} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status Breakdown & Profile */}
          <div className="space-y-8">
            {/* Content Status */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/20 transition-all duration-500">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-400" />
                Content Status
              </h3>
              <div className="space-y-5">
                {statusItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2 text-slate-400">
                        <item.icon size={14} />
                        {item.label}
                      </span>
                      <span className="text-white font-bold">{item.count} / {item.total}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-700 relative overflow-hidden`}
                        style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
                {totalPosts === 0 && (
                  <p className="text-slate-500 text-sm text-center py-6 italic">
                    No posts yet. Create your first one!
                  </p>
                )}
              </div>
            </div>

            {/* Admin Profile Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-500">
              <div className="relative">
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />
                <p className="text-xs text-indigo-400 font-light tracking-widest uppercase mb-4 relative z-10">
                  Authenticated Admin
                </p>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <span className="text-white font-bold text-xl">
                      {(session.name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{session.name}</p>
                    <p className="text-xs text-slate-400">{session.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400">
                      {session.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-4 px-4 py-3 bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 group relative z-10"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}