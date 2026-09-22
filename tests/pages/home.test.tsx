/**
 * Component tests for the redesigned Home page view
 * (`components/home/home-view.tsx`).
 *
 * Strategy:
 *  - Render the client component with `@testing-library/react`. The
 *    `.test.tsx` extension triggers the jsdom environment via the
 *    `environmentMatchGlobs` config, so the DOM is available.
 *  - Stub `next/image` to a plain `<img>` so jsdom can mount it.
 *  - Stub the GSAP-driven animation primitives to passthroughs so the
 *    markup under test is the real output of the view (the animations
 *    themselves are covered by `tests/animations/animations.test.tsx`).
 *  - Stub `next-intl`'s `useTranslations` to return a key-based lookup
 *    so we can assert against the translation keys the component reads.
 *  - Provide realistic training items, credentials, and featured
 *    courses via props.
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
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: ReactNode }) =>
    createElement(React.Fragment, null, children),
}));

// Passthrough mocks for animation primitives — jsdom cannot fully
// exercise GSAP ScrollTrigger.
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
  ParallaxImage: ({
    src,
    alt,
    containerClassName,
  }: {
    src: string;
    alt: string;
    containerClassName?: string;
  }) =>
    createElement(
      "div",
      containerClassName ? { className: containerClassName } : null,
      createElement("img", { src, alt }),
    ),
}));

// shadcn/ui primitives — pass children through.
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
  CardTitle: ({ children, id, className }: { children: ReactNode; id?: string; className?: string }) =>
    createElement(
      "h3",
      { ...(id ? { id } : {}), ...(className ? { className } : {}) },
      children,
    ),
  CardDescription: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("p", className ? { className } : null, children),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) =>
    createElement("div", className ? { className } : null, children),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after the mocks above are installed).
// ---------------------------------------------------------------------------
import { HomeView } from "@/components/home/home-view";

const trainingItems = [
  { title: "Assessment & palpation", body: "Read the body with confidence." },
  { title: "Neuromuscular techniques", body: "Apply targeted neuromuscular therapy." },
  { title: "Deep tissue bodywork", body: "Layer deep tissue work with alignment." },
  { title: "Treatment planning", body: "Build clear, measurable treatment plans." },
];

const credentials = [
  "University of Colorado, Boulder",
  "Boulder College of Massage Therapy",
  "22+ years of clinical practice",
];

const featuredCourses = [
  {
    id: "course-1",
    slug: "mfr-intensive",
    title: "MFR Intensive",
    description: "A hands-on intensive covering myofascial release techniques.",
    durationLabel: "3 days",
    priceLabel: "HK$ 4,800",
  },
  {
    id: "course-2",
    slug: "neuro-essentials",
    title: "Neuromuscular Essentials",
    description: "Foundational neuromuscular therapy for clinical practice.",
    durationLabel: "2 days",
    priceLabel: "HK$ 3,200",
  },
];

describe("HomeView", () => {
  it("renders the hero headline via the translation key", () => {
    render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    // useTranslations is stubbed to return the key.
    expect(screen.getByText("hero.title")).toBeInTheDocument();
  });

  it("renders the logo image with the hero logoAlt text", () => {
    render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    const logo = screen.getByAltText("hero.logoAlt");
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute("src")).toBe("/assets/logo.png");
  });

  it("renders at least one training card with its title and body", () => {
    render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    // First training item should be present.
    expect(screen.getByText("Assessment & palpation")).toBeInTheDocument();

    // All four training items should render.
    for (const item of trainingItems) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.body)).toBeInTheDocument();
    }
  });

  it("renders the featured courses section when courses are provided", () => {
    render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    // Section title is rendered (translation key passthrough).
    expect(screen.getByText("courses.title")).toBeInTheDocument();

    // Each featured course should render its title.
    for (const course of featuredCourses) {
      expect(screen.getByText(course.title)).toBeInTheDocument();
    }

    // Course links should resolve to /{locale}/courses/{slug}.
    const firstLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === "/en/courses/mfr-intensive");
    expect(firstLink).toBeDefined();
  });

  it("renders the credentials as a simple list when credentials are provided", () => {
    const { container } = render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    // Each credential line appears in the document.
    for (const line of credentials) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }

    // Ensure the credentials sit inside a list with the expected item count.
    const lists = Array.from(container.querySelectorAll("ul"));
    const credentialsList = lists.find((list) => {
      const items = list.querySelectorAll("li");
      return items.length === credentials.length;
    });
    expect(credentialsList).toBeTruthy();
    if (credentialsList) {
      const items = within(credentialsList).getAllByRole("listitem");
      expect(items.length).toBe(credentials.length);
    }
  });

  it("renders the closing CTA with a courses link and a contact link", () => {
    render(
      <HomeView
        locale="en"
        trainingItems={trainingItems}
        credentials={credentials}
        featuredCourses={featuredCourses}
      />,
    );

    expect(screen.getByText("cta.title")).toBeInTheDocument();
    // Both primary and secondary CTAs point to /en/bookings and /en/courses
    // so visitors can either book a massage or browse seminars.
    const bookingsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/en/bookings");
    const coursesLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/en/courses");

    expect(bookingsLinks.length).toBeGreaterThan(0);
    expect(coursesLinks.length).toBeGreaterThan(0);
  });
});
