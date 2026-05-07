"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  Link as LinkIcon,
  RefreshCcw,
} from "lucide-react";
import { logoutAction } from "@/app/admin/auth-actions";

export default function AdminSidebar({
  session,
  canCreate,
}: {
  session: any;
  canCreate: boolean;
}) {
  const pathname = usePathname() || "";

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="w-60 border-r border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 h-screen hidden md:flex flex-col ">
      <div className="p-6">
        <Link
          href="/admin"
          className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          ADMIN PANEL
        </Link>
        <span
          className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${session.role === "admin"
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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive("/admin")
            ? "bg-white/5 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium text-sm">Dashboard</span>
        </Link>

        <Link
          href="/admin/posts"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive("/admin/posts")
            ? "bg-white/5 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium text-sm">Posts</span>
        </Link>

        {canCreate && (
          <Link
            href="/admin/posts/new"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive("/admin/posts/new")
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Add Post</span>
          </Link>
        )}

        <Link
          href="/admin/internal-links"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive("/admin/internal-links")
            ? "bg-white/5 text-yellow-400"
            : "text-yellow-400 hover:bg-white/5 hover:text-yellow-200"
            }`}
        >
          <LinkIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Internal Links</span>
        </Link>

        {session.role === "editor" && (
          <Link
            href="/admin/update-post"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive("/admin/update-post")
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              : "text-orange-500 hover:bg-orange-500/5 hover:text-orange-300"
              }`}
          >
            <RefreshCcw className="w-5 h-5" />
            <span className="font-medium text-sm">Update Post</span>
          </Link>
        )}
      </nav>

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
              {session.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
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
  );
}
