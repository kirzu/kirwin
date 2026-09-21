import { vi } from "vitest";

export function setReducedMotion(matches: boolean) {
  const listeners: Array<(ev: MediaQueryListEvent) => void> = [];
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: (cb: (ev: MediaQueryListEvent) => void) =>
      listeners.push(cb),
    removeListener: (cb: (ev: MediaQueryListEvent) => void) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
    addEventListener: (_: string, cb: (ev: MediaQueryListEvent) => void) =>
      listeners.push(cb),
    removeEventListener: (
      _: string,
      cb: (ev: MediaQueryListEvent) => void
    ) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
    dispatchEvent: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => mql),
  });
  return { mql, listeners };
}
