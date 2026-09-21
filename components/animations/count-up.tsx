"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface CountUpProps {
  /** The numeric value to count up to. */
  value: number;
  /** Optional prefix rendered before the number (e.g. "HK$"). */
  prefix?: string;
  /** Optional suffix rendered after the number (e.g. "+", " years"). */
  suffix?: string;
  /** Animation duration in seconds. Defaults to 1.6. */
  duration?: number;
  /** IntersectionObserver threshold. Defaults to 0.3. */
  threshold?: number;
  /** Optional className applied to the rendered <span>. */
  className?: string;
}

/**
 * Lightweight count-up animation. Animates from 0 to `value` when the
 * element first scrolls into view, using `requestAnimationFrame` and
 * an easing curve so it feels natural without any animation library.
 *
 * Behaviour:
 *  - When `prefers-reduced-motion: reduce` is set, the final value is
 *    rendered immediately and no observer is attached.
 *  - When `IntersectionObserver` is not available (e.g. in jsdom test
 *    environments), the final value is rendered immediately so tests
 *    and SSR snapshots still see the readable number.
 *  - Animation only uses transform/opacity indirectly (we tween the
 *    text content via rAF), so it is safe and GPU-friendly.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
  threshold = 0.3,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  // Default to 0 so the count-up plays from the start and never flashes
  // the final value. Width is reserved with tabular-nums + min-width to
  // prevent the surrounding sentence from reflowing as digits change.
  const [display, setDisplay] = useState<number>(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) {
      setDisplay(value);
      return;
    }
    let rafId = 0;
    let disconnected = false;
    const reducedFallback = () => setDisplay(value);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || disconnected) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = (now - start) / 1000;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic — fast start, soft landing.
          const eased = 1 - Math.pow(1 - progress, 3);
          const next = Math.round(eased * value);
          setDisplay(next);
          if (progress < 1 && !disconnected) {
            rafId = requestAnimationFrame(tick);
          } else {
            setDisplay(value);
          }
        };
        rafId = requestAnimationFrame(tick);
      },
      { threshold },
    );

    observer.observe(node);
    return () => {
      disconnected = true;
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      // Defensive fallback: ensure the final value is committed before
      // unmount so partial renders don't survive into tests or HMR.
      reducedFallback();
    };
  }, [value, duration, threshold, reducedMotion]);

  const digits = value.toString().length;

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums ${className ?? ""}`}
      style={{ minWidth: `${digits}ch` }}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/**
 * Convenience wrapper that takes a string like `"29+ years of clinical
 * practice"` and animates the leading numeric prefix. Strings without a
 * leading number render unchanged.
 *
 * Parsing rules:
 *  - Captures the first run of digits in the string.
 *  - Everything before the digits becomes the prefix; everything after
 *    becomes the suffix (so `"1995–1998"` keeps both years in the suffix).
 *  - Years and ranges inside parentheses also animate cleanly.
 */
export interface AnimatedStatProps {
  children: string;
  className?: string;
  duration?: number;
}

export function AnimatedStat({
  children,
  className,
  duration,
}: AnimatedStatProps): ReactNode {
  const match = children.match(/^([^\d]*)(\d+)([\s\S]*)$/);
  if (!match) {
    return <span className={className}>{children}</span>;
  }
  const [, textPrefix, numericText, textSuffix] = match;
  const numericValue = Number(numericText);
  if (!Number.isFinite(numericValue)) {
    return <span className={className}>{children}</span>;
  }
  return (
    <span className={className}>
      {textPrefix}
      <CountUp value={numericValue} suffix={textSuffix} duration={duration} />
    </span>
  );
}
