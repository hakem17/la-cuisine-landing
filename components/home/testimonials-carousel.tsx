"use client";

import type { Testimonial } from "@/lib/testimonials";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CARD_GAP = 24;
const AUTO_SCROLL_INTERVAL_MS = 1500;
const RESUME_AFTER_INTERACTION_MS = 3000;

// Carousel, pager dots, arrows and the full-review modal. Testimonials are
// fetched on the server and passed in; the section heading stays on the
// server in the page.
export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Testimonial | null>(
    null,
  );

  const cardWidth = (fallback: number) => {
    const first = carouselRef.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + CARD_GAP : fallback;
  };

  const updateState = () => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
    const page = Math.round(el.scrollLeft / cardWidth(300));
    setActivePage(Math.min(testimonials.length - 1, Math.max(0, page)));
  };

  const scrollByCard = (direction: "left" | "right") => {
    const delta = direction === "left" ? -cardWidth(320) : cardWidth(320);
    carouselRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const jumpTo = (index: number) => {
    carouselRef.current?.scrollTo({
      left: index * cardWidth(320),
      behavior: "smooth",
    });
  };

  // Auto-scrolling: advances on a timer, pauses while the visitor is
  // hovering or has just interacted manually, loops back to the start once
  // it reaches the end.
  const isHovering = useRef(false);
  const lastInteraction = useRef(0);
  const pauseAutoScroll = () => {
    lastInteraction.current = Date.now();
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      if (isHovering.current) return;
      if (Date.now() - lastInteraction.current < RESUME_AFTER_INTERACTION_MS)
        return;

      const el = carouselRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard("right");
      }
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      {/* Testimonial Cards Carousel Row */}
      <div
        ref={carouselRef}
        className="testimonials-carousel"
        role="region"
        aria-label="Customer reviews carousel"
        tabIndex={0}
        onScroll={updateState}
        onMouseEnter={() => {
          isHovering.current = true;
        }}
        onMouseLeave={() => {
          isHovering.current = false;
        }}
        onTouchStart={pauseAutoScroll}
      >
        {testimonials.map((item) => (
          <article key={item.id} className="testimonial-box">
            <div className="testimonial-box__top">
              <div
                className="stars-row"
                aria-label={`${item.rating} out of 5 stars`}
              >
                {"★".repeat(item.rating)}
              </div>
            </div>

            <div className="testimonial-box__body">
              <p className="testimonial-box__quote">“{item.quote}”</p>
              <button
                type="button"
                className="testimonial-full-link"
                onClick={() => setSelectedReview(item)}
              >
                Full Review
              </button>
            </div>

            <div className="testimonial-box__name-bar">
              <ReviewerName item={item} />
              <span>{item.event}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation Controls: Dots on Left, Arrow Buttons on Right */}
      <div className="testimonials-controls">
        <div
          className="testimonials-dots"
          role="tablist"
          aria-label="Testimonial pages"
        >
          {testimonials.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-label={`Go to review ${dotIdx + 1}`}
              aria-selected={activePage === dotIdx}
              className={`testimonial-dot ${activePage === dotIdx ? "is-active" : ""}`}
              onClick={() => {
                pauseAutoScroll();
                jumpTo(dotIdx);
              }}
            />
          ))}
        </div>

        <div className="testimonials-arrows" aria-label="Carousel navigation">
          <button
            type="button"
            className="carousel-circle-btn"
            aria-label="Previous testimonials"
            disabled={!canScrollLeft}
            onClick={() => {
              pauseAutoScroll();
              scrollByCard("left");
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="carousel-circle-btn"
            aria-label="Next testimonials"
            disabled={!canScrollRight}
            onClick={() => {
              pauseAutoScroll();
              scrollByCard("right");
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Full Review Modal */}
      {selectedReview && (
        <div
          className="review-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Full review by ${selectedReview.name}`}
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="review-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-modal-close"
              aria-label="Close review modal"
              onClick={() => setSelectedReview(null)}
            >
              <X size={20} />
            </button>
            <div
              className="stars-row"
              aria-label={`${selectedReview.rating} stars`}
            >
              {"★".repeat(selectedReview.rating)}
            </div>
            <blockquote className="review-modal-quote">
              “{selectedReview.quote}”
            </blockquote>
            <div className="review-modal-footer">
              <ReviewerName item={selectedReview} />
              <span>{selectedReview.event}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewerName({ item }: { item: Testimonial }) {
  if (!item.link) return <strong>{item.name}</strong>;
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="testimonial-box__name-link"
    >
      <strong>{item.name}</strong>
    </a>
  );
}
