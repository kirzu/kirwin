/**
 * CSS-only hero background for the home page.
 *
 * Layers three large, softly blurred blobs that drift slowly across the
 * hero region on a 15–25 second cycle. No images, no canvas, no WebGL.
 * The animation is driven by the `@keyframes blob-drift` and
 * `gradient-mesh` rules in `app/globals.css` and respects
 * `prefers-reduced-motion: reduce` via the global media query in the
 * same stylesheet.
 *
 * Markup:
 *   <div aria-hidden pointer-events-none -z-10>
 *     <div hero-gradient__mesh />
 *     <span blob primary top-left />
 *     <span blob secondary middle />
 *     <span blob primary bottom-right />
 *     <span blob secondary mid-left />
 *   </div>
 */
export function AnimatedHeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ transform: "translateZ(0)" }}
    >
      <div className="hero-gradient__mesh" />
      <span
        className="hero-blob hero-blob--primary"
        style={{
          top: "-12%",
          left: "-8%",
          width: "55vw",
          height: "55vw",
          maxWidth: "720px",
          maxHeight: "720px",
          animationDuration: "22s",
        }}
      />
      <span
        className="hero-blob hero-blob--secondary"
        style={{
          top: "20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          maxWidth: "640px",
          maxHeight: "640px",
          animationDuration: "18s",
          animationDelay: "-4s",
        }}
      />
      <span
        className="hero-blob hero-blob--primary"
        style={{
          bottom: "-18%",
          left: "30%",
          width: "60vw",
          height: "60vw",
          maxWidth: "760px",
          maxHeight: "760px",
          opacity: 0.4,
          animationDuration: "25s",
          animationDelay: "-9s",
        }}
      />

    </div>
  );
}
