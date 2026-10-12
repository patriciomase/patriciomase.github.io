/**
 * Particle state for the forge sparks, kept apart from any canvas so it can be
 * tested. A fixed pool: emitting past capacity recycles the oldest slot, so
 * the number of live sparks can never exceed it.
 */

export type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  gravity: number;
};

export type SparkPool = { sparks: Spark[]; next: number };

export type EmitOptions = {
  /** Centre of the spray in radians. Default straight up (screen y grows downward). */
  angle?: number;
  /** Total width of the spray in radians. */
  spread?: number;
  /** Top speed in px/s; each spark gets 40–100% of it. */
  speed?: number;
  /** Top lifetime in seconds; each spark gets 60–100% of it. */
  life?: number;
  /** Multiplier on GRAVITY: 1 for sparks that fall, slightly negative for embers that drift up. */
  gravity?: number;
};

/** px/s², screen space. */
export const GRAVITY = 980;

/** Exponential air drag, per second. */
const DRAG = 1.6;

export function createPool(capacity: number): SparkPool {
  return {
    sparks: Array.from({ length: capacity }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 1,
      gravity: 1,
    })),
    next: 0,
  };
}

export function emit(
  pool: SparkPool,
  x: number,
  y: number,
  count: number,
  options: EmitOptions = {},
  random: () => number = Math.random,
): void {
  const { angle = -Math.PI / 2, spread = Math.PI * 0.9, speed = 420, life = 0.9, gravity = 1 } =
    options;
  for (let i = 0; i < count; i++) {
    const s = pool.sparks[pool.next];
    pool.next = (pool.next + 1) % pool.sparks.length;
    const a = angle + (random() - 0.5) * spread;
    const v = speed * (0.4 + 0.6 * random());
    s.x = x;
    s.y = y;
    s.vx = Math.cos(a) * v;
    s.vy = Math.sin(a) * v;
    s.maxLife = life * (0.6 + 0.4 * random());
    s.life = s.maxLife;
    s.size = 1 + random() * 1.6;
    s.gravity = gravity;
  }
}

/** Advances every live spark by `dt` seconds and returns how many are still alive. */
export function step(pool: SparkPool, dt: number): number {
  const damping = Math.exp(-DRAG * dt);
  let alive = 0;
  for (const s of pool.sparks) {
    if (s.life <= 0) continue;
    s.vy += GRAVITY * s.gravity * dt;
    s.vx *= damping;
    s.vy *= damping;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    if (s.life > 0) alive++;
  }
  return alive;
}
