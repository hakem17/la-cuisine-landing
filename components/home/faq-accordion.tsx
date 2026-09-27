"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export type Faq = { q: string; a: string };

// Single-open accordion; the first answer starts expanded.
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="faq-list" role="region" aria-label="FAQ Accordion">
      {faqs.map((faq, i) => {
        const isOpen = activeFaq === i;
        const faqId = `faq-answer-${i}`;
        const btnId = `faq-button-${i}`;
        return (
          <div className="faq-item" key={faq.q}>
            <button
              id={btnId}
              type="button"
              onClick={() => setActiveFaq(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={faqId}
            >
              <span>{faq.q}</span>
              <span className="faq-icon" aria-hidden="true">
                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
              </span>
            </button>
            {isOpen && (
              <div
                id={faqId}
                role="region"
                aria-labelledby={btnId}
                className="faq-answer"
              >
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
