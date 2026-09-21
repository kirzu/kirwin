"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface MagneticButtonProps {
  children: React.ReactNode;
  /** Maximum translation, in pixels. The button will move by no more
   *  than this value on either axis when hovered. Defaults to 8. */
  strength?: number;
  /** Optional class names applied to the outer wrapper. */
  className?: string;
  /** Optional class names applied to the inner element that actually
   *  moves. Use this when the wrapper handles layout (e.g. flex) and
   *  the inner should follow the cursor. */
  innerClassName?: string;
  /** Optional inline styles for the outer wrapper. */
  style?: CSSProperties;
  /** Optional inline styles for the inner element that moves. */
  innerStyle?: CSSProperties;
  /** Forwarded mouse event handlers. */
  onMouseEnter?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  "data-testid"?: string;
}

/**
 * Subtle magnetic hover effect. The wrapped button translates a small
 * amount toward the cursor while it is over the element, then springs
 * back to its origin on `mouseleave`.
 *
 * Implementation:
 *  - We translate the inner element by up to `strength` px on each
 *    axis, based on the cursor position normalised against half the
 *    element's width/height. So the strongest pull is at the edges.
 *  - The eased rAF loop smooths pointer jitter so the visible motion
 *    never looks frantic, even on coarse pointers.
 *  - When the user prefers reduced motion, the component renders its
 *    children statically (no transform listeners) and exits early.
 *  - The wrapper is intentionally non-interactive — it forwards its
 *    children (e.g. a `<Button asChild>`) unchanged so accessibility
 *    and click handling are preserved.
 */
export function MagneticButton({
  children,
  strength = 8,
  className,
  innerClassName,
  style,
  innerStyle,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick,
  "data-testid": dataTestId,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();
  // `0, 0` means no pull yet; we only mutate via rAF so the JSX stays
  // cheap to re-render.
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  // We use a state flag only to force a single render once we attach
  // the rAF loop, so the React tree matches SSR when reduced motion is
  // on.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const cancelLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Clean up the rAF on unmount.
  useEffect(() => () => cancelLoop(), [cancelLoop]);

  // The animation loop runs only while the mouse is over the element.
  // It eases the inner element's transform toward the latest target so
  // pointer jitter is smoothed out before it lands on screen.
  useEffect(() => {
    if (reducedMotion || !hydrated) return;
    const inner = innerRef.current;
    if (!inner) return;
    if (!hoveringRef.current) return;
    if (rafRef.current != null) return;

    const ease = () => {
      const dx = targetRef.current.x - offsetRef.current.x;
      const dy = targetRef.current.y - offsetRef.current.y;
      // Critical damping factor — small enough to feel springy, large
      // enough to land without overshoot.
      const k = 0.18;
      offsetRef.current.x += dx * k;
      offsetRef.current.y += dy * k;
      inner.style.transform = `translate3d(${offsetRef.current.x.toFixed(
        2,
      )}px, ${offsetRef.current.y.toFixed(2)}px, 0)`;
      if (
        hoveringRef.current ||
        Math.abs(dx) > 0.05 ||
        Math.abs(dy) > 0.05
      ) {
        rafRef.current = requestAnimationFrame(ease);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(ease);
    return cancelLoop;
  }, [cancelLoop, hydrated, reducedMotion]);

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const halfW = rect.width / 2 || 1;
      const halfH = rect.height / 2 || 1;
      // Position normalised against the centre, clamped to [-1, 1].
      const nx = Math.max(
        -1,
        Math.min(1, (event.clientX - rect.left - halfW) / halfW),
      );
      const ny = Math.max(
        -1,
        Math.min(1, (event.clientY - rect.top - halfH) / halfH),
      );
      targetRef.current = { x: nx * strength, y: ny * strength };
      hoveringRef.current = true;
      onMouseMove?.(event);
    },
    [onMouseMove, reducedMotion, strength],
  );

  const handleMouseEnter = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      hoveringRef.current = true;
      onMouseEnter?.(event);
    },
    [onMouseEnter, reducedMotion],
  );

  const handleMouseLeave = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!reducedMotion) {
        hoveringRef.current = false;
        // Target returns to origin; the rAF loop in the effect eases
        // the visible transform back to zero.
        targetRef.current = { x: 0, y: 0 };
      }
      onMouseLeave?.(event);
    },
    [onMouseLeave, reducedMotion],
  );

  // The `transition` on the inner element gives the release (mouse
  // leave) a refined landing curve. The rAF loop is what gives the
  // follow (mouse move) its springy feel.
  const innerStyleMerged: CSSProperties = {
    ...innerStyle,
    display: "inline-block",
    willChange: reducedMotion ? undefined : "transform",
    transition: reducedMotion
      ? "none"
      : "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
    transform: "translate3d(0, 0, 0)",
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ display: "inline-block", ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <span ref={innerRef} className={innerClassName} style={innerStyleMerged}>
        {children}
      </span>
    </div>
  );
}
