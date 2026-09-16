"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns `true` when the user has asked the OS to reduce motion.
 *
 * The hook subscribes to changes so animations can be enabled if the
 * user toggles the OS preference at runtime. During SSR / in a Node
 * test environment without a `window`, it defaults to `false` so
 * animations continue to render; the global CSS media query still
 * neutralizes the visual motion on the rendered DOM.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const handleChange = () => setReduced(mql.matches);
    handleChange();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    }
    // Older Safari fallback.
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, []);

  return reduced;
}
