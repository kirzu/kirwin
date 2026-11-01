import Link from "next/link";

/**
 * Branded 404 for unmatched routes inside a locale segment.
 *
 * Deliberately free of `next-intl` lookups: this boundary can be reached
 * for a path whose locale segment is itself invalid, so resolving messages
 * here would throw and turn a 404 into a 500. Static bilingual copy plus a
 * link into each locale's home page is the robust choice.
 */
export default function LocaleNotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl">
        Page not found · 找不到此頁面
      </h1>
      <p className="max-w-xl text-base leading-7 text-muted-foreground">
        The page you are looking for does not exist or has moved.
        <br />
        您要找的頁面不存在,或已被移動。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/en"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to home
        </Link>
        <Link
          href="/zh-Hant"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          返回首頁
        </Link>
      </div>
    </section>
  );
}