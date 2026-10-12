import { test } from "node:test";
import assert from "node:assert/strict";
import { GRAVITY, createPool, emit, step } from "./sparkPool";

/** With random() fixed at 0.5 a spark flies exactly along `angle` at 70% speed and 80% life. */
const mid = () => 0.5;

test("a new pool has no live sparks", () => {
  assert.equal(step(createPool(8), 0.016), 0);
});

test("emit brings the requested number of sparks to life", () => {
  const pool = createPool(8);
  emit(pool, 0, 0, 5, {}, mid);
  assert.equal(step(pool, 0.001), 5);
});

test("emitting past capacity recycles slots instead of growing", () => {
  const pool = createPool(4);
  emit(pool, 0, 0, 10, {}, mid);
  assert.equal(pool.sparks.length, 4);
  assert.equal(step(pool, 0.001), 4);
});

test("step moves a spark along its velocity and pulls it down", () => {
  const pool = createPool(1);
  emit(pool, 0, 0, 1, { angle: 0, speed: 100, life: 1, gravity: 1 }, mid);
  step(pool, 0.1);
  const s = pool.sparks[0];
  const damping = Math.exp(-1.6 * 0.1);
  assert.ok(Math.abs(s.x - 70 * damping * 0.1) < 1e-9);
  assert.ok(Math.abs(s.y - GRAVITY * 0.1 * damping * 0.1) < 1e-9);
});

test("embers with negative gravity drift up", () => {
  const pool = createPool(1);
  emit(pool, 0, 0, 1, { speed: 0, gravity: -0.06, life: 2 }, mid);
  step(pool, 0.1);
  assert.ok(pool.sparks[0].y < 0);
});

test("sparks die when their life runs out", () => {
  const pool = createPool(2);
  emit(pool, 0, 0, 2, { life: 0.5 }, mid); // 80% of 0.5 = 0.4s each
  assert.equal(step(pool, 0.3), 2);
  assert.equal(step(pool, 0.2), 0);
});
