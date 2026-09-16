/**
 * Component tests for the redesigned Contact page view
 * (`components/contact/contact-view.tsx`).
 *
 * Strategy mirrors `tests/pages/home.test.tsx` and `about.test.tsx`:
 *  - Render with `@testing-library/react` (jsdom for `.test.tsx`).
 *  - Stub `next/image`, animation primitives, shadcn/ui primitives, and
 *    `next-intl`'s `useTranslations`.
 *  - Stub the actual `ContactForm` server-action-driven form with a
 *    simple passthrough so the right column renders without trying to
 *    submit.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
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

// Replace the actual ContactForm (which uses a server action) with a
// passthrough that emits a stub <form> so we can still assert the form
// column is wired up.
vi.mock("@/app/[locale]/contact/contact-form", () => ({
  default: ({ locale }: { locale: string }) =>
    createElement(
      "form",
      { "data-testid": "contact-form", "data-locale": locale },
      createElement("input", { name: "name", type: "text" }),
      createElement("input", { name: "email", type: "email" }),
      createElement("input", { name: "phone", type: "tel" }),
      createElement("textarea", { name: "message" }),
      createElement("button", { type: "submit" }, "submit"),
    ),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed).
// ---------------------------------------------------------------------------
import { ContactView } from "@/components/contact/contact-view";

const phoneHref = "tel:+85269065503";
const emailHref = "mailto:[email protected]";
const mapHref =
  "https://www.google.com/maps/search/?api=1&query=Queens+Road+Central+Hong+Kong";

describe("ContactView", () => {
  it("renders the contact details for phone, email, address, and hours", () => {
    render(
      <ContactView
        locale="en"
        phoneHref={phoneHref}
        emailHref={emailHref}
        mapHref={mapHref}
      />,
    );

    // Translation-key passthroughs — each key may render more than once
    // (e.g. phoneValue is used in the detail row and the closing CTA).
    expect(screen.getAllByText("phoneValue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("emailValue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("locationValue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("hours").length).toBeGreaterThan(0);

    // Phone and email should be wired up as links with the correct hrefs.
    const phoneLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === phoneHref);
    expect(phoneLink).toBeDefined();

    const emailLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === emailHref);
    expect(emailLink).toBeDefined();
  });

  it("renders the Google Maps call-to-action link with the expected href", () => {
    render(
      <ContactView
        locale="en"
        phoneHref={phoneHref}
        emailHref={emailHref}
        mapHref={mapHref}
      />,
    );

    // The map CTA is rendered via the `mapCta` translation key.
    expect(screen.getAllByText("mapCta").length).toBeGreaterThan(0);

    // Find an anchor pointing at the configured Google Maps URL.
    const mapLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === mapHref);
    expect(mapLink).toBeDefined();
    // External link should open in a new tab with safe rel attributes.
    expect(mapLink?.getAttribute("target")).toBe("_blank");
    expect(mapLink?.getAttribute("rel")).toBe("noreferrer noopener");
  });

  it("renders the ContactForm in the right column", () => {
    render(
      <ContactView
        locale="en"
        phoneHref={phoneHref}
        emailHref={emailHref}
        mapHref={mapHref}
      />,
    );

    const forms = screen.getAllByTestId("contact-form");
    expect(forms.length).toBeGreaterThan(0);
    const form = forms[0];
    // Locale is forwarded to the form component.
    expect(form.getAttribute("data-locale")).toBe("en");

    // Form elements (name, email, phone, message, submit) are rendered.
    expect(form.querySelector('input[name="name"]')).toBeTruthy();
    expect(form.querySelector('input[name="email"]')).toBeTruthy();
    expect(form.querySelector('input[name="phone"]')).toBeTruthy();
    expect(form.querySelector('textarea[name="message"]')).toBeTruthy();
    expect(form.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it("renders the hero headline via the translation key", () => {
    render(
      <ContactView
        locale="en"
        phoneHref={phoneHref}
        emailHref={emailHref}
        mapHref={mapHref}
      />,
    );

    // The hero title is rendered as the translation key passthrough.
    // `title` may appear multiple times since several section headings
    // use the same translation key.
    expect(screen.getAllByText("title").length).toBeGreaterThan(0);
  });
});
