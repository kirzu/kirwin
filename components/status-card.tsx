"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual variants for `StatusCard`.
 *
 * Each variant maps to a tone in the brand palette (sage / terracotta /
 * brand) so the same component can express a confirmed booking, a
 * pending payment, a missing reference, or a soft error without
 * callers having to hand-roll palettes.
 */
export type StatusCardVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending";

/**
 * Shared status card used by the booking confirmation and payment
 * success / cancel flows.
 *
 * Visual contract:
 *   - Rounded, elevated container with a coloured left rail and a
 *     circular icon badge.
 *   - Title + message render in a heading + supporting copy layout.
 *   - Optional `children` slot below the message for additional
 *     detail blocks (e.g. the booking reference grid).
 *   - Optional `footer` slot for secondary actions.
 *
 * Motion:
 *   - Uses GSAP (`useGSAP`) for a one-shot fade + scale entrance
 *     so the card never appears abruptly when the page hydrates.
 *     The animation is suppressed during server rendering and when
 *     `animate={false}` is passed, which keeps `renderToStaticMarkup`
 *     test paths deterministic.
 */
export interface StatusCardProps {
  variant?: StatusCardVariant;
  icon?: LucideIcon;
  title?: ReactNode;
  message?: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  testId?: string;
  animate?: boolean;
}

type VariantConfig = {
  Icon: LucideIcon;
  rail: string;
  surface: string;
  badge: string;
  ring: string;
  accent: string;
};

const variantConfig: Record<StatusCardVariant, VariantConfig> = {
  success: {
    Icon: CheckCircle2,
    rail: "from-sage-500/80 via-sage-400/60 to-transparent",
    surface: "border-sage-200/70 bg-gradient-to-br from-sage-50 via-card to-card",
    badge: "bg-sage-600 text-white",
    ring: "ring-sage-200",
    accent: "text-sage-700",
  },
  pending: {
    Icon: AlertCircle,
    rail: "from-brand-500/80 via-brand-400/60 to-transparent",
    surface: "border-brand-200/70 bg-gradient-to-br from-brand-50 via-card to-card",
    badge: "bg-brand-600 text-white",
    ring: "ring-brand-200",
    accent: "text-brand-700",
  },
  warning: {
    Icon: AlertCircle,
    rail: "from-brand-500/80 via-brand-300/60 to-transparent",
    surface: "border-brand-200 bg-gradient-to-br from-brand-50 via-card to-card",
    badge: "bg-brand-500 text-white",
    ring: "ring-brand-300",
    accent: "text-brand-700",
  },
  error: {
    Icon: XCircle,
    rail: "from-terracotta-500/80 via-terracotta-400/60 to-transparent",
    surface:
      "border-terracotta-200/70 bg-gradient-to-br from-terracotta-50 via-card to-card",
    badge: "bg-terracotta-600 text-white",
    ring: "ring-terracotta-200",
    accent: "text-terracotta-700",
  },
  info: {
    Icon: Info,
    rail: "from-brand-400/80 via-brand-300/60 to-transparent",
    surface: "border-brand-200/70 bg-gradient-to-br from-brand-50/80 via-card to-card",
    badge: "bg-brand-600 text-white",
    ring: "ring-brand-200",
    accent: "text-brand-700",
  },
};

export function StatusCard({
  variant = "success",
  icon,
  title,
  message,
  eyebrow,
  children,
  footer,
  className,
  contentClassName,
  testId,
  animate = true,
}: StatusCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const Icon = icon ?? config.Icon;

  useGSAP(
    () => {
      if (!animate) return;
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, scale: 0.96, y: 16 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
          },
        );
      }
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { opacity: 0, scale: 0.6, rotate: -8 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.7,
            delay: 0.15,
            ease: "back.out(1.6)",
          },
        );
      }
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-testid={testId}
      data-status-variant={variant}
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-sm",
        config.surface,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b",
          config.rail,
        )}
      />
      <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-start sm:gap-6 sm:px-8 sm:py-9">
        <div
          ref={iconRef}
          className={cn(
            "flex h-14 w-14 flex-none items-center justify-center rounded-full shadow-sm ring-4 ring-inset",
            config.badge,
            config.ring,
          )}
        >
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className={cn("flex-1 space-y-3", contentClassName)}>
          {eyebrow ? (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.18em]",
                config.accent,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          ) : null}
          {message ? (
            <p className="max-w-prose text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          ) : null}
          {children}
        </div>
      </div>
      {footer ? (
        <div className="border-t border-border/60 bg-background/40 px-6 py-4 sm:px-8">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compact "loading" state that mirrors the StatusCard layout but
 * pulses instead of animating in. Useful for the gating placeholder
 * the static booking-confirmation shell renders while the client
 * component resolves the booking lookup.
 */
export function StatusCardSkeleton({
  message,
  className,
}: {
  message?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 px-6 py-6 shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 flex-none animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded-full bg-muted/70" />
        {message ? (
          <p className="pt-2 text-xs leading-5 text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
