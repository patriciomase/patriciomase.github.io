"use client";

import { useEffect } from "react";

/** Gap between one element's entrance and the next in the same batch. */
const STAGGER_MS = 90;

/**
 * Longest wait any single element will sit through. Arriving at a section by
 * anchor link, or scrolling fast, can put a dozen elements on screen in one
 * callback; without a cap the last of them would hang back most of a second.
 */
const MAX_STAGGER_STEPS = 5;

/**
 * Reveals anything marked `data-reveal`, and the direct children of anything
 * marked `data-reveal-stagger`, as each one scrolls into view.
 *
 * Every element is observed individually rather than per container, so a card
 * animates when that card arrives -- not when the grid around it does. The
 * stagger then applies to whatever crossed the line together in one callback:
 * a row of cards entering at once cascades, a single card arriving on its own
 * goes immediately.
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

    const observer = new IntersectionObserver(
      (entries) => {
        const arrived = entries.filter((entry) => entry.isIntersecting);
        if (arrived.length === 0) return;

        /* Cascade in reading order. Entries come in observation order, which
           for a wrapped grid is not the order they sit on screen. */
        arrived.sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left,
        );

        arrived.forEach((entry, i) => {
          const step = Math.min(i, MAX_STAGGER_STEPS);
          if (step > 0) {
            (entry.target as HTMLElement).style.transitionDelay =
              `${step * STAGGER_MS}ms`;
          }
          entry.target.classList.add("is-revealed");

          /* Once something has arrived it stays arrived: re-animating on the
             way back up makes a page feel restless rather than alive. */
          observer.unobserve(entry.target);
        });
      },
      /* Fires a little before the element is fully on screen, so the motion
         reads as "already happening" rather than starting under your eyes. */
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    const targets = new Set<Element>();
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => targets.add(el));
    document
      .querySelectorAll("[data-reveal-stagger] > *")
      .forEach((el) => targets.add(el));

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
