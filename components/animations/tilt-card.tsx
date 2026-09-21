"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface TiltCardProps {
  children: ReactNode;
  /** Max tilt on the X axis (pitch), in degrees. Defaults to 6. */
  maxTiltX?: number;
  /** Max tilt on the Y axis (yaw), in degrees. Defaults to 6. */
  maxTiltY?: number;
  /** Perspective value applied to the wrapper. Defaults to 1000. */
  perspective?: number;
  /** Optional class names applied to the outer wrapper. */
  className?: string;
  /** Optional class names applied to the inner element that tilts. */
  innerClassName?: string;
  /** Optional inline styles for the outer wrapper. */
  style?: CSSProperties;
  /** Optional inline styles for the inner element that tilts. */
  innerStyle?: CSSProperties;
}

/**
 * 3D card tilt with a soft diagonal sheen overlay. The card rotates
 * slightly toward the cursor (capped at `maxTiltX`/`maxTiltY` degrees)
 * and the pseudo-element sheen tracks the cursor position so the
 * reflection always lands in the right place.
 *
 * Implementation:
 *  - Uses CSS `perspective`, `rotateX`, `rotateY` on the inner element
 *    so the rotation stays GPU-composited.
 *  - A `::after` pseudo-element provides the moving sheen — cheaper
 *    than layering an extra DOM node.
 *  - When `prefers-reduced-motion: reduce` is set we render a flat
 *    card with no listeners attached.
 *  - The card is rendered as a `<div>` by default; pass a different
 *    element via the `as` prop when needed (kept simple to avoid
 *    extra generic typings).
 */
export function TiltCard({
  children,
  maxTiltX = 6,
  maxTiltY = 6,
  perspective = 1000,
  className,
  innerClassName,
  style,
  innerStyle,
}: TiltCardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Inject the sheen + tilt CSS once. We use a single global stylesheet
  // keyed by `data-tilt-card="true"` so the rule scope is tight.
  useEffect(() => {
    if (reducedMotion || !hydrated) return;
    if (typeof document === "undefined") return;
    const STYLE_ID = "tilt-card-styles";
    if (document.getElementById(STYLE_ID)) return;
    const styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      [data-tilt-card="true"] {
        position: relative;
        transform-style: preserve-3d;
        will-change: transform;
        transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-tilt-card="true"] [data-tilt-sheen="true"] {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 380ms cubic-bezier(0.22, 1, 0.36, 1);
        background: radial-gradient(
          380px circle at var(--tilt-sheen-x, 50%) var(--tilt-sheen-y, 50%),
          rgba(255, 255, 255, 0.18),
          rgba(255, 255, 255, 0.04) 35%,
          transparent 60%
        );
        mix-blend-mode: screen;
      }
      [data-tilt-card-elevated="true"]:hover [data-tilt-sheen="true"] {
        opacity: 1;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-tilt-card="true"] {
          transition: none;
          transform: none !important;
        }
        [data-tilt-card="true"] [data-tilt-sheen="true"] {
          opacity: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      // Leave the stylesheet in place; multiple TiltCard instances may
      // share it and removing it could cause a flash on the others.
    };
  }, [hydrated, reducedMotion]);

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const wrapper = wrapperRef.current;
      const inner = innerRef.current;
      const sheen = sheenRef.current;
      if (!wrapper || !inner) return;
      const rect = wrapper.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width; // 0..1
      const py = (event.clientY - rect.top) / rect.height; // 0..1
      // Yaw: card yaws right when cursor is on the right. We invert the
      // sign so moving the cursor *right* tilts the card's right edge
      // toward the camera (a more natural feel).
      const rotateY = (px - 0.5) * 2 * maxTiltY;
      // Pitch: cursor near the top tilts the top edge back.
      const rotateX = (0.5 - py) * 2 * maxTiltX;
      inner.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      if (sheen) {
        sheen.style.setProperty("--tilt-sheen-x", `${(px * 100).toFixed(1)}%`);
        sheen.style.setProperty("--tilt-sheen-y", `${(py * 100).toFixed(1)}%`);
      }
    },
    [maxTiltX, maxTiltY, perspective, reducedMotion],
  );

  const handleMouseEnter = useCallback(() => {
    if (reducedMotion) return;
    // Hover state is communicated via CSS attribute so the sheen
    // selector can stay declarative.
    const wrapper = wrapperRef.current;
    if (wrapper) wrapper.setAttribute("data-tilt-card-elevated", "true");
  }, [reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (wrapper) wrapper.removeAttribute("data-tilt-card-elevated");
    if (inner) inner.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }, [reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ perspective, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        data-tilt-card="true"
        className={innerClassName}
        style={innerStyle}
      >
        {children}
        <span ref={sheenRef} data-tilt-sheen="true" aria-hidden />
      </div>
    </div>
  );
}
