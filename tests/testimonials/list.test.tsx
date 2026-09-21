/**
 * Component tests for the public testimonials page view
 * (`components/testimonials/testimonials-view.tsx`).
 *
 * Strategy mirrors `tests/pages/home.test.tsx`:
 *  - Render the client component with `@testing-library/react`. The
 *    `.test.tsx` extension triggers the jsdom environment via the
 *    `environmentMatchGlobs` config, so the DOM is available.
 *  - Stub `next/image` to a plain `<img>` so jsdom can mount it.
 *  - Stub the GSAP-driven animation primitives to passthroughs.
 *  - Stub `next-intl`'s `useTranslations` to return either a stable
 *    English copy table or the key itself (depending on the test), so
 *    we can assert against the visible text and YouTube links.
 */
import { describe, it, expect, vi } from "vitest";
import React, { createElement, type ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";

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

// ---------------------------------------------------------------------------
// Imports (resolved after the mocks above are installed).
// ---------------------------------------------------------------------------
import { TestimonialsView, type TestimonialListItem } from "@/components/testimonials/testimonials-view";

const seedTestimonials: TestimonialListItem[] = [
  {
    id: "seed-alex",
    slug: "alex",
    title: "Alex",
    content:
      "Stephen has become more of a ritual to me every time I do a big race",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=v_jcsCvFKcA",
    imageUrl: "/assets/testimonial-alex.jpg",
  },
  {
    id: "seed-walter",
    slug: "walter",
    title: "Walter",
    content:
      "Stephen basically saved my life as well as thousands of dollars as a professional football player",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=1WcwkXCm9as",
    imageUrl: "/assets/testimonial-walter.jpg",
  },
  {
    id: "seed-danielle",
    slug: "danielle",
    title: "Danielle",
    content:
      "While I was living back In England I attended many appointments and sadly nobody compared to what Stephen was able to do in just one session",
    rating: 5,
    youtubeUrl: "https://www.youtube.com/watch?v=GvfGYG6xotw",
    imageUrl: "/assets/testimonial-danielle.jpg",
  },
];

describe("TestimonialsView", () => {
  it("renders the hero title from the testimonials namespace", () => {
    render(<TestimonialsView locale="en" testimonials={seedTestimonials} />);

    // useTranslations is stubbed to return the key. Both the visible h1
    // and an sr-only h2 share the same key, so use getAllByText.
    const titles = screen.getAllByText("title");
    expect(titles.length).toBeGreaterThanOrEqual(1);
    // The hero h1 has id="testimonials-hero-title" and is not sr-only.
    const heroHeading = document.getElementById("testimonials-hero-title");
    expect(heroHeading).toBeInTheDocument();
    expect(heroHeading?.textContent).toBe("title");
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });

  it("renders every seeded testimonial with its name and quote", () => {
    render(<TestimonialsView locale="en" testimonials={seedTestimonials} />);

    // Each testimonial is rendered twice: once in the desktop grid
    // (md+) and once in the mobile carousel (md-). Use getAllByText.
    expect(screen.getAllByText("Alex").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Walter").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Danielle").length).toBeGreaterThan(0);

    // Quotes — assert each unique substring appears.
    expect(
      screen.getAllByText(
        "Stephen has become more of a ritual to me every time I do a big race",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        "Stephen basically saved my life as well as thousands of dollars as a professional football player",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        "While I was living back In England I attended many appointments and sadly nobody compared to what Stephen was able to do in just one session",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("renders a 5-star rating for each testimonial", () => {
    const { container } = render(
      <TestimonialsView locale="en" testimonials={seedTestimonials} />,
    );

    // Each testimonial card renders 5 star SVG icons. Cards are rendered
    // twice (desktop grid + mobile carousel), so 2x the testimonials.
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(seedTestimonials.length * 2);

    articles.forEach((article) => {
      const stars = article.querySelectorAll("svg");
      expect(stars.length).toBeGreaterThanOrEqual(5);
    });

    // A screen-reader label summarises the rating; the component renders
    // an sr-only span with the translation key.
    const srOnlyLabels = screen.getAllByText("ratingLabel");
    expect(srOnlyLabels.length).toBe(seedTestimonials.length * 2);
  });

  it("renders a clickable video thumbnail for every testimonial that supplies a youtubeUrl", () => {
    const { container } = render(
      <TestimonialsView locale="en" testimonials={seedTestimonials} />,
    );

    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(seedTestimonials.length * 2);

    for (const testimonial of seedTestimonials) {
      const matching = Array.from(articles).filter((node) =>
        within(node).queryByText(testimonial.title),
      );
      expect(matching.length).toBeGreaterThan(0);
      matching.forEach((article) => {
        const button = article.querySelector("button");
        expect(button).toBeTruthy();
        expect(button?.getAttribute("aria-label")).toBe("playVideo");
      });
    }
  });

  it("omits the YouTube embed when youtubeUrl is missing", () => {
    const withoutVideo: TestimonialListItem[] = [
      {
        id: "seed-text-only",
        slug: "text-only",
        title: "Quinn",
        content: "Words only, no video.",
        rating: 5,
        youtubeUrl: null,
        imageUrl: null,
      },
    ];

    const { container } = render(
      <TestimonialsView locale="en" testimonials={withoutVideo} />,
    );

    const articles = container.querySelectorAll("article");
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((article) => {
      expect(article.querySelector("button")).toBeNull();
    });
  });

  it("renders each testimonial inside its own article element", () => {
    const { container } = render(
      <TestimonialsView locale="en" testimonials={seedTestimonials} />,
    );

    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(seedTestimonials.length * 2);

    for (const testimonial of seedTestimonials) {
      const matching = Array.from(articles).filter((node) =>
        within(node).queryByText(testimonial.title),
      );
      expect(matching.length).toBeGreaterThan(0);
    }
  });

  it("renders the empty state copy when no testimonials are provided", () => {
    render(<TestimonialsView locale="en" testimonials={[]} />);

    // Hero heading is still present even in the empty state. The visible
    // hero heading carries id="testimonials-hero-title".
    const heroHeading = document.getElementById("testimonials-hero-title");
    expect(heroHeading).toBeInTheDocument();

    // The empty-state message renders via the translation key.
    expect(screen.getByText("empty")).toBeInTheDocument();

    // No testimonial names or YouTube-related links should appear.
    expect(screen.queryByText("Alex")).not.toBeInTheDocument();
    expect(screen.queryByText("Walter")).not.toBeInTheDocument();
    expect(screen.queryByText("Danielle")).not.toBeInTheDocument();
  });
});
