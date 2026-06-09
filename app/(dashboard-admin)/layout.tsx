"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { BarChart3, Users, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/results", label: "Results", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <BarChart3 className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">AgileReady Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium">{session.user.companyName}</p>
            <p className="text-xs text-muted-foreground">@{session.user.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-3 py-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b bg-background flex items-center justify-between px-4">
          <span className="font-bold">AgileReady</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
