"use client";

import { useEffect } from "react";

// Smooth-scrolls to the section in the URL hash on first load (e.g. arriving
// at /#faq from another page's navigation).
export function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return null;
}
