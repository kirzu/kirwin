"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface ImageRevealProps {
  children: ReactNode;
  /** Reveal direction. `"left"` wipes a clip-path mask from the right
   *  edge to the left; `"right"` (default) wipes from left to right. */
  direction?: "left" | "right";
  /** Reveal duration in milliseconds. Defaults to 900. */
  duration?: number;
  /** IntersectionObserver threshold. Defaults to 0.2. */
  threshold?: number;
  /** Trigger the reveal only once. Defaults to true. */
  once?: boolean;
  /** Optional class names applied to the wrapper. */
  className?: string;
  /** Optional inline styles for the wrapper. */
  style?: CSSProperties;
}

/**
 * Mask reveal for large imagery. The wrapper starts clipped (the image
 * is fully hidden by an inset mask), and once it enters the viewport
 * the clip-path animates back to `inset(0)` so the image slides into
 * view.
 *
 * Implementation:
 *  - Uses `clip-path: inset(...)` so the reveal stays GPU-composited
 *    and avoids reflow.
 *  - Transitions use the luxury curve `cubic-bezier(0.22, 1, 0.36, 1)`
 *    so the motion feels weighted.
 *  - When `prefers-reduced-motion: reduce` is set the clip-path is
 *    never applied, so the children render fully visible from first
 *    paint.
 *  - `overflow: hidden` on the wrapper is left to the parent so the
 *    component composes cleanly with rounded masks etc.
 */
export function ImageReveal({
  children,
  direction = "right",
  duration = 900,
  threshold = 0.2,
  once = true,
  className,
  style,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      // No animation; render the children fully visible from the start.
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, reducedMotion, threshold]);

  const clipPath = (() => {
    if (reducedMotion || visible) return "inset(0 0 0 0)";
    // Hide the image before the reveal kicks in. Direction determines
    // which edge the mask retreats from.
    return direction === "right" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
  })();

  const mergedStyle: CSSProperties = {
    ...style,
    clipPath,
    WebkitClipPath: clipPath,
    transition: reducedMotion
      ? "none"
      : `clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), -webkit-clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: reducedMotion ? undefined : "clip-path",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={mergedStyle}
      data-image-reveal={visible ? "in" : "out"}
    >
      {children}
    </div>
  );
}
