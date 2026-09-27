"use client";

import { useEffect } from "react";

// Scroll sync for the Why Us section: whichever USP item crosses the trigger
// band becomes active, crossfading its image and emphasising its text. The
// markup is server-rendered; this only toggles `is-active` classes on the
// existing DOM, so scrolling never re-renders React.
export function UspScrollSync({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-usp-index]"),
    );
    const frames = Array.from(
      section.querySelectorAll<HTMLElement>(".usp-visual__frame"),
    );
    if (items.length === 0) return;

    const activate = (index: number) => {
      items.forEach((el, i) => el.classList.toggle("is-active", i === index));
      frames.forEach((el, i) => el.classList.toggle("is-active", i === index));
    };

    // On mobile the image is pinned across the top of the viewport, so the
    // trigger band moves below it instead of sitting at the center.
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    let observer: IntersectionObserver | null = null;

    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Number(
              (entry.target as HTMLElement).dataset.uspIndex,
            );
            if (!Number.isNaN(index)) activate(index);
          });
        },
        {
          rootMargin: mobileQuery.matches
            ? "-62% 0px -28% 0px"
            : "-45% 0px -45% 0px",
          threshold: 0,
        },
      );
      items.forEach((item) => observer?.observe(item));
    };

    observe();
    mobileQuery.addEventListener("change", observe);
    return () => {
      mobileQuery.removeEventListener("change", observe);
      observer?.disconnect();
    };
  }, [sectionId]);

  return null;
}
