"use client";

import { useEffect } from "react";

/** Gap between one card's entrance and the next in the same group. */
const STAGGER_MS = 60;

/**
 * Reveals anything marked `data-reveal` as it scrolls into view, and staggers
 * the direct children of anything marked `data-reveal-stagger`.
 *
 * It only ever *adds* the visible class -- the hidden starting state lives in
 * globals.css behind `@media (scripting: enabled)`. Doing it the other way
 * round, hiding things from here on mount, would flash the content that is
 * already on screen when the page loads, and leave the page blank for anyone
 * whose JS never arrives.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = (el: Element, delayMs = 0) => {
      if (delayMs) (el as HTMLElement).style.transitionDelay = `${delayMs}ms`;
      el.classList.add("is-revealed");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          if (entry.target.hasAttribute("data-reveal-stagger")) {
            Array.from(entry.target.children).forEach((child, i) =>
              reveal(child, i * STAGGER_MS),
            );
          } else {
            reveal(entry.target);
          }

          /* Once something has arrived it stays arrived: re-animating on the
             way back up makes a page feel restless rather than alive. */
          observer.unobserve(entry.target);
        }
      },
      /* Fires a little before the element is fully on screen, so the motion
         reads as "already happening" rather than starting under your eyes. */
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    const targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-stagger]",
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
