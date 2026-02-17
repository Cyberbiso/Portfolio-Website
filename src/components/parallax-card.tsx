"use client";

import { useEffect, useRef } from "react";

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  tilt?: number;
  scrollLift?: number;
  scale?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function ParallaxCard({
  children,
  className = "",
  intensity = 7,
  tilt = 2,
  scrollLift = 8,
  scale = 1.002
}: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let frameId = 0;

    const target = {
      x: 0,
      y: 0,
      scroll: 0
    };

    const current = {
      x: 0,
      y: 0,
      scroll: 0
    };

    const setVars = () => {
      element.style.setProperty("--parallax-tx", `${(current.x * intensity).toFixed(2)}px`);
      element.style.setProperty("--parallax-ty", `${(current.y * intensity).toFixed(2)}px`);
      element.style.setProperty("--parallax-rx", `${(-current.y * tilt).toFixed(2)}deg`);
      element.style.setProperty("--parallax-ry", `${(current.x * tilt).toFixed(2)}deg`);
      element.style.setProperty("--parallax-scroll", `${current.scroll.toFixed(2)}px`);
    };

    const updateScrollTarget = () => {
      const rect = element.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.5;
      const elementMid = rect.top + rect.height * 0.5;
      const distance = clamp((viewportMid - elementMid) / window.innerHeight, -1, 1);

      target.scroll = distance * scrollLift;
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      target.x = clamp((x - 0.5) * 2, -1, 1);
      target.y = clamp((y - 0.5) * 2, -1, 1);
    };

    const onMouseLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const animate = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.scroll += (target.scroll - current.scroll) * 0.08;

      setVars();
      frameId = window.requestAnimationFrame(animate);
    };

    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (finePointer) {
      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseleave", onMouseLeave);
    }

    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget);

    updateScrollTarget();
    frameId = window.requestAnimationFrame(animate);

    return () => {
      if (finePointer) {
        element.removeEventListener("mousemove", onMouseMove);
        element.removeEventListener("mouseleave", onMouseLeave);
      }

      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
    };
  }, [intensity, scrollLift, tilt]);

  return (
    <div
      ref={ref}
      className={`parallax-shell ${className}`.trim()}
      style={{
        "--parallax-scale": String(scale)
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
