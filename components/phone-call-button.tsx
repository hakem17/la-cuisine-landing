"use client";

import { useBusinessHours } from "@/lib/use-business-hours";
import { Phone } from "lucide-react";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+971500000000";

// PRD Section 5: the Phone Call option is only ever shown during business
// hours (Mon–Fri, 9AM–5PM Gulf Standard Time). Outside those hours it
// renders nothing, leaving WhatsApp as the only contact option.
export function PhoneCallButton({
  className = "outline-button",
}: {
  className?: string;
}) {
  const canCall = useBusinessHours();
  if (!canCall) return null;
  return (
    <a className={className} href={`tel:${PHONE_NUMBER}`}>
      <Phone size={16} /> Call us now
    </a>
  );
}
