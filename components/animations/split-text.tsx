"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface SplitTextProps {
  /** The text to split into words. */
  text: string;
  /** HTML tag for the outer wrapper. Defaults to a `span` so it
   *  composes inside an existing `<h1>` etc. without breaking flow. */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  className?: string;
  /** Stagger between adjacent words, in milliseconds. */
  stagger?: number;
  /** Distance (in px) the word travels from when hidden to when shown. */
  offset?: number;
  /** Duration of each word's reveal animation, in milliseconds. */
  duration?: number;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** IntersectionObserver threshold. Defaults to 0.2. */
  threshold?: number;
  /** Trigger the reveal only once. Defaults to true. */
  once?: boolean;
  /** Forwarded inline styles for the outer wrapper. */
  style?: CSSProperties;
}

/**
 * Luxury-style headline reveal. Splits `text` into words, wraps each in
 * its own `<span>`, and animates them in with a small vertical translate
 * + opacity transition. Triggered when the headline first enters the
 * viewport via `IntersectionObserver`.
 *
 * Behaviour:
 *  - The component renders text visibly by default (good for SSR and
 *    no-JS clients).
 *  - On the client we check if the headline is currently inside the
 *    viewport. If it is, we leave the resting state — no jarring reset
 *    for users who land on a page where the headline is already on
 *    screen. If it is below the fold, we hide the words and the
 *    IntersectionObserver animates them in once they scroll into view.
 *  - The animation uses CSS `transform` (translateY) and `opacity`
 *    only — both are GPU-friendly and avoid layout thrash.
 *  - When `prefers-reduced-motion: reduce` is set we skip the
 *    IntersectionObserver entirely and render the text immediately.
 *  - The wrapper has `aria-label={text}` and the per-word spans are
 *    `aria-hidden` so screen readers still announce the full sentence.
 */
export function SplitText({
  text,
  as = "span",
  className,
  stagger = 60,
  offset = 24,
  duration = 700,
  delay = 0,
  threshold = 0.2,
  once = true,
  style,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  // `armed` flips to true once the client effect decides whether the
  // headline should animate. Until then we render the resting state
  // (matching SSR output). `visible` tracks whether the words are
  // currently in their resting position.
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion) return;
    const node = ref.current;
    if (!node) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || 0;
    const inViewportNow = rect.top < viewportH && rect.bottom > 0;

    // If the headline is already on screen at mount time we leave it
    // visible — animating words that are already showing looks like a
    // flash. The IntersectionObserver will only run for headlines that
    // start off-screen.
    if (inViewportNow) {
      return;
    }

    // Below the fold: hide the words and observe for entry.
    setVisible(false);
    setArmed(true);

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
  }, [reducedMotion, threshold, once]);

  const Tag = as as ElementType;
  const words = text.split(" ");
  const hidden = armed && !visible && !reducedMotion;

  const baseStyle: CSSProperties = {
    ...style,
    ["--split-stagger" as keyof CSSProperties]: `${stagger}ms`,
    ["--split-duration" as keyof CSSProperties]: `${duration}ms`,
    ["--split-delay" as keyof CSSProperties]: `${delay}ms`,
    ["--split-offset" as keyof CSSProperties]: `${offset}px`,
  };

  return (
    <Tag
      ref={ref as never}
      aria-label={text}
      className={className}
      style={baseStyle}
      data-split-text={visible ? "in" : "out"}
    >
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span
            key={`${word}-${i}`}
            aria-hidden="true"
            data-split-word
            style={{
              display: "inline-block",
              willChange:
                armed && !reducedMotion ? "transform, opacity" : undefined,
              transform: hidden
                ? "translate3d(0, var(--split-offset), 0)"
                : "translate3d(0, 0, 0)",
              opacity: hidden ? 0 : 1,
              transition: armed
                ? reducedMotion
                  ? "none"
                  : `transform var(--split-duration) cubic-bezier(0.22, 1, 0.36, 1) calc(var(--split-delay) + (var(--split-i) * var(--split-stagger))), opacity var(--split-duration) cubic-bezier(0.22, 1, 0.36, 1) calc(var(--split-delay) + (var(--split-i) * var(--split-stagger)))`
                : "none",
              ["--split-i" as keyof CSSProperties]: i,
            }}
          >
            {word}
            {!isLast ? "\u00A0" : null}
          </span>
        );
      })}
    </Tag>
  );
}
