"use client";

import { useEffect } from "react";
import { whenIdle } from "@/lib/idle";
import { useMotion } from "./MotionProvider";

/**
 * Loads the GSAP choreography for the full motion tier once the page is idle,
 * and reverts it on unmount. Renders nothing. If the chunk fails to load, the
 * page simply stays static.
 */
export function ForgeMotionMount() {
  const { tier, burst } = useMotion();

  useEffect(() => {
    if (tier !== "full") return;
    const root = document.getElementById("top");
    if (!root) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      import("./forgeMotion")
        .then((m) => {
          if (!cancelled) cleanup = m.initForgeMotion(root, burst);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, [tier, burst]);

  return null;
}
