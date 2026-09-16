"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  GraduationCap,
  Quote,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  BookOpenText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export interface AdminNavItem {
  href: string;
  label: string;
}

interface AdminShellProps {
  locale: string;
  navItems: ReadonlyArray<AdminNavItem>;
  userName: string;
  children: ReactNode;
}

/**
 * Visual chrome for the admin dashboard.
 *
 * Renders:
 *   - A collapsible left sidebar on `md+` viewports (persisted in
 *     component state, no SSR/local-storage tricks so the server-rendered
 *     layout stays a server component).
 *   - A top bar with a hamburger trigger on mobile that opens a
 *     `Sheet` containing the same navigation.
 *
 * All nav links share the brand palette (`brand-warm`, `sage`,
 * `terracotta`) via CSS variables defined in `app/globals.css`. The
 * active route gets a warm-toned background and an accent border on
 * the left, mirroring the visual rhythm of the public site.
 */
export function AdminShell({ locale, navItems, userName, children }: AdminShellProps) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-warm text-foreground">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          data-collapsed={collapsed}
          className={cn(
            "hidden md:flex md:flex-col md:border-r md:border-brand-sand/60 md:bg-brand-50",
            "transition-[width] duration-200 ease-out",
            collapsed ? "md:w-16" : "md:w-64"
          )}
        >
          <SidebarHeader
            locale={locale}
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
          />
          <SidebarNav
            navItems={navItems}
            currentPath={pathname}
            collapsed={collapsed}
            onNavigate={() => undefined}
          />
          <SidebarFooter locale={locale} userName={userName} collapsed={collapsed} />
        </aside>

        {/* Main column: top bar + content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-brand-sand/60 bg-background/80 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center gap-2">
              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open admin navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex w-72 flex-col gap-0 bg-brand-50 p-0"
                >
                  <SheetHeader className="border-b border-brand-sand/60 px-4 py-4">
                    <SheetTitle className="font-display text-lg text-brand-800">
                      Kirwin Admin
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {userName}
                    </p>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-3">
                    <SidebarNav
                      navItems={navItems}
                      currentPath={pathname}
                      collapsed={false}
                      onNavigate={() => setMobileOpen(false)}
                      stacked
                    />
                  </div>
                  <div className="border-t border-brand-sand/60 p-4">
                    <AdminLogoutButton locale={locale} />
                  </div>
                </SheetContent>
              </Sheet>

              <Link
                href={`/${locale}/admin`}
                className="font-display text-base font-semibold tracking-tight text-brand-800 md:hidden"
              >
                Kirwin Admin
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {userName}
              </span>
              <span className="hidden h-2 w-2 rounded-full bg-terracotta-500 sm:inline-block" aria-hidden />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarHeader({
  locale,
  collapsed,
  onToggle,
}: {
  locale: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-brand-sand/60 px-3 py-4",
        collapsed ? "justify-center" : "justify-between"
      )}
    >
      {!collapsed && (
        <Link
          href={`/${locale}/admin`}
          className="flex items-center gap-2 font-display text-base font-semibold tracking-tight text-brand-800"
        >
          <span
            className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-terracotta-500 to-brand-600"
            aria-hidden
          />
          Kirwin Admin
        </Link>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="text-brand-700 hover:bg-brand-100"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function SidebarNav({
  navItems,
  currentPath,
  collapsed,
  onNavigate,
  stacked = false,
}: {
  navItems: ReadonlyArray<AdminNavItem>;
  currentPath: string;
  collapsed: boolean;
  onNavigate: () => void;
  stacked?: boolean;
}) {
  return (
    <nav
      aria-label="Admin navigation"
      className={cn(
        "flex flex-col gap-1 p-3",
        stacked ? "" : "flex-1 overflow-y-auto"
      )}
    >
      {navItems.map((item) => {
        const isDashboard = item.href.split("/").length <= 3;
        const isActive =
          currentPath === item.href ||
          (!isDashboard && currentPath.startsWith(`${item.href}/`));
        const Icon = iconForHref(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "",
              isActive
                ? "bg-brand-100 text-brand-800 ring-1 ring-inset ring-terracotta-300/60"
                : "text-brand-800/80 hover:bg-brand-100 hover:text-brand-900"
            )}
            title={collapsed ? item.label : undefined}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center",
                isActive ? "text-terracotta-600" : "text-sage-600"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  locale,
  userName,
  collapsed,
}: {
  locale: string;
  userName: string;
  collapsed: boolean;
}) {
  return (
    <div className="border-t border-brand-sand/60 p-3">
      {collapsed ? (
        <div className="flex justify-center">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700"
          >
            {initials(userName)}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-md bg-brand-100/60 px-2 py-2">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700"
            >
              {initials(userName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-800">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <AdminLogoutButton locale={locale} />
        </div>
      )}
    </div>
  );
}

function iconForHref(href: string) {
  if (href.endsWith("/admin")) return LayoutDashboard;
  if (href.includes("/courses")) return GraduationCap;
  if (href.includes("/blog")) return Quote;
  if (href.includes("/bookings")) return CalendarDays;
  if (href.includes("/availability")) return CalendarDays;
  if (href.includes("/content")) return FileText;
  return BookOpenText;
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "A";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "A";
}
