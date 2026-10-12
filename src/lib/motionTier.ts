/**
 * Which version of the homepage's motion a visitor gets.
 *
 * "full" is the cinematic layer: the three.js hero, GSAP scroll sequences and
 * sparks. "static" is the poster, still sections and colour-only hover heat.
 * Anyone who asks for reduced motion or data saving, or whose browser has no
 * GPU-backed WebGL2, gets "static". `?motion=full` / `?motion=static` override it, for
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

/** The CPU rasterisers browsers fall back to when there's no usable GPU. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function isSoftwareRenderer(name: string): boolean {
  return SOFTWARE_RENDERER.test(name);
}

/**
 * The renderer's name. Firefox and Safari report it in RENDERER; Chrome masks
 * that as "WebKit WebGL" and only gives it through the debug extension.
 */
export function rendererName(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  const basic = String(gl.getParameter(gl.RENDERER));
  if (!/^webkit webgl$/i.test(basic)) return basic;
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : basic;
}

/**
 * WebGL2 that a GPU actually runs. A software rasteriser still hands out a
 * context, and some browsers don't flag it as a performance caveat (headless
 * Chrome's SwiftShader doesn't), but drawing the hero on the CPU blocks the
 * main thread every frame. Those get the poster.
 */
function hasWebGL2(): boolean {
  try {
    const gl = document
      .createElement("canvas")
      .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    const usable = gl !== null && !isSoftwareRenderer(rendererName(gl));
    // Hand the context straight back: browsers cap how many can be live.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return usable;
  } catch {
    return false;
  }
}
