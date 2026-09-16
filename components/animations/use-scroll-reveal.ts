"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface UseScrollRevealOptions {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  once?: boolean;
  amount?: number;
  start?: string;
}

export function useScrollReveal<T extends HTMLElement>({
  direction = "up",
  distance = 40,
  duration = 0.8,
  delay = 0,
  ease = "power2.out",
  once = true,
  amount = 0.2,
  start,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const xOffset =
      direction === "left" ? distance : direction === "right" ? -distance : 0;
    const yOffset =
      direction === "up" ? distance : direction === "down" ? -distance : 0;

    const tween = gsap.fromTo(
      element,
      { opacity: 0, x: xOffset, y: yOffset },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: element,
          start: start ?? `top ${80 - amount * 60}%`,
          toggleActions: once ? "play none none none" : "play reverse play reverse",
        },
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getById(element.id)?.kill();
    };
  }, [direction, distance, duration, delay, ease, once, amount, start]);

  return ref;
}
