"use client";

import { useEffect, useRef, useState } from "react";

interface RevealBlockProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
  once?: boolean;
}

export function RevealBlock({
  children,
  className = "",
  delayMs = 0,
  yOffset = 24,
  once = true
}: RevealBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={`reveal-block ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{
        "--reveal-delay": `${delayMs}ms`,
        "--reveal-offset": `${yOffset}px`
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
