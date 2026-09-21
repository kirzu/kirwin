import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MagneticButton } from "@/components/animations";
import { setReducedMotion } from "@/tests/utils/reduced-motion";

describe("MagneticButton", () => {
  afterEach(() => setReducedMotion(false));

  it("renders its child", () => {
    render(
      <MagneticButton>
        <button type="button">Magnetic</button>
      </MagneticButton>
    );

    expect(
      screen.getByRole("button", { name: "Magnetic" })
    ).toBeInTheDocument();
  });

  it("still renders child when reduced motion is preferred", () => {
    setReducedMotion(true);
    render(
      <MagneticButton>
        <a href="/">Home</a>
      </MagneticButton>
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
