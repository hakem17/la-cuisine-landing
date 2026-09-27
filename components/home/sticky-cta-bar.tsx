"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SHOW_AFTER_PX = 600;

// Reveals the bottom booking bar once the visitor scrolls past the hero.
// Content is server-rendered children; only the visibility class is toggled.
export function StickyCtaBar({ children }: { children: ReactNode }) {
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      barRef.current?.classList.toggle(
        "is-visible",
        window.scrollY > SHOW_AFTER_PX,
      );
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside
      ref={barRef}
      className="sticky-cta-bar"
      aria-label="Quick booking actions"
    >
      {children}
    </aside>
  );
}
