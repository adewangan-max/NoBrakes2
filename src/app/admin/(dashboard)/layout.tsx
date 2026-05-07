import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
      {/* Admin Sidebar (client component handles active link state) */}
      <AdminSidebar session={session} canCreate={canCreate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/10 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white font-quantico">
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
