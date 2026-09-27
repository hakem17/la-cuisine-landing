import { BusinessHoursGate } from "@/components/business-hours-gate";
import { CONTACT } from "@/lib/contact-info";
import { Phone } from "lucide-react";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || CONTACT.landline.tel;

// PRD Section 5: the Phone Call option is only ever shown during business
// hours (Mon–Fri, 9AM–5PM Gulf Standard Time). Outside those hours it
// renders nothing, leaving WhatsApp as the only contact option.
export function PhoneCallButton({
  className = "outline-button",
}: {
  className?: string;
}) {
  return (
    <BusinessHoursGate>
      <a className={className} href={`tel:${PHONE_NUMBER}`}>
        <Phone size={16} /> Call us now
      </a>
    </BusinessHoursGate>
  );
}
