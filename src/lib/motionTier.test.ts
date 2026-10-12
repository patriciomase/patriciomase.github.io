import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMotionTier, type TierEnv } from "./motionTier";

const capable: TierEnv = { search: "", reducedMotion: false, saveData: false, webgl2: true };

test("a capable browser gets the full tier", () => {
  assert.equal(resolveMotionTier(capable), "full");
});

test("reduced motion gets static", () => {
  assert.equal(resolveMotionTier({ ...capable, reducedMotion: true }), "static");
});

test("data saver gets static", () => {
  assert.equal(resolveMotionTier({ ...capable, saveData: true }), "static");
});

test("no WebGL2 gets static", () => {
  assert.equal(resolveMotionTier({ ...capable, webgl2: false }), "static");
});

test("?motion=static forces static on a capable browser", () => {
  assert.equal(resolveMotionTier({ ...capable, search: "?motion=static" }), "static");
});

test("?motion=full forces full even with reduced motion and no WebGL2", () => {
  assert.equal(
    resolveMotionTier({ search: "?motion=full", reducedMotion: true, saveData: true, webgl2: false }),
    "full",
  );
});

test("unknown ?motion values are ignored", () => {
  assert.equal(resolveMotionTier({ ...capable, reducedMotion: true, search: "?motion=wild" }), "static");
});
