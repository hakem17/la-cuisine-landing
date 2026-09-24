"use client";

import { CONTACT } from "@/lib/contact-info";
import { useBusinessHours } from "@/lib/use-business-hours";
import { whatsappLink } from "@/lib/whatsapp";
import { MessageCircle, Phone } from "lucide-react";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || CONTACT.landline.tel;

export function ContactWidget() {
  const canCall = useBusinessHours();

  return (
    <div className="contact-widget" role="complementary" aria-label="Quick contact">
      {canCall && (
        <a
          className="contact-widget__button contact-widget__button--phone"
          href={`tel:${PHONE_NUMBER}`}
          aria-label="Call us now"
          title="Call us now"
        >
          <Phone size={20} />
        </a>
      )}
      <a
        className="contact-widget__button contact-widget__button--whatsapp"
        href={whatsappLink("Bonjour La Cuisine de Manou, I have a question.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={22} />
      </a>
    </div>
  );
}
