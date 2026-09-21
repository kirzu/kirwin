"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/animations/use-reduced-motion";

/**
 * A thin progress bar fixed to the very top of the viewport. The fill
 * width reflects the current scroll position relative to the total
 * scrollable height, so users get a subtle indicator of how far they
 * have read on long pages.
 *
 * Implementation notes:
 *  - Uses `transform: scaleX(...)` (GPU-friendly) instead of animating
 *    `width` so it stays cheap even on long pages.
 *  - `transform-origin: left` keeps the bar anchored to the start.
 *  - A rAF-throttled scroll handler avoids layout thrash.
 *  - When `prefers-reduced-motion: reduce` is set, the component hides
 *    itself entirely so it never introduces motion into the viewport.
 *  - `aria-hidden` keeps it out of the accessibility tree (it is purely
 *    decorative).
 */
export function ScrollProgress() {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(0);
      return;
    }
    let frame = 0;
    let cancelled = false;

    const compute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = Math.max(
        1,
        (doc.scrollHeight || 0) - (window.innerHeight || 0),
      );
      const next = Math.min(1, Math.max(0, scrollTop / max));
      setProgress(next);
    };

    const schedule = () => {
      if (cancelled) return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };

    // Initial sync.
    compute();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <div
        role="presentation"
        style={{
          transform: `scaleX(${progress})`,
          transformOrigin: "left center",
          willChange: "transform",
          height: "2px",
          width: "100%",
          background: "hsl(var(--primary))",
          transition: "transform 120ms linear",
        }}
      />
    </div>
  );
}
