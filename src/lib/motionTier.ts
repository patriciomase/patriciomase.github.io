/**
 * Which version of the homepage's motion a visitor gets.
 *
 * "full" is the cinematic layer: the three.js hero, GSAP scroll sequences and
 * sparks. "static" is the poster, still sections and colour-only hover heat.
 * Anyone who asks for reduced motion or data saving, or whose browser has no
 * WebGL2, gets "static". `?motion=full` / `?motion=static` override it, for
 * testing.
 */
export type MotionTier = "full" | "static";

export type TierEnv = {
  search: string;
  reducedMotion: boolean;
  saveData: boolean;
  webgl2: boolean;
};

export function resolveMotionTier(env: TierEnv): MotionTier {
  const forced = new URLSearchParams(env.search).get("motion");
  if (forced === "full" || forced === "static") return forced;
  if (env.reducedMotion || env.saveData || !env.webgl2) return "static";
  return "full";
}

/** Reads the TierEnv from the browser. Client-only: call it from an effect. */
export function detectTierEnv(): TierEnv {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return {
    search: window.location.search,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: connection?.saveData === true,
    webgl2: hasWebGL2(),
  };
}

function hasWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    // Hand the context straight back: browsers cap how many can be live.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}
