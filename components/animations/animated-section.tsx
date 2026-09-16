"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export type AnimationDirection = "up" | "down" | "left" | "right" | "none";

export interface AnimatedSectionProps {
  children: ReactNode;
  direction?: AnimationDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: "section" | "div" | "article" | "aside";
}

const directionMap: Record<AnimationDirection, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
};

export function AnimatedSection({
  children,
  direction = "up",
  distance = 40,
  duration = 0.8,
  delay = 0,
  ease = "power2.out",
  className,
  once = true,
  amount = 0.2,
  as: Component = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { x = 0, y = 0 } = directionMap[direction];

  useGSAP(
    () => {
      if (!ref.current) return;
      if (reducedMotion) {
        // No entrance animation; make sure content is visible immediately.
        gsap.set(ref.current, { opacity: 1, x: 0, y: 0, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          x: x * distance,
          y: y * distance,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start: `top ${80 - amount * 60}%`,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        }
      );
    },
    { scope: ref, dependencies: [reducedMotion, direction, distance, duration, delay, ease, once, amount] }
  );

  return (
    <Component ref={ref as never} className={className}>
      {children}
    </Component>
  );
}
