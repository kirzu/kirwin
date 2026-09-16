import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isLocale, type Locale } from "@/i18n.config";
import { AdminShell, type AdminNavItem } from "@/components/admin-shell";

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect(`/${locale}/admin/login`);
  }

  const adminNav: ReadonlyArray<AdminNavItem> = [
    { href: `/${locale}/admin`, label: "Dashboard" },
    { href: `/${locale}/admin/courses`, label: "Courses" },
    { href: `/${locale}/admin/blog`, label: "Testimonials" },
    { href: `/${locale}/admin/bookings`, label: "Bookings" },
    { href: `/${locale}/admin/availability`, label: "Availability" },
    { href: `/${locale}/admin/content`, label: "Content Sections" },
  ];

  const displayName =
    session?.user?.name?.trim() || session?.user?.email || "Admin";

  return (
    <AdminShell locale={locale} navItems={adminNav} userName={displayName}>
      {children}
    </AdminShell>
  );
}
