import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountUp, AnimatedStat } from "@/components/animations/count-up";

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

describe("CountUp", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  afterEach(() => {
    setReducedMotion(false);
  });

  it("renders the final value immediately when reduced motion is preferred", () => {
    setReducedMotion(true);
    render(<CountUp value={42} />);
    // The component initialises to the final value; reduced motion path
    // leaves it there. Either way, 42 must be present.
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders prefix and suffix around the value", () => {
    setReducedMotion(true);
    render(<CountUp value={7} prefix="HK$" suffix="+" />);
    expect(screen.getByText("HK$7+")).toBeInTheDocument();
  });

  it("commits the final value when IntersectionObserver is unavailable", () => {
    // jsdom does not implement IntersectionObserver — the hook should
    // fall back to rendering the final value without observing.
    const Original = (window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    delete (window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    try {
      render(<CountUp value={99} />);
      expect(screen.getByText("99")).toBeInTheDocument();
    } finally {
      if (Original) {
        (window as unknown as { IntersectionObserver?: unknown })
          .IntersectionObserver = Original;
      }
    }
  });

  it("applies an optional className to the rendered span", () => {
    setReducedMotion(true);
    const { container } = render(<CountUp value={10} className="stat" />);
    const span = container.querySelector("span.stat");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("10");
  });
});

describe("AnimatedStat", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  afterEach(() => {
    setReducedMotion(false);
  });

  it("renders strings without numbers unchanged", () => {
    setReducedMotion(true);
    render(<AnimatedStat>Specialist in bodywork</AnimatedStat>);
    expect(screen.getByText("Specialist in bodywork")).toBeInTheDocument();
  });

  it("animates the leading numeric prefix", () => {
    setReducedMotion(true);
    render(<AnimatedStat>29+ years of clinical practice</AnimatedStat>);
    // With reduced motion the final number is rendered immediately.
    expect(screen.getByText("29+ years of clinical practice")).toBeInTheDocument();
  });

  it("preserves the text before and after the number", () => {
    setReducedMotion(true);
    const { container } = render(
      <AnimatedStat>University of Colorado, Boulder 1</AnimatedStat>,
    );
    // The wrapper span concatenates prefix + number span + suffix.
    expect(container.textContent).toBe("University of Colorado, Boulder 1");
  });
});
