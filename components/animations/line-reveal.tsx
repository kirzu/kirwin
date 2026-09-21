"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface LineRevealProps {
  /** Optional wrapper className for the container. */
  className?: string;
  /**
   * Orientation of the line. Defaults to `"horizontal"` so callers can
   * use the component to replace a `border-t` divider without changing
   * surrounding layout.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Length of the line as a CSS value (`"100%"`, `"3rem"`, etc.).
   * Defaults to `100%` for horizontal and `"1.5rem"` for vertical.
   */
  length?: string;
  /** Line thickness in px. Defaults to 1. */
  thickness?: number;
  /**
   * Colour override. Defaults to `hsl(var(--border))` so the line
   * matches the existing border palette.
   */
  color?: string;
  /** Reveal duration in milliseconds. Defaults to 900. */
  duration?: number;
  /** IntersectionObserver threshold. Defaults to 0.5. */
  threshold?: number;
  /** Reveal only once. Defaults to true. */
  once?: boolean;
  /** Optional inline style forwarded to the line element. */
  style?: CSSProperties;
}

/**
 * Animated horizontal/vertical divider that scales from 0 → 1 along its
 * primary axis when it scrolls into view. Used to replace prominent
 * `border-t` dividers between major sections with a quiet, luxury
 * flourish.
 *
 * Implementation notes:
 *  - The line is a single absolutely-positioned span. Its primary axis
 *    is driven by `transform: scaleX(...)` (horizontal) or
 *    `scaleY(...)` (vertical), both of which are GPU-friendly and
 *    never trigger layout.
 *  - `transform-origin` is set so the line grows from the start edge
 *    rather than from the centre.
 *  - When `prefers-reduced-motion: reduce` is set, the line renders
 *    immediately at its final length without any transition.
 *  - The wrapper has `aria-hidden` so screen readers don't treat the
 *    decorative line as a separator element.
 *
 * The default SSR render has the line fully scaled (length). On the
 * client we set `visible=false` if the line is below the fold and let
 * the IntersectionObserver reveal it once it scrolls into view. This
 * keeps the markup stable between server and client and avoids a
 * hydration warning.
 */
export function LineReveal({
  className,
  orientation = "horizontal",
  length,
  thickness = 1,
  color = "hsl(var(--border))",
  duration = 900,
  threshold = 0.5,
  once = true,
  style,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  // Default `visible` to true so SSR/prerendered pages ship the line
  // already painted. We only flip it to false on the client if the line
  // is below the fold and we have not opted out of motion.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    // Hide the line on first paint if it is currently off-screen so the
    // animation actually plays when the user scrolls it into view.
    const rect = node.getBoundingClientRect();
    const inView =
      orientation === "horizontal"
        ? rect.top < window.innerHeight && rect.bottom > 0
        : rect.left < window.innerWidth && rect.right > 0;
    if (inView) {
      setVisible(true);
      return;
    }
    setVisible(false);
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
  }, [once, orientation, reducedMotion, threshold]);

  const resolvedLength =
    length ?? (orientation === "horizontal" ? "100%" : "1.5rem");

  const isHorizontal = orientation === "horizontal";
  const wrapperStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    width: isHorizontal ? "100%" : `${thickness}px`,
    height: isHorizontal ? `${thickness}px` : resolvedLength,
    ...style,
  };

  const transform = reducedMotion
    ? "scaleX(1)"
    : visible
      ? isHorizontal
        ? "scaleX(1)"
        : "scaleY(1)"
      : isHorizontal
        ? "scaleX(0)"
        : "scaleY(0)";
  const transformOrigin = isHorizontal ? "left center" : "center top";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={wrapperStyle}
      data-line-reveal={visible ? "in" : "out"}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          transform,
          transformOrigin,
          transition: reducedMotion
            ? "none"
            : `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: reducedMotion ? undefined : "transform",
        }}
      />
    </div>
  );
}
