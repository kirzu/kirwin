import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched paths inside a locale segment.
 *
 * `not-found.tsx` only renders when `notFound()` is thrown from a route
 * that matched. A completely unknown URL matches no route at all, so Next
 * would fall back to its built-in default 404. Rendering `notFound()` from
 * this catch-all routes those requests through the branded
 * `app/[locale]/not-found.tsx` instead — inside the normal header/footer
 * shell, with a real 404 status.
 */
export default function CatchAllNotFound() {
  notFound();
}