/**
 * Component tests for the redesigned About page view
 * (`components/about/about-view.tsx`).
 *
 * Strategy mirrors `tests/pages/home.test.tsx`:
 *  - Render with `@testing-library/react` (jsdom for `.test.tsx`).
 *  - Stub `next/image`, animation primitives, shadcn/ui primitives, and
 *    `next-intl`'s `useTranslations` so we get deterministic output
 *    without exercising GSAP / scroll-trigger plumbing.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Module mocks (vi.mock is hoisted).
// ---------------------------------------------------------------------------

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const fn = (key: string) => key;
    (fn as unknown as { raw: (key: string) => unknown }).raw = (
      _key: string,
    ) => [];
    return fn;
  },
  NextIntlClientProvider: ({ children }: { children: ReactNode }) =>
    createElement(React.Fragment, null, children),
}));

vi.mock("@/components/animations/animated-section", () => ({
  AnimatedSection: ({
    children,
    as,
    className,
  }: {
    children: ReactNode;
    as?: string;
    className?: string;
  }) => createElement(as ?? "div", className ? { className } : null, children),
}));
vi.mock("@/components/animations/fade-in", () => ({
  FadeIn: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
}));
vi.mock("@/components/animations/stagger-children", () => ({
  StaggerChildren: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
  StaggerItem: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
}));
vi.mock("@/components/animations/parallax-image", () => ({
  ParallaxImage: ({ src, alt }: { src: string; alt: string }) =>
    createElement("img", { src, alt }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild: _asChild,
    ...rest
  }: { children: ReactNode; asChild?: boolean } & Record<string, unknown>) =>
    createElement("button", rest, children),
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
  CardTitle: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("h3", className ? { className } : null, children),
  CardDescription: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("p", className ? { className } : null, children),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed).
// ---------------------------------------------------------------------------
import { AboutView } from "@/components/about/about-view";

const bioParagraphs = [
  "Stephen Kirwin is a bodywork practitioner and educator whose work sits at the intersection of neuromuscular therapy, deep tissue bodywork, and structural alignment.",
  "Over twenty-two years of clinical practice, Stephen has refined a precise, evidence-informed approach to therapeutic care.",
  "Today he lives and teaches from Hong Kong, training practitioners across Asia.",
];

const credentials = [
  "University of Colorado, Boulder",
  "Boulder College of Massage Therapy",
  "22+ years of clinical practice",
  "Specialist in neuromuscular therapy and deep tissue bodywork",
  "Based in Hong Kong",
];

const milestones = [
  {
    year: "Foundations",
    title: "Studied neuromuscular therapy",
    body: "Trained at the University of Colorado, Boulder and the Boulder College of Massage Therapy.",
  },
  {
    year: "Practice",
    title: "22+ years in the treatment room",
    body: "Refined assessment, palpation, and hands-on technique across thousands of sessions.",
  },
  {
    year: "Teaching",
    title: "Built the bodywork seminar method",
    body: "Developed a small-cohort curriculum prioritizing clear assessment and hands-on coaching.",
  },
];

const faqs = [
  {
    question: "Who are the seminars for?",
    answer: "Licensed and student bodyworkers, physiotherapists, and movement practitioners.",
  },
  {
    question: "Where are seminars held?",
    answer: "Stephen runs scheduled seminars in Hong Kong and travels throughout Asia for private cohorts.",
  },
  {
    question: "Do you offer one-on-one sessions?",
    answer: "Therapeutic bodywork sessions are available by appointment in Hong Kong.",
  },
];

describe("AboutView", () => {
  it("renders Stephen Kirwin's name and bio paragraph text", () => {
    render(
      <AboutView
        locale="en"
        bioParagraphs={bioParagraphs}
        credentials={credentials}
        milestones={milestones}
        faqs={faqs}
      />,
    );

    // The biography section hard-codes the practitioner's name.
    const nameMatches = screen.getAllByText("Stephen Kirwin");
    expect(nameMatches.length).toBeGreaterThan(0);

    // Every provided bio paragraph should appear in the document.
    for (const paragraph of bioParagraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("renders the credentials list with multiple items", () => {
    const { container } = render(
      <AboutView
        locale="en"
        bioParagraphs={bioParagraphs}
        credentials={credentials}
        milestones={milestones}
        faqs={faqs}
      />,
    );

    // Every credential line is rendered. Each may appear more than once
    // because the bio paragraphs share phrases with the credentials.
    for (const line of credentials) {
      expect(screen.getAllByText(line).length).toBeGreaterThan(0);
    }

    // The credentials sit inside a list with the correct number of items.
    const list = container.querySelector("ul");
    expect(list).toBeTruthy();
    if (list) {
      const items = within(list).getAllByRole("listitem");
      expect(items.length).toBe(credentials.length);
    }
  });

  it("renders the FAQ section with all provided questions", () => {
    render(
      <AboutView
        locale="en"
        bioParagraphs={bioParagraphs}
        credentials={credentials}
        milestones={milestones}
        faqs={faqs}
      />,
    );

    // FAQ section title is rendered (translation key passthrough).
    expect(screen.getAllByText("faqTitle").length).toBeGreaterThan(0);

    // Each FAQ question and answer should be present. Use getAllByText
    // because the answer text may also be visible in adjacent state.
    for (const faq of faqs) {
      expect(screen.getAllByText(faq.question).length).toBeGreaterThan(0);
      expect(screen.getAllByText(faq.answer).length).toBeGreaterThan(0);
    }

    // The first FAQ is open by default; the disclosure button should
    // expose aria-expanded. Match by partial text (the answer contains
    // the question phrase too, so use getAllByRole).
    const faqButtons = screen.getAllByRole("button", {
      name: /who are the seminars for/i,
    });
    expect(faqButtons.length).toBeGreaterThan(0);
    const firstFaqButton = faqButtons[0];
    expect(firstFaqButton).toBeInTheDocument();
    expect(firstFaqButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders the milestones section with year, title, and body for each milestone", () => {
    render(
      <AboutView
        locale="en"
        bioParagraphs={bioParagraphs}
        credentials={credentials}
        milestones={milestones}
        faqs={faqs}
      />,
    );

    // Section title is rendered (translation key passthrough).
    expect(screen.getAllByText("milestonesTitle").length).toBeGreaterThan(0);

    for (const milestone of milestones) {
      expect(screen.getAllByText(milestone.year).length).toBeGreaterThan(0);
      expect(screen.getAllByText(milestone.title).length).toBeGreaterThan(0);
      expect(screen.getAllByText(milestone.body).length).toBeGreaterThan(0);
    }
  });
});
