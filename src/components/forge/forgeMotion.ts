import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Burst = (x: number, y: number, intensity?: number) => void;

/** Pinning needs the whole Process section to fit on screen at once. */
const PIN_QUERY = "(min-width: 900px) and (min-height: 760px)";

/**
 * Only things that start below the fold get a hidden starting state. What is
 * already on screen when this loads stays as it is; hiding it now would flash.
 */
function belowFold(el: Element): boolean {
  return el.getBoundingClientRect().top > window.innerHeight;
}

/**
 * `.heatable` transitions --heat over 1.4s, which would smear every value GSAP
 * writes, so GSAP sets `transition: none` while it drives heat. This hands
 * both back in one go: the element eases from wherever GSAP left it to its
 * CSS heat, and hover heat works again.
 */
function releaseHeat(el: Element) {
  const style = (el as HTMLElement).style;
  style.removeProperty("transition");
  style.removeProperty("--heat");
}

/**
 * The homepage's scroll choreography. Loaded only for the "full" motion tier,
 * after the page is idle. Returns a cleanup that reverts every tween, trigger
 * and pin, leaving the static page as it was.
 */
export function initForgeMotion(root: HTMLElement, burst: Burst): () => void {
  const mm = gsap.matchMedia();

  // The pin goes first: it inserts spacing that moves everything below it, and
  // triggers created after it measure against the final layout.
  const process = root.querySelector<HTMLElement>("[data-process]");
  if (process && belowFold(process)) {
    mm.add(PIN_QUERY, () => pinnedProcess(process, burst));
    mm.add(`not all and ${PIN_QUERY}`, () => steppedProcess(process, burst));
  }

  const ctx = gsap.context(() => {
    seams(root);
    cards(root);
    hallmarks(root, burst);
  }, root);

  ScrollTrigger.refresh();

  return () => {
    ctx.revert();
    mm.revert();
  };
}

/** Weld seams draw left to right as their section comes up the screen. */
function seams(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-seam]").forEach((section) => {
    if (!belowFold(section)) return;
    gsap.fromTo(
      section,
      { "--seam-draw": 0 },
      {
        "--seam-draw": 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 55%", scrub: 0.6 },
      },
    );
  });
}

/** Cards and capability blocks arrive hot and cool off. */
function cards(root: HTMLElement) {
  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-card]")).filter(belowFold);
  if (targets.length === 0) return;
  // Opacity only, never visibility: hidden content would drop out of the
  // accessibility tree until it was scrolled to.
  gsap.set(targets, { opacity: 0, y: 28, "--heat": 0.9, transition: "none" });
  ScrollTrigger.batch(targets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        clearProps: "opacity,transform",
      });
      gsap.to(batch, {
        "--heat": 0,
        duration: 1.8,
        delay: 0.2,
        ease: "power2.out",
        stagger: 0.09,
        onComplete: () => batch.forEach(releaseHeat),
      });
    },
  });
}

/** Hallmarks are struck onto the steel bar one after another. */
function hallmarks(root: HTMLElement, burst: Burst) {
  const marks = Array.from(root.querySelectorAll<HTMLElement>("[data-hallmark]")).filter(
    belowFold,
  );
  if (marks.length === 0) return;
  gsap.set(marks, { opacity: 0, scale: 1.6 });
  ScrollTrigger.batch(marks, {
    start: "top 85%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((mark, i) => {
        gsap.to(mark, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          delay: i * 0.14,
          ease: "power4.in",
          clearProps: "opacity,transform",
          onComplete: () => {
            const r = mark.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2, 0.4);
          },
        });
      });
    },
  });
}

/**
 * One hammer strike: the step drops in hot, sparks fly, it jolts, then cools.
 * Leaves no inline styles behind once it settles.
 */
function strike(step: HTMLElement, burst: Burst) {
  gsap
    .timeline({
      onComplete: () => {
        releaseHeat(step);
        gsap.set(step, { clearProps: "opacity,transform" });
      },
    })
    .fromTo(
      step,
      { opacity: 0, y: -36, "--heat": 1, transition: "none" },
      { opacity: 1, y: 0, duration: 0.26, ease: "power4.in" },
    )
    .call(() => {
      const r = step.getBoundingClientRect();
      burst(r.left + 24, r.top + r.height / 2, 0.8);
    })
    .to(step, { x: 3, duration: 0.04, yoyo: true, repeat: 3, ease: "none" })
    .to(step, { "--heat": 0.12, duration: 1.4, ease: "power2.out" }, "<");
}

/**
 * Desktop: the Process section pins while the four steps strike in turn and
 * the rail fills. Step 1 strikes on its own trigger as the section rises, not
 * from the pin: the nav link lands exactly on the pin's start, where progress
 * is 0 and onUpdate never fires, which left an empty column.
 */
function pinnedProcess(section: HTMLElement, burst: Burst) {
  const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
  const rail = section.querySelector<HTMLElement>("[data-rail]");
  const struck = new Set<number>();
  const strikeUpTo = (due: number) => {
    for (let i = 0; i < due; i++) {
      if (struck.has(i)) continue;
      struck.add(i);
      strike(steps[i], burst);
    }
  };

  gsap.set(steps, { opacity: 0, y: -36 });
  if (rail) gsap.set(rail, { "--rail": 0 });

  ScrollTrigger.create({
    trigger: section,
    start: "top 60%",
    once: true,
    onEnter: () => strikeUpTo(1),
  });

  ScrollTrigger.create({
    trigger: section,
    start: "top top+=64",
    end: `+=${steps.length * 55}%`,
    pin: true,
    onUpdate: (self) => {
      if (rail) gsap.set(rail, { "--rail": self.progress });
      strikeUpTo(Math.min(steps.length, Math.floor(self.progress * steps.length) + 1));
    },
  });
}

/** Phones and short screens: no pin, each step strikes as it scrolls in. */
function steppedProcess(section: HTMLElement, burst: Burst) {
  const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]")).filter(belowFold);
  gsap.set(steps, { opacity: 0, y: -36 });
  steps.forEach((step) =>
    ScrollTrigger.create({
      trigger: step,
      start: "top 82%",
      once: true,
      onEnter: () => strike(step, burst),
    }),
  );
}
