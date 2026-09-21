import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TiltCard } from "@/components/animations";
import { setReducedMotion } from "@/tests/utils/reduced-motion";

describe("TiltCard", () => {
  afterEach(() => setReducedMotion(false));

  it("renders its child", () => {
    render(
      <TiltCard>
        <div>Tilt me</div>
      </TiltCard>
    );

    expect(screen.getByText("Tilt me")).toBeInTheDocument();
  });

  it("renders child when reduced motion is preferred", () => {
    setReducedMotion(true);
    render(
      <TiltCard className="h-full">
        <article>Card content</article>
      </TiltCard>
    );

    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});
