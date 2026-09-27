"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

// Drag-to-scroll row with a progress thumb. The gallery cards are passed in
// as server-rendered children; the thumb position is written straight to the
// DOM so scrolling doesn't re-render React.
export function GalleryScroller({ children }: { children: ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

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

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
    rowRef.current?.classList.remove("is-dragging");
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
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
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
