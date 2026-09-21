"use client";

import { SplitText } from "@/components/animations";

interface LegalTitleProps {
  title: string;
}

export function LegalTitle({ title }: LegalTitleProps) {
  return (
    <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
      <SplitText text={title} stagger={40} offset={16} duration={600} />
    </h1>
  );
}
