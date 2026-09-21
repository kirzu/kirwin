/**
 * Fixed, full-viewport film-grain overlay.
 *
 * Renders a static SVG `feTurbulence` noise texture as a `background-image`
 * data URI, tiled across the viewport at a low opacity (~5%). The texture
 * is computed once when the SVG is first painted and then composited by
 * the GPU as a single layer — there is no per-frame work, no canvas, and
 * no WebGL, so this stays cheap even on long pages.
 *
 * Behaviour:
 *  - `pointer-events: none` ensures the overlay never intercepts clicks
 *    or hover events.
 *  - `z-index` sits above page content but below fixed interactive layers
 *    (header, modals, mobile drawer). It is `aria-hidden` so screen
 *    readers ignore it.
 *  - The noise is **static** (not animated), so it does not need to be
 *    disabled under `prefers-reduced-motion`. The texture feels like
 *    printed paper rather than motion.
 *
 * The opacity is exposed as a prop so we can dial it from anywhere
 * (default 0.05 ≈ 5%) without forking the component.
 */
export interface FilmGrainProps {
  /**
   * Overlay opacity (0..1). Keep very low so the texture is felt, not
   * seen. Default is 0.05 (5%).
   */
  opacity?: number;
  /**
   * `z-index` for the overlay. Defaults to 1 so it sits above page
   * content but below fixed interactive layers (header, modals).
   */
  zIndex?: number;
  /** Optional extra class names for the wrapper. */
  className?: string;
}

/**
 * Pre-encoded 200×200 SVG turbulence noise tile, served as a data URI
 * so it requires no extra HTTP request and is cached by the browser
 * after first paint.
 *
 * `encodeURIComponent` is applied to the entire SVG so that the `#` in
 * `url(#n)` is escaped to `%23` — required for valid data URIs.
 */
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
      `<filter id="n" x="0" y="0" width="100%" height="100%">` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" seed="4"/>` +
      `<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0"/>` +
      `</filter>` +
      `<rect width="100%" height="100%" filter="url(#n)"/>` +
      `</svg>`,
  );

export function FilmGrain({
  opacity = 0.05,
  zIndex = 1,
  className,
}: FilmGrainProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        pointerEvents: "none",
        opacity,
        // Compositing hints so the browser keeps the noise on its own
        // GPU layer rather than re-rasterising on every scroll frame.
        transform: "translateZ(0)",
        willChange: "opacity",
        backgroundImage: `url("${NOISE_DATA_URI}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}
