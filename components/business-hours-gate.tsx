"use client";

import { isBusinessHours } from "@/lib/business-hours";
import { useEffect, useState, type ReactNode } from "react";

// Renders its (server-rendered) children only during business hours
// (Mon–Fri 9AM–5PM Gulf Standard Time). Starts hidden so server HTML and the
// first client render match, then re-checks every minute.
export function BusinessHoursGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setOpen(isBusinessHours());
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return open ? children : null;
}
