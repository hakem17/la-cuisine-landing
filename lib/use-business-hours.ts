"use client";

import { useEffect, useState } from "react";
import { isBusinessHours } from "@/lib/business-hours";

// Returns whether it's currently Mon–Fri 9AM–5PM Gulf Standard Time.
// Starts as false (SSR-safe) and updates once mounted in the browser.
export function useBusinessHours() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setOpen(isBusinessHours());
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return open;
}
