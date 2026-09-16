"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

/**
 * Public-site navigation bar.
 *
 * Renders the five public pages (Home, About, Courses, Testimonials,
 * Contact) as a list of links. The current route is detected via
 * `usePathname` and the matching link is given `aria-current="page"`
 * plus an active style so it reads as the active item.
 *
 * `orientation` controls the visual style:
 *   - `"horizontal"` (default): desktop header bar — small, dimmed
 *     text with a bottom border that fills with the primary colour on
 *     hover or when active.
 *   - `"vertical"`: mobile drawer — large, full-width rows with a
 *     ≥44px tap target (`min-h-11 py-3`) so the menu is comfortable
 *     to use on touch devices.
 *
 * Translations are passed in as already-resolved strings from the
 * server-rendered layout, keeping this component free of
 * `next-intl/server` imports.
 */
export function MainNav({
  locale,
  labels,
  orientation = "horizontal",
  onNavigate,
}: {
  locale: Locale;
  labels: {
    home: string;
    about: string;
    courses: string;
    testimonials: string;
    contact: string;
  };
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";

  const items: { href: string; key: keyof typeof labels }[] = [
    { href: `/${locale}`, key: "home" },
    { href: `/${locale}/about`, key: "about" },
    { href: `/${locale}/courses`, key: "courses" },
    { href: `/${locale}/testimonials`, key: "testimonials" },
    { href: `/${locale}/contact`, key: "contact" },
  ];

  const isVertical = orientation === "vertical";

  return (
    <ul
      className={cn(
        "text-zinc-700 dark:text-zinc-300",
        isVertical
          ? "flex flex-col gap-1"
          : "flex items-center gap-4"
      )}
    >
      {items.map(({ href, key }) => {
        const isActive = isActiveRoute(pathname, href, locale, key);
        const linkClass = isVertical
          ? isActive
            ? "block w-full rounded-sm border-l-4 border-primary bg-primary/10 px-4 py-3 min-h-11 text-base font-medium text-primary"
            : "block w-full rounded-sm border-l-4 border-transparent px-4 py-3 min-h-11 text-base font-medium text-zinc-800 transition-colors hover:bg-muted hover:text-primary dark:text-zinc-100"
          : isActive
          ? "border-b-2 border-primary pb-1 text-primary transition-colors"
          : "border-b-2 border-transparent pb-1 transition-colors hover:text-primary";
        return (
          <li key={key} className={isVertical ? "w-full" : undefined}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={linkClass}
            >
              {labels[key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Returns true when the current pathname matches the link target.
 *
 * The Home link (`/{locale}`) is only active on the exact root, not on
 * every nested route — otherwise it would steal the active state from
 * the About/Courses/etc links.
 */
function isActiveRoute(
  pathname: string,
  href: string,
  locale: Locale,
  key: "home" | "about" | "courses" | "testimonials" | "contact",
): boolean {
  if (key === "home") {
    return pathname === `/${locale}` || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
