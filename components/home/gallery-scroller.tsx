"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

// Pixels per second the row drifts while auto-scrolling.
const AUTO_SCROLL_SPEED = 40;
// How long to wait after the user interacts before auto-scroll resumes.
const RESUME_DELAY_MS = 2500;

// Drag-to-scroll row with a progress thumb. The gallery cards are passed in
// as server-rendered children; the thumb position is written straight to the
// DOM so scrolling doesn't re-render React. The row auto-scrolls back and
// forth, pausing while the user hovers, focuses, drags or touches it.
export function GalleryScroller({ children }: { children: ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isPaused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = 0;
    let direction = 1;
    // scrollLeft may be rounded by the browser, so track the exact position.
    let position = row.scrollLeft;

    row.classList.add("is-autoscrolling");

    const tick = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      const maxScroll = row.scrollWidth - row.clientWidth;

      if (isPaused.current || maxScroll <= 0) {
        position = row.scrollLeft;
      } else {
        position += direction * AUTO_SCROLL_SPEED * dt;
        if (position >= maxScroll) {
          position = maxScroll;
          direction = -1;
        } else if (position <= 0) {
          position = 0;
          direction = 1;
        }
        row.scrollLeft = position;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resumeTimer.current);
      row.classList.remove("is-autoscrolling");
    };
  }, []);

  const pause = () => {
    clearTimeout(resumeTimer.current);
    isPaused.current = true;
  };

  const resumeLater = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isPaused.current = false;
    }, RESUME_DELAY_MS);
  };

  const handleScroll = () => {
    const row = rowRef.current;
    if (!row || !thumbRef.current) return;
    const maxScroll = row.scrollWidth - row.clientWidth;
    if (maxScroll > 0) {
      thumbRef.current.style.top = `${(row.scrollLeft / maxScroll) * 70}%`;
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    const row = rowRef.current;
    if (!row) return;
    isDragging.current = true;
    row.classList.add("is-dragging");
    startX.current = e.pageX - row.offsetLeft;
    scrollLeftStart.current = row.scrollLeft;
  };

  const onMouseMove = (e: MouseEvent) => {
    const row = rowRef.current;
    if (!isDragging.current || !row) return;
    e.preventDefault();
    const x = e.pageX - row.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    row.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    rowRef.current?.classList.remove("is-dragging");
  };

  const onMouseLeave = () => {
    onMouseUp();
    resumeLater();
  };

  return (
    <div className="gallery-wrapper">
      <div
        ref={rowRef}
        className="gallery-row"
        role="region"
        aria-label="Scrollable horizontal image gallery"
        tabIndex={0}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={pause}
        onMouseLeave={onMouseLeave}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
        onFocus={pause}
        onBlur={resumeLater}
      >
        {children}
      </div>

      {/* Thin vertical scrollbar indicator on the far right edge */}
      <div className="gallery-scrollbar-track" aria-hidden="true">
        <div
          ref={thumbRef}
          className="gallery-scrollbar-thumb"
          style={{ top: "0%" }}
        />
      </div>
    </div>
  );
}
