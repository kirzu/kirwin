/**
 * Component tests for the redesigned Courses listing page view
 * (`components/courses/courses-view.tsx`).
 *
 * Strategy mirrors `tests/pages/home.test.tsx`:
 *  - Render the client component with `@testing-library/react` (jsdom
 *    via `environmentMatchGlobs` for `.test.tsx`).
 *  - Stub `next/image`, animation primitives, shadcn/ui primitives, and
 *    `next-intl`'s `useTranslations` so we get deterministic output
 *    without exercising GSAP / scroll-trigger plumbing.
 *  - Drive the search input and filter pills via user-style DOM events
 *    to verify the filtering + empty-state plumbing.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Module mocks (vi.mock is hoisted).
// ---------------------------------------------------------------------------

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params && typeof params.count === "number") {
      const count = params.count;
      if (count === 0) return "No seminars match your filters";
      if (count === 1) return "1 seminar matches your filters";
      return `${count} seminars match your filters`;
    }
    return key;
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
    asChild,
    ...rest
  }: { children: ReactNode; asChild?: boolean } & Record<string, unknown>) => {
    // Render the children directly when asChild is true (Slot behaviour).
    return asChild
      ? createElement("a", rest, children)
      : createElement("button", rest, children);
  },
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
  CardFooter: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) => createElement("input", props),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed).
// ---------------------------------------------------------------------------
import { CoursesView, type CourseListItem } from "@/components/courses/courses-view";

const sampleCourses: CourseListItem[] = [
  {
    id: "c-half",
    slug: "myofascial-intro",
    title: "Myofascial Release Foundations",
    description: "Hands-on introduction to myofascial release techniques.",
    priceLabel: "HK$1,800",
    durationLabel: "3 hr",
    seats: 8,
    imageUrl: null,
  },
  {
    id: "c-full",
    slug: "deep-tissue-intensive",
    title: "Deep Tissue Intensive",
    description: "A full-day intensive on deep tissue bodywork.",
    priceLabel: "HK$3,200",
    durationLabel: "6 hr",
    seats: 6,
    imageUrl: null,
  },
  {
    id: "c-multi",
    slug: "advanced-certification",
    title: "Advanced Practitioner Certification",
    description: "Two-day certification for experienced practitioners.",
    priceLabel: "HK$5,400",
    durationLabel: "12 hr",
    seats: 10,
    imageUrl: null,
  },
];

describe("CoursesView", () => {
  it("renders the hero title and subtitle", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    // Title appears in the hero and as the sr-only listing heading.
    expect(screen.getAllByText("title").length).toBeGreaterThan(0);
    // Subtitle is the description paragraph.
    expect(screen.getAllByText("subtitle").length).toBeGreaterThan(0);
  });

  it("renders a course card for every course with title, description, duration, seats, and price", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    for (const course of sampleCourses) {
      // Title appears as the card heading.
      expect(screen.getAllByText(course.title).length).toBeGreaterThan(0);
      // Description appears in the card body.
      expect(screen.getAllByText(course.description!).length).toBeGreaterThan(0);
      // Price is rendered exactly once on the card (no image-chip
      // duplication any more).
      expect(screen.getAllByText(course.priceLabel).length).toBeGreaterThan(0);
    }

    // Each course card renders a View details link with the locale-aware
    // slug href (Button with asChild renders the child <a> directly).
    const viewLinks = screen.getAllByRole("link", { name: /viewDetails/i });
    expect(viewLinks.length).toBe(sampleCourses.length);

    for (const course of sampleCourses) {
      const link = viewLinks.find(
        (anchor) =>
          (anchor as HTMLAnchorElement).getAttribute("href") ===
          `/en/courses/${course.slug}`,
      );
      expect(link).toBeTruthy();
    }
  });

  it("renders the four filter pills with the active state on 'all' by default", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    const all = screen.getByRole("tab", { name: "filters.all" });
    const halfDay = screen.getByRole("tab", { name: "filters.halfDay" });
    const fullDay = screen.getByRole("tab", { name: "filters.fullDay" });
    const multiDay = screen.getByRole("tab", { name: "filters.multiDay" });

    expect(all.getAttribute("aria-selected")).toBe("true");
    expect(halfDay.getAttribute("aria-selected")).toBe("false");
    expect(fullDay.getAttribute("aria-selected")).toBe("false");
    expect(multiDay.getAttribute("aria-selected")).toBe("false");
  });

  it("filters courses by the halfDay pill (under 4 hours)", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    // Switch to the halfDay pill.
    fireEvent.click(screen.getByRole("tab", { name: "filters.halfDay" }));

    // Only the 4 hr course passes the halfDay filter (the 6 hr and 12 hr
    // courses fall outside the < 240 min band).
    expect(screen.getAllByText("Myofascial Release Foundations").length).toBeGreaterThan(0);
    expect(screen.queryByText("Deep Tissue Intensive")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Advanced Practitioner Certification")
    ).not.toBeInTheDocument();
  });

  it("filters courses by free-text query in the search input", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    const input = screen.getByPlaceholderText("searchPlaceholder") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "certification" } });

    expect(
      screen.getAllByText("Advanced Practitioner Certification").length
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Myofascial Release Foundations")).not.toBeInTheDocument();
    expect(screen.queryByText("Deep Tissue Intensive")).not.toBeInTheDocument();
  });

  it("renders the filtered empty state with a Clear filters action when nothing matches", () => {
    render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    const input = screen.getByPlaceholderText("searchPlaceholder") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "this-will-match-nothing-xyz" } });

    // All course cards disappear from the DOM.
    expect(screen.queryByText("Myofascial Release Foundations")).not.toBeInTheDocument();
    expect(screen.queryByText("Deep Tissue Intensive")).not.toBeInTheDocument();

    // Empty-state copy is rendered (translation keys).
    expect(screen.getAllByText("emptyTitle").length).toBeGreaterThan(0);
    expect(screen.getAllByText("emptyBody").length).toBeGreaterThan(0);

    // Clear filters button is present. Translation-key passthrough makes
    // the accessible name `clearFilters` (camelCase), and the search-input
    // clear icon carries the same translation key for its aria-label.
    const clearButtons = screen.getAllByRole("button", {
      name: /clearFilters/i,
    });
    expect(clearButtons.length).toBeGreaterThan(0);
    const clear = clearButtons[clearButtons.length - 1];
    expect(clear).toBeInTheDocument();

    // Clicking Clear filters resets the search and restores the cards.
    fireEvent.click(clear);
    expect(input.value).toBe("");
    expect(
      screen.getAllByText("Myofascial Release Foundations").length
    ).toBeGreaterThan(0);
  });

  it("renders the no-published empty state when hasCourses is false", () => {
    render(
      <CoursesView
        locale="en"
        courses={[]}
        hasCourses={false}
      />,
    );

    // The no-results status line is suppressed when no courses exist.
    expect(screen.queryByText(/seminar.*matches your filters/i)).not.toBeInTheDocument();

    // The library of published-courses empty copy is shown.
    expect(screen.getAllByText("empty").length).toBeGreaterThan(0);

    // No course cards should render.
    expect(screen.queryByText("Myofascial Release Foundations")).not.toBeInTheDocument();
  });

  it("renders the staggered grid as a list of cards", () => {
    const { container } = render(
      <CoursesView
        locale="en"
        courses={sampleCourses}
        hasCourses={true}
      />,
    );

    // Find the listing grid: it sits inside the section whose heading is
    // the upcoming-sessions title. Several other sections also use grid
    // layouts (e.g. the Day 1–4 highlight rows), so disambiguate by the
    // surrounding id.
    const listingSection = container.querySelector(
      'section[aria-labelledby="courses-listing-title"]',
    );
    expect(listingSection).toBeTruthy();
    const grid = listingSection?.querySelector('[class*="grid"]');
    expect(grid).toBeTruthy();
    if (grid) {
      const wrappers = within(grid as HTMLElement).getAllByRole("link", {
        name: /viewDetails/i,
      });
      expect(wrappers.length).toBe(sampleCourses.length);
    }
  });
});
