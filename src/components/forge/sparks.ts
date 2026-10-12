import { createPool, emit, step } from "./sparkPool";

/** Where ambient embers rise from: the bottom edge of the returned rect, in viewport px. */
export type AmbientSource = () => DOMRect | null;

export type SparksController = {
  burst(x: number, y: number, intensity?: number): void;
  setAmbientSource(source: AmbientSource | null): void;
  destroy(): void;
};

const CAPACITY = 120;
const EMBERS_PER_SECOND = 14;

/** Hot to cold: a spark's colour as its life runs out. */
function sparkColor(t: number): string {
  if (t > 0.7) return "#ffe8c2";
  if (t > 0.45) return "#ff8c00";
  if (t > 0.2) return "#ff5500";
  return "#c4161c";
}

/**
 * Runs the sparks overlay on a fixed, full-viewport canvas. The loop only runs
 * while something is alive or an ambient source is set, so an idle page costs
 * nothing, and browsers already pause requestAnimationFrame in hidden tabs.
 */
export function startSparks(canvas: HTMLCanvasElement): SparksController {
  const context = canvas.getContext("2d");
  if (!context) return { burst() {}, setAmbientSource() {}, destroy() {} };
  const ctx = context;

  const pool = createPool(CAPACITY);
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let carry = 0;
  let ambient: AmbientSource | null = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  function emitEmbers(dt: number) {
    const rect = ambient?.();
    if (!rect || rect.bottom < 0 || rect.top > height) return;
    carry += dt * EMBERS_PER_SECOND;
    while (carry >= 1) {
      carry -= 1;
      emit(pool, rect.left + Math.random() * rect.width, Math.min(rect.bottom, height) - 4, 1, {
        angle: -Math.PI / 2,
        spread: 0.7,
        speed: 70,
        life: 3.2,
        gravity: -0.06,
      });
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const s of pool.sparks) {
      if (s.life <= 0) continue;
      const t = s.life / s.maxLife;
      ctx.globalAlpha = Math.min(1, t * 1.4);
      ctx.strokeStyle = sparkColor(t);
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      // A short streak back along its path reads as speed.
      ctx.lineTo(s.x - s.vx * 0.018, s.y - s.vy * 0.018);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (ambient) emitEmbers(dt);
    const alive = step(pool, dt);
    draw();
    raf = alive > 0 || ambient ? requestAnimationFrame(frame) : 0;
  }

  function wake() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    burst(x, y, intensity = 1) {
      emit(pool, x, y, Math.round(18 * intensity), {
        speed: 420 * Math.sqrt(intensity),
        life: 0.9,
      });
      wake();
    },
    setAmbientSource(source) {
      ambient = source;
      if (source) wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("resize", resize);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
