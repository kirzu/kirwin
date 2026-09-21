import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ScrollProgress } from "@/components/scroll-progress";

function setReducedMotion(matches: boolean) {
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => mql),
  });
}

describe("ScrollProgress", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  afterEach(() => {
    setReducedMotion(false);
  });

  it("renders the progress bar in the viewport", () => {
    const { container } = render(<ScrollProgress />);
    const wrapper = container.querySelector('div[aria-hidden="true"]');
    expect(wrapper).toBeInTheDocument();
    const fill = container.querySelector('[role="presentation"]');
    expect(fill).toBeInTheDocument();
    // Initial scale is 0 (top of page).
    expect(fill?.getAttribute("style") ?? "").toMatch(/scaleX\(0\)/);
  });

  it("renders nothing when reduced motion is preferred", () => {
    setReducedMotion(true);
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toBeNull();
  });
});
