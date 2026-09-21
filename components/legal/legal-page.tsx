import type { LegalDocument } from "@/lib/legal";
import { LegalTitle } from "./legal-title";

export interface LegalPageProps {
  document: LegalDocument;
}

export function LegalPage({ document }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28 lg:py-32">
      <header className="mb-10 border-b border-border pb-8">
        <LegalTitle title={document.title} />
        <p className="mt-3 text-sm text-muted-foreground">
          {document.lastUpdated}
        </p>
      </header>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="lead text-lg text-muted-foreground">{document.intro}</p>

        {document.sections.map((section, index) => (
          <section key={index} className="mt-10">
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
              {section.heading}
            </h2>
            <p className="mt-3 leading-7 text-foreground/90 whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
        {document.contactPrefix}
        <a
          href="mailto:Stephen.kirwin.cmt@gmail.com"
          className="link-underline text-foreground hover:text-primary"
        >
          Stephen.kirwin.cmt@gmail.com
        </a>
      </p>
    </div>
  );
}
