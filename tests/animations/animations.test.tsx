import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AnimatedSection,
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";

// GSAP's ScrollTrigger uses DOM measurements that jsdom cannot provide,
// so we register the plugin but stub refresh to avoid layout errors.
vi.mock("gsap/ScrollTrigger", async () => {
  const actual = await vi.importActual<typeof import("gsap/ScrollTrigger")>(
    "gsap/ScrollTrigger"
  );
  return {
    ...actual,
    ScrollTrigger: {
      ...actual.ScrollTrigger,
      refresh: vi.fn(),
    },
  };
});

describe("Animation primitives", () => {
  it("registers ScrollTrigger with GSAP", () => {
    gsap.registerPlugin(ScrollTrigger);
    expect(ScrollTrigger).toBeDefined();
    expect(ScrollTrigger.version).toBeTruthy();
  });

  it("renders AnimatedSection as the requested element with children", () => {
    const { container } = render(
      <AnimatedSection as="section" direction="left" delay={0.2}>
        <p>Revealed content</p>
      </AnimatedSection>
    );
    expect(screen.getByText("Revealed content")).toBeInTheDocument();
    expect(container.querySelector("section")).toContainElement(
      screen.getByText("Revealed content")
    );
  });

  it("renders FadeIn with children", () => {
    render(
      <FadeIn direction="down" delay={0.3} duration={0.9}>
        <p>Fade content</p>
      </FadeIn>
    );
    expect(screen.getByText("Fade content")).toBeInTheDocument();
  });

  it("wraps StaggerChildren items with data-animate='stagger-item'", () => {
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
    expect(within(items[0] as HTMLElement).getByText("One")).toBeInTheDocument();
  });
});
