import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isLocale, type Locale } from "@/i18n.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Accent = "brand" | "sage" | "terracotta";

interface QuickLink {
  href: string;
  title: string;
  description: string;
  accent: Accent;
}

const accentMap: Record<
  Accent,
  { bar: string; hover: string; link: string }
> = {
  brand: {
    bar: "bg-brand-500",
    hover: "hover:bg-brand-50/60",
    link: "text-brand-700",
  },
  sage: {
    bar: "bg-sage-500",
    hover: "hover:bg-sage-50/60",
    link: "text-sage-700",
  },
  terracotta: {
    bar: "bg-terracotta-500",
    hover: "hover:bg-terracotta-50/60",
    link: "text-terracotta-700",
  },
};

export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const session = await getServerSession(authOptions);
  const displayName =
    session?.user?.name?.trim() || session?.user?.email || "Admin";

  const quickLinks: ReadonlyArray<QuickLink> = [
    {
      href: `/${locale}/admin/courses`,
      title: "Courses",
      description: "Create, edit, and publish training course listings.",
      accent: "brand",
    },
    {
      href: `/${locale}/admin/blog`,
      title: "Testimonials",
      description: "Manage client testimonials shown on the public site.",
      accent: "terracotta",
    },
    {
      href: `/${locale}/admin/content`,
      title: "Content Sections",
      description: "Edit reusable site copy and content blocks.",
      accent: "sage",
    },
    {
      href: `/${locale}/admin/bookings`,
      title: "Bookings",
      description: "Review bookings and update their statuses.",
      accent: "brand",
    },
    {
      href: `/${locale}/admin/availability`,
      title: "Availability",
      description: "Schedule upcoming seminar sessions and seats.",
      accent: "terracotta",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-brand-sand/60 bg-gradient-to-br from-brand-50 via-background to-sage-50 px-6 py-10 md:px-10 md:py-12">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-terracotta-200/60 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-sage-200/60 blur-3xl"
        />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-terracotta-700">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
            Admin
          </span>
          <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
            Welcome back, {displayName}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Manage courses, testimonials, site content, bookings, and availability
            from one place. The palette below helps you spot what each section
            handles at a glance.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-tight text-brand-800">
          Jump into a section
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => {
            const accent = accentMap[item.accent];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card
                  className={cn(
                    "group h-full border-brand-sand/60 bg-background transition-all hover:-translate-y-0.5 hover:shadow-md",
                    accent.hover
                  )}
                >
                  <CardHeader>
                    <span
                      className={cn("inline-flex h-2 w-12 rounded-full", accent.bar)}
                      aria-hidden
                    />
                    <CardTitle className="text-brand-900">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span
                      className={cn(
                        "text-sm font-medium group-hover:underline",
                        accent.link
                      )}
                    >
                      Open {item.title.toLowerCase()} →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
