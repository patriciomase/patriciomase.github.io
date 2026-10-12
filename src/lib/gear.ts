/**
 * Spur-gear geometry shared by the hero's static poster (SVG) and its three.js
 * scene, so the poster's silhouette is exactly the gear train that later fades
 * in over it. Pure functions with no DOM, so they run on the server too.
 *
 * Coordinates are maths-style (y up), matching three.js. The SVG poster flips
 * its y axis to draw them.
 */

export type Point = [x: number, y: number];

export type SpurGear = {
  teeth: number;
  pitchRadius: number;
  outerRadius: number;
  rootRadius: number;
};

export type Hole = { x: number; y: number; r: number };

/**
 * A gear sized from its tooth count and module (tooth size). Two gears mesh
 * only if they share a module. Addendum and dedendum are both 0.65 module.
 */
export function spurGear(teeth: number, module: number): SpurGear {
  const pitchRadius = (teeth * module) / 2;
  const depth = module * 0.65;
  return {
    teeth,
    pitchRadius,
    outerRadius: pitchRadius + depth,
    rootRadius: pitchRadius - depth,
  };
}

/**
 * Closed outline of a gear with trapezoid teeth, as points around the origin.
 * Tooth i is centred on angle i·(2π/teeth), so tooth 0 points along +x. Each
 * tooth adds four points: root, tip, tip, root. `baseRatio` and `tipRatio` are
 * the share of one tooth pitch the tooth covers at its root and at its tip.
 */
export function gearOutline(gear: SpurGear, baseRatio = 0.5, tipRatio = 0.3): Point[] {
  const { teeth, outerRadius, rootRadius } = gear;
  if (!Number.isInteger(teeth) || teeth < 3) {
    throw new RangeError("a gear needs at least 3 teeth");
  }
  if (!(rootRadius > 0 && rootRadius < outerRadius)) {
    throw new RangeError("rootRadius must be between 0 and outerRadius");
  }
  if (!(tipRatio > 0 && tipRatio <= baseRatio && baseRatio < 1)) {
    throw new RangeError("need 0 < tipRatio <= baseRatio < 1");
  }

  const pitch = (Math.PI * 2) / teeth;
  const baseHalf = (pitch * baseRatio) / 2;
  const tipHalf = (pitch * tipRatio) / 2;
  const points: Point[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * pitch;
    points.push(
      polar(rootRadius, a - baseHalf),
      polar(outerRadius, a - tipHalf),
      polar(outerRadius, a + tipHalf),
      polar(rootRadius, a + baseHalf),
    );
  }
  return points;
}

/** The bore, then a ring of lightening holes: six on big gears, four on small. */
export function gearHoles(gear: SpurGear): Hole[] {
  const holes: Hole[] = [{ x: 0, y: 0, r: gear.rootRadius * 0.2 }];
  const count = gear.teeth >= 18 ? 6 : 4;
  const ring = gear.rootRadius * 0.58;
  const r = gear.rootRadius * (count === 6 ? 0.17 : 0.2);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.PI / count;
    holes.push({ x: ring * Math.cos(a), y: ring * Math.sin(a), r });
  }
  return holes;
}

/**
 * The rotation (radians, within one tooth pitch) the driven gear needs so its
 * teeth sit in the driver's gaps, when its centre lies at `angle` from the
 * driver's and the driver is at rotation 0. While running:
 * driven rotation = phase − driver rotation × (driver.teeth / driven.teeth).
 */
export function meshPhase(driver: SpurGear, driven: SpurGear, angle: number): number {
  const pitch = (Math.PI * 2) / driven.teeth;
  const raw = angle * (driver.teeth / driven.teeth) + angle + Math.PI - pitch / 2;
  return ((raw % pitch) + pitch) % pitch;
}

/** The hero's train: a 22-tooth driver turning a 12-tooth gear up and to its left. */
export const HERO_TRAIN = (() => {
  const driver = spurGear(22, 0.172);
  const driven = spurGear(12, 0.172);
  const angle = (150 * Math.PI) / 180;
  // A hair of clearance so the trapezoid teeth never visibly overlap.
  const distance = driver.pitchRadius + driven.pitchRadius + 0.02;
  return {
    driver,
    driven,
    angle,
    distance,
    drivenOffset: polar(distance, angle),
    drivenPhase: meshPhase(driver, driven, angle),
  };
})();

/** SVG path data for a closed outline, rounded so server and client markup agree. */
export function outlinePath(points: Point[]): string {
  return (
    points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`).join(" ") +
    " Z"
  );
}

function polar(r: number, a: number): Point {
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** Three decimals, and never "-0". */
export function round(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return (r === 0 ? 0 : r).toString();
}
