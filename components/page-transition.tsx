"use client";

import type { ReactNode } from "react";

export interface PageTransitionProps {
  children: ReactNode;
  /** Optional class name applied to the wrapping `<div>`. */
  className?: string;
}

/**
 * Route wrapper.
 *
 * This component used to fade the whole page out and back in on every App
 * Router route change. That competed with the per-section entrance
 * animations (every section has its own GSAP reveal), so navigating made
 * content visibly appear → vanish → appear again: a double "pop in".
 *
 * Page-level motion is now owned entirely by those section reveals, which
 * already give each page a deliberate entrance without fighting each
 * other. This wrapper is kept so the layout structure stays stable (and so
 * a page-level transition can be reintroduced later — if it is, the
 * section reveals must be delayed until it has finished).
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={className} data-page-transition="none">
      {children}
    </div>
  );
}