import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionEyebrowProps {
  /**
   * Eyebrow text. Should be short (1–3 words). Pass either a literal
   * string or an already-translated node from `useTranslations`.
   */
  children: ReactNode;
  /**
   * Optional element type override. Defaults to a `<p>` so it sits
   * naturally between the section wrapper and the heading.
   */
  as?: "p" | "span" | "div";
  /** Optional extra class names. */
  className?: string;
}

/**
 * Small editorial-style label that sits above a major section heading.
 *
 * Renders as uppercase, widely-tracked, muted copy so it reads like a
 * magazine kicker rather than a UI chip. Designed to live in the gap
 * between a section heading and the body copy so it never duplicates
 * eyebrow text already rendered by the section itself.
 */
export function SectionEyebrow({
  children,
  as: Component = "p",
  className,
}: SectionEyebrowProps) {
  return (
    <Component
      className={cn(
        "text-xs uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </Component>
  );
}
