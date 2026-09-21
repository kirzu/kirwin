"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/animations/use-reduced-motion";

/**
 * Public-site navigation bar.
 *
 * Renders the public pages (Home, About, Courses, Book, Testimonials,
 * Contact) as a list of links. The current route is detected via
 * `usePathname` and the matching link is given `aria-current="page"`
 * plus an active style so it reads as the active item.
 *
 * `orientation` controls the visual style:
 *   - `"horizontal"` (default): desktop header bar — small, dimmed
 *     text with a bottom border that fills with the primary colour on
 *     hover or when active. Hovering/focusing a link slides the
 *     visible label up and out while a duplicate label slides up from
 *     below into its place (text-swap effect).
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
    bookings: string;
    testimonials: string;
    contact: string;
  };
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const reducedMotion = useReducedMotion();

  const items: { href: string; key: keyof typeof labels }[] = [
    { href: `/${locale}`, key: "home" },
    { href: `/${locale}/about`, key: "about" },
    { href: `/${locale}/courses`, key: "courses" },
    { href: `/${locale}/bookings`, key: "bookings" },
    { href: `/${locale}/testimonials`, key: "testimonials" },
    { href: `/${locale}/contact`, key: "contact" },
  ];

  const isVertical = orientation === "vertical";

  return (
    <ul
      className={cn(
        "text-zinc-700 dark:text-zinc-300",
        isVertical ? "flex flex-col gap-1" : "flex items-center gap-4",
      )}
    >
      {items.map(({ href, key }) => {
        const isActive = isActiveRoute(pathname, href, locale, key);
        const linkClass = isVertical
          ? isActive
            ? "block w-full rounded-sm border-l-4 border-primary bg-primary/10 px-4 py-3 min-h-11 text-base font-medium text-primary"
            : "block w-full rounded-sm border-l-4 border-transparent px-4 py-3 min-h-11 text-base font-medium text-zinc-800 transition-colors hover:bg-muted hover:text-primary dark:text-zinc-100"
          : [
              "group nav-text-swap link-underline relative inline-flex items-center pb-1 text-sm font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-zinc-700 hover:text-primary dark:text-zinc-300",
              reducedMotion ? "nav-text-swap--reduced" : "",
            ].join(" ");
        return (
          <li key={key} className={isVertical ? "w-full" : undefined}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={linkClass}
            >
              <span className="nav-text-swap__track">
                <span className="nav-text-swap__layer">
                  {labels[key]}
                </span>
                <span
                  aria-hidden="true"
                  className="nav-text-swap__layer nav-text-swap__layer--alt"
                >
                  {labels[key]}
                </span>
              </span>
              {!isVertical ? (
                <span
                  aria-hidden
                  className={[
                    "nav-underline pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary",
                    isActive
                      ? "nav-underline--active scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                  ].join(" ")}
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Returns true when the current pathname matches the link target.
 */
function isActiveRoute(
  pathname: string,
  href: string,
  locale: Locale,
  key: "home" | "about" | "courses" | "bookings" | "testimonials" | "contact",
): boolean {
  if (key === "home") {
    return pathname === `/${locale}` || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
