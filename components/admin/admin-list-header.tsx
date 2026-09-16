import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "sage" | "terracotta";

const accentMap: Record<Accent, { dot: string; text: string }> = {
  brand: {
    dot: "bg-brand-500",
    text: "text-brand-700",
  },
  sage: {
    dot: "bg-sage-500",
    text: "text-sage-700",
  },
  terracotta: {
    dot: "bg-terracotta-500",
    text: "text-terracotta-700",
  },
};

interface AdminListHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  accent?: Accent;
  actions?: ReactNode;
}

/**
 * Shared header used by admin list pages (courses, blog, bookings,
 * availability, content). Mirrors the hero card on the admin dashboard
 * with a soft gradient, an accent dot, display-font title, and a slot
 * for primary actions like "Create" buttons.
 */
export function AdminListHeader({
  eyebrow,
  title,
  description,
  accent = "brand",
  actions,
}: AdminListHeaderProps) {
  const accentClass = accentMap[accent];
  return (
    <section className="relative overflow-hidden rounded-2xl border border-brand-sand/60 bg-gradient-to-br from-brand-50 via-background to-sage-50 px-6 py-8 md:px-8 md:py-10">
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-terracotta-200/60 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-sage-200/60 blur-3xl"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-current/20 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wider",
              accentClass.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", accentClass.dot)} />
            {eyebrow}
          </span>
          <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

const tableAccentMap: Record<Accent, { bar: string; row: string }> = {
  brand: {
    bar: "from-brand-500 to-sage-500",
    row: "hover:bg-brand-50/60",
  },
  sage: {
    bar: "from-sage-500 to-brand-500",
    row: "hover:bg-sage-50/70",
  },
  terracotta: {
    bar: "from-terracotta-500 to-brand-500",
    row: "hover:bg-terracotta-50/60",
  },
};

interface AdminListTableProps {
  children: ReactNode;
  accent?: Accent;
}

/**
 * Wraps admin list tables with a rounded card, an accent gradient bar,
 * and consistent spacing. Table rows are expected to apply the
 * `admin-row` hover class themselves.
 */
export function AdminListTable({ children, accent = "brand" }: AdminListTableProps) {
  const accentClass = tableAccentMap[accent];
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-sand/60 bg-background shadow-sm">
      <div
        aria-hidden
        className={cn(
          "h-1 w-full bg-gradient-to-r",
          accentClass.bar
        )}
      />
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

interface AdminTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  accent?: Accent;
}

/**
 * Styled table row with a brand-palette hover background and a subtle
 * transition. Use anywhere admin list pages render `<tr>`.
 */
export function AdminTableRow({
  className,
  accent = "brand",
  ...props
}: AdminTableRowProps) {
  const accentClass = tableAccentMap[accent];
  return (
    <tr
      className={cn(
        "align-top transition-colors duration-200",
        accentClass.row,
        className
      )}
      {...props}
    />
  );
}
