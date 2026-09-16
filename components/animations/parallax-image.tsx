"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./use-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ParallaxImage({
  src,
  alt,
  speed = 0.15,
  className,
  containerClassName,
  priority,
  fill,
  width,
  height,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!containerRef.current || !imageRef.current) return;
      if (reducedMotion) {
        // No scroll-driven parallax for users who prefer reduced motion.
        // Reset any inline transform so the image sits at its natural position.
        gsap.set(imageRef.current, { clearProps: "transform" });
        return;
      }

      const yMovement = containerRef.current.offsetHeight * speed;

      gsap.fromTo(
        imageRef.current,
        { y: -yMovement },
        {
          y: yMovement,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion, speed] }
  );

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${containerClassName ?? ""}`}
    >
      <div
        ref={imageRef}
        className={`absolute inset-0 ${fill ? "h-full w-full" : ""} ${className ?? ""}`}
        style={reducedMotion ? undefined : { top: "-15%", bottom: "-15%", height: "130%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill ?? true}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
