"use client";

import React, { useRef, type ReactElement, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  childClassName?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}

export function StaggerChildren({
  children,
  className,
  childClassName,
  stagger = 0.1,
  duration = 0.7,
  delay = 0,
  y = 30,
  once = true,
  amount = 0.2,
}: StaggerChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll(
        `[data-animate="stagger-item"]`
      );
      if (!items || items.length === 0) return;

      if (reducedMotion) {
        // Skip the staggered reveal: render children at their final position.
        gsap.set(items, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top ${80 - amount * 60}%`,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion, stagger, duration, delay, y, once, amount] }
  );

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => {
        if (
          React.isValidElement(child) &&
          (child.type as { displayName?: string }).displayName ===
            StaggerItem.displayName
        ) {
          return React.cloneElement(child as ReactElement<{ className?: string }>, {
            className: [childClassName, child.props.className]
              .filter(Boolean)
              .join(" "),
          });
        }
        return (
          <div key={index} data-animate="stagger-item" className={childClassName}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-animate="stagger-item" className={className}>
      {children}
    </div>
  );
}
StaggerItem.displayName = "StaggerItem";
