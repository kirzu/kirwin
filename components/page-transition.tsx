"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/animations/use-reduced-motion";

export interface PageTransitionProps {
  children: ReactNode;
  /**
   * Outgoing fade-out duration in milliseconds. Defaults to 200.
   * Keep this short so route changes never feel slow.
   */
  exitDuration?: number;
  /**
   * Incoming fade-in duration in milliseconds. Defaults to 200.
   */
  enterDuration?: number;
  /** Optional class name applied to the wrapping `<div>`. */
  className?: string;
}

/**
 * Lightweight wrapper that fades the page content out then back in on
 * every App Router route change.
 *
 * Implementation notes:
 *  - We use `usePathname()` to detect route changes (the App Router does
 *    not expose a `useRouter` "route change start/end" event).
 *  - On each route change we briefly set `opacity: 0` and translateY the
 *    content a few pixels, then restore it. Both transitions run on
 *    `transform` and `opacity`, which are GPU-composited and never
 *    trigger layout.
 *  - When `prefers-reduced-motion: reduce` is set we skip the animation
 *    entirely — the children render at full opacity from the start.
 *  - The transition is purely cosmetic and never delays navigation: it
 *    runs alongside the App Router's normal swap.
 *
 * The wrapper renders as a single `<div>` so the rest of the layout is
 * untouched; pages that need their own element type can be wrapped
 * manually.
 */
export function PageTransition({
  children,
  exitDuration = 200,
  enterDuration = 200,
  className,
}: PageTransitionProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [opacity, setOpacity] = useState<number>(1);
  const [translateY, setTranslateY] = useState<number>(0);
  const previousPath = useRef<string>(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setOpacity(1);
      setTranslateY(0);
      previousPath.current = pathname;
      return;
    }
    // Only animate after the first render — the initial mount shouldn't
    // animate, only subsequent route changes should.
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    // Clear any in-flight timer so we don't end up with overlapping
    // transitions on rapid back/forward navigation.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setOpacity(0);
    setTranslateY(8);
    timeoutRef.current = setTimeout(() => {
      setOpacity(1);
      setTranslateY(0);
      timeoutRef.current = null;
    }, exitDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pathname, exitDuration, reducedMotion]);

  // When motion is reduced we still keep the wrapper (it doesn't change
  // visual output) so the rest of the layout is identical.
  return (
    <div
      className={className}
      style={{
        opacity: reducedMotion ? 1 : opacity,
        transform: reducedMotion ? "none" : `translate3d(0, ${translateY}px, 0)`,
        transition: reducedMotion
          ? "none"
          : `opacity ${enterDuration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${enterDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: reducedMotion ? undefined : "opacity, transform",
      }}
      data-page-transition={reducedMotion ? "reduced" : "default"}
    >
      {children}
    </div>
  );
}
