"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MainNav } from "@/components/main-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n.config";

/**
 * Mobile navigation menu.
 *
 * Shown only on screens below the `md` breakpoint (768px). Above `md`
 * the desktop `MainNav` and inline `LanguageSwitcher` in the header
 * remain visible. Tapping the hamburger opens a right-side `Sheet`
 * (full-height drawer) containing:
 *
 *   - The same public nav links as `MainNav`, stacked vertically
 *     with ≥44px tap targets (`min-h-11 py-3`) so the menu is
 *     comfortable on touch devices.
 *   - The `LanguageSwitcher` in a vertical, full-width pill layout
 *     with full language names.
 *
 * Selecting any link or pill automatically closes the drawer so the
 * user is routed to the new page immediately. The hamburger button
 * itself is rendered with `min-h-11 min-w-11` so it satisfies the same
 * 44px tap-target requirement.
 */
export function MobileMenu({
  locale,
  navLabels,
  switcherLabel,
  switchToTemplate,
}: {
  locale: Locale;
  navLabels: {
    home: string;
    about: string;
    courses: string;
    bookings: string;
    testimonials: string;
    contact: string;
  };
  switcherLabel: string;
  switchToTemplate: string;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        onClick={() => setOpen((value) => !value)}
        className="md:hidden min-h-11 min-w-11"
        data-testid="mobile-menu-toggle"
      >
        {open ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Menu aria-hidden="true" className="h-5 w-5" />
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="mobile-menu-drawer"
          side="right"
          className="flex w-full max-w-xs flex-col gap-0 p-0 sm:max-w-sm"
          data-testid="mobile-menu-drawer"
        >
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle className="text-base font-semibold tracking-tight text-foreground">
              Menu
            </SheetTitle>
          </SheetHeader>

          <nav
            aria-label="Mobile primary"
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-5"
          >
            <MainNav
              locale={locale}
              labels={navLabels}
              orientation="vertical"
              onNavigate={close}
            />

            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {switcherLabel}
              </p>
              <LanguageSwitcher
                ariaLabel={switcherLabel}
                switchToTemplate={switchToTemplate}
                variant="drawer"
                onNavigate={close}
              />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
