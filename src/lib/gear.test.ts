import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HERO_TRAIN,
  gearHoles,
  gearOutline,
  meshPhase,
  outlinePath,
  spurGear,
} from "./gear";

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

test("spurGear sizes the radii from teeth and module", () => {
  const g = spurGear(20, 0.2);
  assert.ok(close(g.pitchRadius, 2));
  assert.ok(close(g.outerRadius, 2.13));
  assert.ok(close(g.rootRadius, 1.87));
});

test("gearOutline emits four points per tooth, all on the root or tip circle", () => {
  const g = spurGear(12, 0.2);
  const points = gearOutline(g);
  assert.equal(points.length, 48);
  for (const [x, y] of points) {
    const r = Math.hypot(x, y);
    assert.ok(close(r, g.rootRadius) || close(r, g.outerRadius), `radius ${r}`);
  }
});

test("tooth 0 is centred on +x", () => {
  const [, tipA, tipB] = gearOutline(spurGear(10, 0.2));
  assert.ok(close(tipA[1], -tipB[1]));
  assert.ok(tipA[0] > 0 && tipB[0] > 0);
});

test("gearOutline rejects impossible gears", () => {
  assert.throws(() => gearOutline(spurGear(2, 0.2)), RangeError);
  assert.throws(
    () => gearOutline({ teeth: 10, pitchRadius: 1, outerRadius: 1, rootRadius: 1.2 }),
    RangeError,
  );
  assert.throws(() => gearOutline(spurGear(10, 0.2), 0.3, 0.5), RangeError);
});

test("gearHoles fit inside the root circle and clear the bore", () => {
  for (const gear of [HERO_TRAIN.driver, HERO_TRAIN.driven]) {
    const [bore, ...ring] = gearHoles(gear);
    assert.equal(ring.length, gear.teeth >= 18 ? 6 : 4);
    for (const hole of ring) {
      const centre = Math.hypot(hole.x, hole.y);
      assert.ok(centre + hole.r < gear.rootRadius, "hole breaks through the rim");
      assert.ok(centre - hole.r > bore.r, "hole cuts into the bore");
    }
  }
});

test("meshPhase gives equal gears side by side a gap facing the driver's tooth", () => {
  const g = spurGear(10, 0.2);
  const pitch = (Math.PI * 2) / 10;
  const expected = (((Math.PI - pitch / 2) % pitch) + pitch) % pitch;
  assert.ok(close(meshPhase(g, g, 0), expected));
});

test("the hero train's driven gear rests at 20°", () => {
  assert.ok(close(HERO_TRAIN.drivenPhase, (20 * Math.PI) / 180, 1e-6));
});

test("outlinePath writes a closed path rounded to 3 decimals", () => {
  assert.equal(
    outlinePath([
      [0, 0],
      [1.23456, -0.00001],
      [0, 1],
    ]),
    "M0 0 L1.235 0 L0 1 Z",
  );
});
