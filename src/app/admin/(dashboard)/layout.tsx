import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Globe,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "../auth-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Server-side guard (middleware handles most cases, this is a belt-and-suspenders check)
  if (!session) {
    redirect("/login");
  }

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = session.role === "admin";
  const isEditor = session.role === "editor";
  const canCreate = isAdmin || isEditor;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 h-screen hidden md:flex flex-col">
        <div className="p-6">
          <Link
            href="/admin"
            className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-outfit"
          >
            ADMIN PANEL
          </Link>
          {/* Role badge */}
          <span
            className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isAdmin
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {session.role}
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:text-indigo-400" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <Link
            href="/admin/posts"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <FileText className="w-5 h-5 group-hover:text-indigo-400" />
            <span className="font-medium text-sm">Posts</span>
          </Link>

          {canCreate && (
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 transition-all border border-indigo-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Add Post</span>
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-2">
            {session.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.avatarUrl}
                alt={session.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {session.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {session.email}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all group"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/10 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white font-outfit">
            Management
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{session.name}</p>
              <p className="text-[10px] text-slate-500">{session.role}</p>
            </div>
            {session.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.avatarUrl}
                alt={session.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
            )}
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
