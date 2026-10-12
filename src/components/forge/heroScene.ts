import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Scene,
  ShaderMaterial,
  Shape,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { HERO_TRAIN, gearHoles, gearOutline, type SpurGear } from "@/lib/gear";
import { isSoftwareRenderer, rendererName } from "@/lib/motionTier";

const MOLTEN_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/* Molten metal under a dark crust: domain-warped noise, with bright cracks
   where the noise crosses 0.5. uPool is where the heat gathers (the gears). */
const MOLTEN_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uHeat;
uniform float uAspect;
uniform vec2 uPool;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vec2(vUv.x * uAspect, vUv.y);
  float t = uTime * 0.035;
  vec2 q = vec2(fbm(uv * 2.2 + t), fbm(uv * 2.2 - t + 5.2));
  float n = fbm(uv * 3.0 + q * 1.6 + vec2(0.0, -t * 2.0));
  float d = abs(n - 0.5);
  float crack = 1.0 - smoothstep(0.0, 0.03, d);
  float glow = 1.0 - smoothstep(0.0, 0.16, d);
  vec3 crust = vec3(0.055) * (0.7 + 0.6 * fbm(uv * 9.0));
  vec3 molten = mix(vec3(0.55, 0.05, 0.06), vec3(1.0, 0.33, 0.0), glow);
  molten = mix(molten, vec3(1.0, 0.91, 0.76), crack);
  float pulse = 0.75 + 0.25 * sin(uTime * 0.5 + n * 6.2831);
  vec3 color = crust + molten * (glow * 0.5 + crack) * uHeat * pulse;
  float pool = smoothstep(1.25, 0.15, distance(vUv, uPool));
  gl_FragColor = vec4(color * pool, 1.0);
}`;

/** Where the train sits, how big, and where the molten heat pools (uv). */
type Framing = { x: number; y: number; scale: number; pool: [number, number] };

/** Framing per stage shape, mirrored by `.hero-gears` in home.css. */
const DESKTOP: Framing = { x: 3.0, y: -0.35, scale: 1, pool: [0.78, 0.42] };
const TALL: Framing = { x: 0.7, y: 1.5, scale: 0.62, pool: [0.7, 0.78] };

function gearGeometry(gear: SpurGear): ExtrudeGeometry {
  const points = gearOutline(gear);
  const shape = new Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) shape.lineTo(x, y);
  shape.closePath();
  for (const hole of gearHoles(gear)) {
    const path = new Path();
    path.absarc(hole.x, hole.y, hole.r, 0, Math.PI * 2, true);
    shape.holes.push(path);
  }
  const depth = 0.42;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 28,
  });
  // Centre on z only; x/y are already centred on the gear's axis.
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** Null on software rendering too, so even a forced `?motion=full` keeps the poster there. */
function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    });
    if (isSoftwareRenderer(rendererName(renderer.getContext()))) {
      renderer.dispose();
      renderer.forceContextLoss();
      return null;
    }
    return renderer;
  } catch {
    return null;
  }
}

/**
 * Mounts the hero's forge scene on `canvas`, sized to `stage`, and returns a
 * cleanup that stops it and frees every GPU resource. If WebGL can't start
 * (possible when `?motion=full` forces the tier) it returns a no-op and the
 * poster stays.
 *
 * The two gears mesh: the driven gear turns at the inverse tooth ratio from
 * the rest phase gear.ts computes. Scrolling through the hero turns the train
 * further and cools everything from forge-hot to dull steel. The loop pauses
 * whenever the stage is off screen or the tab is hidden.
 */
export function mountHeroScene(canvas: HTMLCanvasElement, stage: HTMLElement): () => void {
  const renderer = createRenderer(canvas);
  if (!renderer) return () => {};
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.35;

  const molten = new ShaderMaterial({
    vertexShader: MOLTEN_VERTEX,
    fragmentShader: MOLTEN_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uHeat: { value: 1 },
      uAspect: { value: 1 },
      uPool: { value: [...DESKTOP.pool] },
    },
    depthWrite: false,
  });
  const backdrop = new Mesh(new PlaneGeometry(1, 1), molten);
  backdrop.position.z = -4;
  scene.add(backdrop);

  const steel = new MeshStandardMaterial({
    color: new Color(0x5b6068),
    metalness: 1,
    roughness: 0.38,
    emissive: new Color(0xff3c00),
    emissiveIntensity: 0,
  });
  const driver = new Mesh(gearGeometry(HERO_TRAIN.driver), steel);
  const driven = new Mesh(gearGeometry(HERO_TRAIN.driven), steel);
  driven.position.set(HERO_TRAIN.drivenOffset[0], HERO_TRAIN.drivenOffset[1], 0);
  const train = new Group();
  train.add(driver, driven);
  scene.add(train);

  // Forge light from below and in front; a cool steel rim from behind.
  const ember = new PointLight(0xff5a1a, 60, 0, 2);
  ember.position.set(1.2, -2.6, 2.4);
  const rim = new DirectionalLight(0x8a95a5, 1.6);
  rim.position.set(-3, 4, -2);
  scene.add(ember, rim);

  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  let layout: Framing = DESKTOP;

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width === 0 || height === 0) return;
    renderer!.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5));
    renderer!.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Size the backdrop to exactly fill the view at its depth.
    const distance = camera.position.z - backdrop.position.z;
    const viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance;
    backdrop.scale.set(viewHeight * camera.aspect, viewHeight, 1);
    layout = camera.aspect < 0.9 ? TALL : DESKTOP;
    train.scale.setScalar(layout.scale);
    molten.uniforms.uAspect.value = camera.aspect;
    molten.uniforms.uPool.value = [...layout.pool];
  }

  function onPointer(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  }

  let raf = 0;
  let visible = true;
  let last = performance.now();
  let elapsed = 0;
  let firstFrame = true;

  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    const progress = Math.min(Math.max(window.scrollY / Math.max(stage.offsetHeight, 1), 0), 1);
    const heat = 1 - progress * 0.9;

    const turn = elapsed * 0.12 + progress * 1.4;
    driver.rotation.z = turn;
    driven.rotation.z =
      HERO_TRAIN.drivenPhase - turn * (HERO_TRAIN.driver.teeth / HERO_TRAIN.driven.teeth);

    const ease = Math.min(dt * 3, 1);
    tilt.x += (pointer.y * 0.18 - tilt.x) * ease;
    tilt.y += (pointer.x * 0.28 - tilt.y) * ease;
    train.position.set(layout.x, layout.y, 0);
    train.rotation.set(0.18 + tilt.x, -0.42 + tilt.y, 0);

    steel.emissiveIntensity = 0.02 + heat * 0.08;
    ember.intensity = 18 + heat * 55;
    molten.uniforms.uHeat.value = heat;
    molten.uniforms.uTime.value = elapsed;

    renderer!.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      stage.classList.add("is-live");
    }
    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    wake();
  });
  intersection.observe(stage);
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("pointermove", onPointer, { passive: true });

  resize();
  wake();

  return () => {
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("pointermove", onPointer);
    stage.classList.remove("is-live");
    driver.geometry.dispose();
    driven.geometry.dispose();
    backdrop.geometry.dispose();
    steel.dispose();
    molten.dispose();
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
