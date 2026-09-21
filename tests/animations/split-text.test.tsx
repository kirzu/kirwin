import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplitText } from "@/components/animations";
import { setReducedMotion } from "@/tests/utils/reduced-motion";

describe("SplitText", () => {
  afterEach(() => setReducedMotion(false));

  it("renders each word of the text", () => {
    render(<SplitText text="Hello luxury world" />);

    expect(screen.getByLabelText("Hello luxury world")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("luxury")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("shows text immediately when reduced motion is preferred", () => {
    setReducedMotion(true);
    render(<SplitText text="Accessible headline" />);

    expect(screen.getByLabelText("Accessible headline")).toBeInTheDocument();
    expect(screen.getByText("Accessible")).toBeInTheDocument();
    expect(screen.getByText("headline")).toBeInTheDocument();
  });
});
