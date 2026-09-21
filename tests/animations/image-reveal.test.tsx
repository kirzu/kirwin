import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageReveal } from "@/components/animations";
import { setReducedMotion } from "@/tests/utils/reduced-motion";

describe("ImageReveal", () => {
  afterEach(() => setReducedMotion(false));

  it("renders its child", () => {
    render(
      <ImageReveal>
        <img src="/img.jpg" alt="Hero" />
      </ImageReveal>
    );

    expect(screen.getByAltText("Hero")).toBeInTheDocument();
  });

  it("renders child visible when reduced motion is preferred", () => {
    setReducedMotion(true);
    render(
      <ImageReveal direction="right">
        <img src="/img.jpg" alt="Accessible" />
      </ImageReveal>
    );

    expect(screen.getByAltText("Accessible")).toBeInTheDocument();
  });
});
