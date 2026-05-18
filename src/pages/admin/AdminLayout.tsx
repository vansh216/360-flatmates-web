import { Outlet } from "react-router";
import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import {
  BarChart3,
  Flag,
  Shield
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn, focusRing } from "@/components/ui/component-utils";

interface AdminNavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: "Stats",
    href: "/admin/stats",
    icon: <BarChart3 aria-hidden="true" className="h-5 w-5" />
  },
  {
    label: "Listing Queue",
    href: "/admin/moderation/listings",
    icon: <Shield aria-hidden="true" className="h-5 w-5" />
  },
  {
    label: "Reports",
    href: "/admin/moderation/reports",
    icon: <Flag aria-hidden="true" className="h-5 w-5" />
  }
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-paper-2 p-3 xl:flex">
        <div className="flex h-14 items-center px-2">
          <Logo compact />
          <span className="ml-3 text-label-lg text-ink-3">Admin</span>
        </div>
        <nav aria-label="Admin navigation" className="mt-5 flex flex-1 flex-col gap-1">
          {adminNavItems.map((item) => (
            <AdminNavLink key={item.href} item={item} active={location.pathname === item.href} />
          ))}
        </nav>
      </aside>

      <div className="min-h-screen xl:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper px-5 md:px-6">
          <div className="xl:hidden">
            <Logo compact />
            <span className="ml-2 text-label-lg text-ink-3">Admin</span>
          </div>
          <nav
            aria-label="Mobile admin navigation"
            className="ml-auto flex items-center gap-1 xl:hidden"
          >
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-[9px] px-3 py-2 text-label-md text-ink-3 hover:bg-paper-3 hover:text-ink",
                  location.pathname === item.href && "bg-accent-soft text-accent",
                  focusRing
                )}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </header>
        <main className="min-h-[calc(100vh-64px)] px-5 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  return (
    <Link
      to={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-body-md font-semibold hover:bg-paper-3 hover:text-ink",
        active ? "bg-accent-soft text-accent" : "text-ink-3",
        focusRing
      )}
    >
      {item.icon}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
