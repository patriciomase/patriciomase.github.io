import { test } from "node:test";
import assert from "node:assert/strict";
import { isSoftwareRenderer, resolveMotionTier, type TierEnv } from "./motionTier";

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

test("isSoftwareRenderer spots the CPU rasterisers", () => {
  for (const name of [
    "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "llvmpipe (LLVM 15.0.7, 256 bits)",
    "Microsoft Basic Render Driver",
  ]) {
    assert.equal(isSoftwareRenderer(name), true, name);
  }
});

test("isSoftwareRenderer lets real GPUs through", () => {
  for (const name of [
    "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Mesa Intel(R) UHD Graphics 620 (KBL GT2)",
    "Apple M2",
    "Adreno (TM) 640",
  ]) {
    assert.equal(isSoftwareRenderer(name), false, name);
  }
});
