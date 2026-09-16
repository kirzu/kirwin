import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AnimatedSection,
  StaggerChildren,
  StaggerItem,
  useReducedMotion,
} from "@/components/animations";

function setReducedMotion(matches: boolean) {
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

describe("prefers-reduced-motion", () => {
  beforeEach(() => {
    setReducedMotion(true);
  });

  afterEach(() => {
    setReducedMotion(false);
  });

  it("useReducedMotion reports true when the media query matches", () => {
    function Probe() {
      const reduced = useReducedMotion();
      return <span data-testid="probe">{reduced ? "yes" : "no"}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("yes");
  });

  it("AnimatedSection still renders its children when motion is reduced", () => {
    const { container } = render(
      <AnimatedSection as="section" direction="up">
        <p>Visible without animation</p>
      </AnimatedSection>
    );
    expect(screen.getByText("Visible without animation")).toBeInTheDocument();
    expect(container.querySelector("section")).toContainElement(
      screen.getByText("Visible without animation")
    );
  });

  it("StaggerChildren renders every child even when motion is reduced", () => {
    const { container } = render(
      <StaggerChildren>
        <StaggerItem>One</StaggerItem>
        <StaggerItem>Two</StaggerItem>
        <StaggerItem>Three</StaggerItem>
      </StaggerChildren>
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
    const items = container.querySelectorAll('[data-animate="stagger-item"]');
    expect(items).toHaveLength(3);
  });
});
