"use client";

import { type ReactNode } from "react";
import { AnimatedSection, type AnimationDirection } from "./animated-section";

export interface FadeInProps {
  children: ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 32,
  className,
  once = true,
}: FadeInProps) {
  return (
    <AnimatedSection
      direction={direction}
      delay={delay}
      duration={duration}
      distance={distance}
      className={className}
      once={once}
    >
      {children}
    </AnimatedSection>
  );
}
