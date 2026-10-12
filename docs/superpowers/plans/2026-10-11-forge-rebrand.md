# Forge Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the public site (homepage + blog) as "Software Craftsmanship & The Industrial Forge": dark cast iron, forge amber, steel, weld seams, sparks, and a three.js gear hero, with the copy rewritten in EN and ES.

**Architecture:** The homepage is split into one component per section, fed by a typed data module and the existing i18n dictionary. Styling is plain CSS split into tokens/base/home/blog files, with one registered custom property (`--heat`) driving every hot-metal effect. The cinematic layer (sparks, GSAP scroll sequences, three.js hero) sits behind a single motion-tier switch. Its heavy libraries are dynamically imported after idle, and it can be removed without breaking the page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, plain CSS, `next/font` (Big Shoulders, Inter, JetBrains Mono), GSAP 3.15 + ScrollTrigger, three.js 0.186, Node's built-in test runner via `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-10-11-forge-rebrand-design.md`. Read it before starting; it holds the decisions this plan implements.

## Global Constraints

- **Copy rule: no new claims.** Every sentence restates something already on the site at commit `15c49f8`. Every string ships in EN and Rioplatense ES (voseo).
- `src/app/(admin)/**` must not change. No database schema, server action or BotID changes.
- Plain CSS only, no Tailwind. Tokens exactly: `--iron #121212`, `--iron-raised #1a1a1a`, `--seam #2a2a2a`, `--ash #ece8e1`, `--steel #8a95a5`, `--ember #ff5500`, `--ember-2 #ff8c00`, `--molten #c4161c`, `--white-hot #ffe8c2`.
- Only `src/components/forge/heroScene.ts` imports `three`. Only `src/components/forge/forgeMotion.ts` imports `gsap`. Both are loaded with dynamic `import()` after idle, and only for motion tier `"full"`.
- Content is complete with JS disabled. Hidden starting states are applied only by GSAP, and only to elements below the fold when it initialises.
- Performance budget, measured on a production build against the Task 1 baseline:
  - ≤ ~200 KB gzip of added JS on `/?motion=full`
  - CLS 0
  - Lighthouse mobile performance ≥ 90
  - accessibility ≥ baseline
- Exact dependency versions, installed with `--save-exact`: `gsap@3.15.0`, `three@0.186.1`, `@types/three@0.186.0`.
- Fonts via `next/font/google`: `Big_Shoulders` (Google renamed "Big Shoulders Display" to "Big Shoulders"; it has `wght` + `opsz` axes), `Inter` (existing), `JetBrains_Mono`.
- Work happens on the local branch `forge-rebrand`, with one commit per task. **Never push.** Never stage the untracked `.agents/`, `.claude/`, `AGENTS.md`, `CLAUDE.md` or `skills-lock.json`.
- Commit messages follow the repo style (an imperative sentence, no `feat:` prefix) and end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74
  ```
- Deliberate deviations from the spec's wording (same intent):
  - The GSAP and three.js entry points are plain modules (`forgeMotion.ts`, `heroScene.ts`) mounted by small components, rather than `.tsx` components.
  - The header's scroll-progress line uses the same CSS scroll-driven animation as the blog's, not GSAP.
  - The hero poster lands with the restructure (Task 3), so the hero looks complete after every task.
  - Buttons keep the classes `.btn` (molten) and `.btn.secondary` (steel).
  - Cards don't lift on hover; heat is the hover state.
  - Task order: the copy and restructure (T3) land before the stylesheet (T4), so no CSS is written for markup that's about to be replaced.

## Commands used throughout

```bash
npm test                         # node:test via tsx, all src/**/*.test.ts (added in Task 2)
npx tsc --noEmit                 # types; a missing ES key is a type error
npm run dev                      # http://localhost:3000, for iterating
npm run build && npm run start   # production build on http://localhost:3000; start stays running, so background it
node scripts/lighthouse-summary.mjs <label> [url]   # added in Task 1; needs `npm run start` running
```

Stop any running `npm run dev` before `npm run start`; both use port 3000.

## File map

| File | Status | Responsibility |
| --- | --- | --- |
| `scripts/lighthouse-summary.mjs` | create (T1) | Runs Lighthouse mobile against the local server and prints the budget numbers |
| `src/lib/gear.ts` (+ `.test.ts`) | create (T2) | Pure spur-gear geometry shared by the SVG poster and the 3D scene |
| `src/lib/i18n.ts` | modify (T3) | All copy, EN + ES |
| `src/components/home/data.ts` | create (T3) | Typed content shape: work cards + spec rows, process steps, capabilities, tools, experience |
| `src/components/home/Kicker.tsx` | create (T3) | The `NN — LABEL` section label |
| `src/components/home/HeroPoster.tsx` | create (T3) | Static stage: forge glow and the SVG gear train |
| `src/components/home/{Hero,Process,Works,Capabilities,Experience,Commission}.tsx` | create (T3), modified (T5, T7) | One component per homepage section |
| `src/components/PortfolioPage.tsx` | modify (T3, T5, T6) | Composes sections only |
| `src/components/SiteHeader.tsx` | modify (T3) | Nav links |
| `src/components/ScrollReveal.tsx` | delete (T3) | Replaced by GSAP in T6 |
| `src/styles/{tokens,base,home,blog}.css` | create (T4) | The forge stylesheet |
| `src/app/globals.css` | delete (T4) | Split into `src/styles/` |
| `src/app/(site)/layout.tsx` | modify (T4) | Fonts and stylesheet imports |
| `src/components/{SiteFooter,BlogIndex,PostArticle}.tsx` | modify (T4) | Drop `bordered`; plate classes on post cards |
| `src/app/icon.svg` | modify (T4) | Steel favicon |
| `src/lib/motionTier.ts` (+ `.test.ts`) | create (T5) | `"full" \| "static"` decision |
| `src/lib/idle.ts` | create (T5) | `whenIdle()` helper |
| `src/components/forge/sparkPool.ts` (+ `.test.ts`) | create (T5) | Pure particle state |
| `src/components/forge/sparks.ts` | create (T5) | Canvas runner for the pool |
| `src/components/forge/MotionProvider.tsx` | create (T5) | Tier and sparks context |
| `src/components/ContactForm.tsx` | modify (T5) | `onSent` callback |
| `src/components/forge/forgeMotion.ts` | create (T6) | GSAP choreography (the only gsap import) |
| `src/components/forge/ForgeMotionMount.tsx` | create (T6) | Loads `forgeMotion` after idle |
| `src/components/forge/heroScene.ts` | create (T7) | three.js scene (the only three import) |
| `README.md` | modify (T2, T4, T7) | Test command, stylesheet layout, motion layer |
| spec file | modify (T1, T8) | Baseline and final numbers |

---

### Task 1: Measurement script and baseline

**Files:**
- Create: `scripts/lighthouse-summary.mjs`
- Modify: `docs/superpowers/specs/2026-10-11-forge-rebrand-design.md` (add a "Baseline" table to section 5)

**Interfaces:**
- Produces: `node scripts/lighthouse-summary.mjs <label> [url]`, which prints JSON `{ label, performance, accessibility, lcp, cls, tbt, scriptKB, report }`. Every later task uses it.

- [ ] **Step 1: Write the script**

```js
// Runs Lighthouse (its default mobile profile) against a local production
// server and prints the numbers the forge rebrand's budget is judged on.
//
//   npm run build && npm run start        (leave it running)
//   node scripts/lighthouse-summary.mjs <label> [url]
//
// Reports land in the OS temp dir as lh-<label>.report.{json,html}.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const label = process.argv[2] ?? "run";
const url = process.argv[3] ?? "http://localhost:3000/";
const base = join(tmpdir(), `lh-${label}`);

execFileSync(
  "npx",
  [
    "--yes",
    "lighthouse",
    url,
    "--only-categories=performance,accessibility",
    "--output=json",
    "--output=html",
    `--output-path=${base}`,
    "--chrome-flags=--headless=new",
    "--quiet",
  ],
  { stdio: "inherit" },
);

const report = JSON.parse(readFileSync(`${base}.report.json`, "utf8"));
const audits = report.audits;
const script = audits["resource-summary"].details.items.find(
  (item) => item.resourceType === "script",
);

console.log(
  JSON.stringify(
    {
      label,
      url,
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      lcp: audits["largest-contentful-paint"].displayValue,
      cls: audits["cumulative-layout-shift"].displayValue,
      tbt: audits["total-blocking-time"].displayValue,
      scriptKB: Math.round((script?.transferSize ?? 0) / 1024),
      report: `${base}.report.html`,
    },
    null,
    2,
  ),
);
```

- [ ] **Step 2: Build and start the current site**

The branch so far differs from `master` only in docs, so this measures `master`'s code.

Run: `npm run build`, then `npm run start` in the background.
Expected: `▲ Next.js 16.2.10` … `Ready` on `http://localhost:3000`.

- [ ] **Step 3: Measure the baseline**

Run:
```bash
node scripts/lighthouse-summary.mjs baseline
node scripts/lighthouse-summary.mjs baseline-full "http://localhost:3000/?motion=full"
```
Expected: two JSON blocks. The `?motion=full` URL renders identically today. It's measured so later tasks have a like-for-like comparison, because headless Chrome has no WebGL and only `?motion=full` forces the three.js download.

- [ ] **Step 4: Record the baseline in the spec**

In the spec's section 5, replace the paragraph that starts `**Baseline first:**` with:

```markdown
**Baseline** (measured on the pre-rebrand code, production build, Lighthouse mobile):

| URL | Perf | A11y | LCP | CLS | TBT | Script KB (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | <performance> | <accessibility> | <lcp> | <cls> | <tbt> | <scriptKB> |
| `/?motion=full` | <performance> | <accessibility> | <lcp> | <cls> | <tbt> | <scriptKB> |

Each phase is compared against it.
```

Fill each `<…>` cell with the value printed in Step 3. These are recorded measurements, not placeholders to leave in.

- [ ] **Step 5: Stop the server and commit**

```bash
git add scripts/lighthouse-summary.mjs docs/superpowers/specs/2026-10-11-forge-rebrand-design.md
git commit -m "Add a Lighthouse summary script and record the pre-rebrand baseline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

---

### Task 2: Test runner and gear geometry

**Files:**
- Modify: `package.json` (add `test` script)
- Create: `src/lib/gear.ts`
- Test: `src/lib/gear.test.ts`
- Modify: `README.md` (Local development block)

**Interfaces:**
- Produces (from `src/lib/gear.ts`):
  - `type Point = [x: number, y: number]`
  - `type SpurGear = { teeth: number; pitchRadius: number; outerRadius: number; rootRadius: number }`
  - `type Hole = { x: number; y: number; r: number }`
  - `spurGear(teeth: number, module: number): SpurGear`
  - `gearOutline(gear: SpurGear, baseRatio?: number, tipRatio?: number): Point[]`
  - `gearHoles(gear: SpurGear): Hole[]`
  - `meshPhase(driver: SpurGear, driven: SpurGear, angle: number): number`
  - `outlinePath(points: Point[]): string`
  - `round(n: number): string` (three decimals, never "-0"; HeroPoster uses it)
  - `HERO_TRAIN: { driver: SpurGear; driven: SpurGear; angle: number; distance: number; drivenOffset: Point; drivenPhase: number }`

- [ ] **Step 1: Add the test script**

In `package.json` `"scripts"`, after `"start": "next start",` add:

```json
    "test": "tsx --test \"src/**/*.test.ts\"",
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/gear.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL, with an error resolving `./gear` (module not found).

- [ ] **Step 4: Implement `src/lib/gear.ts`**

```ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 8 tests, 0 failures.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 7: Document the test command**

In `README.md`, in the "Local development" code block, after the `npm run dev` line add:

```bash
npm test               # unit tests (node:test via tsx)
```

- [ ] **Step 8: Commit**

```bash
git add package.json src/lib/gear.ts src/lib/gear.test.ts README.md
git commit -m "Add gear geometry for the forge hero, with a node:test runner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

---

### Task 3: New copy and the homepage restructure

The homepage becomes six section components with the new EN/ES copy. The new markup has no styles until Task 4, so in this task the page looks like plain HTML under the old stylesheet. That is expected.

**Files:**
- Modify: `src/lib/i18n.ts`
- Create: `src/components/home/data.ts`, `Kicker.tsx`, `HeroPoster.tsx`, `Hero.tsx`, `Process.tsx`, `Works.tsx`, `Capabilities.tsx`, `Experience.tsx`, `Commission.tsx` (all in `src/components/home/`)
- Modify: `src/components/PortfolioPage.tsx`, `src/components/SiteHeader.tsx`
- Delete: `src/components/ScrollReveal.tsx`

**Interfaces:**
- Consumes: `HERO_TRAIN`, `gearHoles`, `gearOutline`, `outlinePath`, `round`, `type SpurGear` from `@/lib/gear` (Task 2); `useLanguage()` → `{ locale, setLocale, t(key: MessageKey): string }`.
- Produces: the DOM hooks later tasks rely on:
  - `.hero-stage` (the stage container in `Hero`)
  - `section[data-seam]` on every section after the hero
  - `[data-process]` on the Process section, `[data-step]` on each step, `[data-rail]` on the rail fill
  - `[data-card]` on work cards and capability blocks
  - `[data-hallmark]` on experience logos
  - `.work-order` wrapping the contact form

  Also exported from `data.ts`: `type Text`, `textOf(t, text)`, `WORK_CARDS`, `PROCESS_STEPS`, `CAPABILITIES`, `TOOLS`, `EXPERIENCE`.

- [ ] **Step 1: Update the English dictionary**

In `src/lib/i18n.ts`, inside `const en = { … }`:

1. Replace the `metaDescription` value with:
   ```ts
   metaDescription:
     "Portfolio of Patricio Gabriel Maseda, a software craftsman and product-minded senior engineer who shapes product ideas and team workflows into software built to last: interfaces, internal tools, automation, and AI-assisted processes.",
   ```
2. Replace the line `"nav.about": "About",` with `"nav.process": "Process",`.
3. Replace every line from `"hero.eyebrow"` through `"hero.portrait": "Portrait of Patricio Gabriel Maseda",` with:
   ```ts
   "hero.eyebrow": "Software craftsman · Senior engineer · Since 2011",
   "hero.title": "I shape product ideas and team workflows into software",
   "hero.titleHot": "built to last.",
   "hero.lead":
     "Interfaces, internal tools, automation, and AI-assisted processes, made with attention to product feel, maintainable code, and everyday usability.",
   "hero.viewWork": "See the work",
   "hero.contact": "Start a commission",
   "kicker.workshop": "The workshop",
   "kicker.process": "The process",
   "kicker.works": "Forged works",
   "kicker.capabilities": "Capabilities",
   "kicker.marks": "Maker's marks",
   "kicker.commission": "Commission",
   "process.title": "I build things that don't get in the way.",
   "process.intro":
     "I have been building software since 2011, across product, architecture, and implementation details, with a bias toward tools that are clear, fast, and easy to maintain.",
   "process.portrait": "Portrait of Patricio Gabriel Maseda",
   "process.portraitCaption": "The craftsman",
   "process.stepsLabel": "How a build comes together",
   "process.step1.title": "Raw material",
   "process.step1.body":
     "Every build starts with the product and the people using it: the idea, the team's real workflow, and what has to get easier.",
   "process.step2.title": "Architecture",
   "process.step2.body":
     "Designing the system before the first weld: services, data, and clear boundaries, so it stays easy to maintain.",
   "process.step3.title": "Build & weld",
   "process.step3.body":
     "Backend services and interfaces, joined into one product. AI-assisted by default, to shorten feedback loops and get from idea to working software quickly.",
   "process.step4.title": "Temper & test",
   "process.step4.body":
     "Delivery, monitoring, and observability, so it keeps holding up in everyday use.",
   ```
4. After the line `"work.card6.link": "fatbeats.org",` insert:
   ```ts
   "work.ownMark": "Maker's own",
   "work.specLabel": "Spec",
   "spec.scale": "Scale",
   "spec.control": "Control",
   "spec.access": "Access",
   "spec.handles": "Handles",
   "spec.handsOff": "Hands off to",
   "spec.focus": "Focus",
   "spec.usedBy": "Used by",
   "spec.platform": "Platform",
   "spec.role": "Role",
   "spec.cues": "Cues",
   "spec.runsIn": "Runs in",
   "spec.builtOn": "Built on",
   "spec.modes": "Modes",
   "spec.privacy": "Privacy",
   "work.spec.privateClient": "Private client system",
   "work.spec.webMobile": "Web · Mobile",
   "work.card1.spec.scale": "Single unit → whole building",
   "work.card1.spec.control": "Remote",
   "work.card2.spec.handles": "Partial progress · Validation · Resuming days later",
   "work.card2.spec.handsOff": "Follow-up teams",
   "work.card3.spec.focus": "Fast pages · CMS-driven content · Clean analytics",
   "work.card3.spec.usedBy": "Merchandising and marketing teams",
   "work.card4.spec.handles": "Installments · Multiple currencies · Inflation tracking",
   "work.card4.spec.role": "Designed, built, and run by me",
   "work.card5.spec.cues": "Audio · Haptics",
   "work.card5.spec.handles": "Custom routines · Reminders · Streaks · Sync · Share by link",
   "work.card6.spec.runsIn": "The browser, entirely",
   "work.card6.spec.modes": "A dozen, tunable live",
   "work.card6.spec.privacy": "Audio never leaves the browser",
   ```
5. Replace every line from `"about.eyebrow": "About",` through `"skills.teamCollaboration": "Team collaboration",` with:
   ```ts
   "skills.productEngineering": "Product engineering",
   "skills.systemArchitecture": "System architecture",
   "skills.aiWorkflows": "AI workflows",
   "skills.teamCollaboration": "Team collaboration",
   "capabilities.title": "What I bring to a build",
   "capabilities.architecture.body":
     "Designing systems end to end, from backend services to the boundaries between them.",
   "capabilities.product.body":
     "Product delivery across the stack: interfaces, internal tools, and the services behind them.",
   "capabilities.ai.body":
     "AI-assisted by default, to shorten feedback loops and refine how a team works.",
   "capabilities.monitoring.title": "Monitoring & performance",
   "capabilities.monitoring.body":
     "Performance and observability, with monitoring owned as part of delivery.",
   "capabilities.team.body": "Owning delivery alongside the team, hiring included.",
   "capabilities.tools": "Tools of the trade",
   ```
6. After the line starting `"contact.invalid":` insert `"contact.orderLabel": "Work order",`.

- [ ] **Step 2: Update the Spanish dictionary**

Inside `const es: Record<MessageKey, string> = { … }`, make the same six edits:

1. `metaDescription`:
   ```ts
   metaDescription:
     "Portfolio de Patricio Gabriel Maseda, artesano de software e ingeniero senior orientado a producto, que transforma ideas de producto y procesos de equipo en software hecho para durar: interfaces, herramientas internas, automatización y procesos asistidos por IA.",
   ```
2. Replace `"nav.about": "Sobre mí",` with `"nav.process": "Proceso",`.
3. Replace `"hero.eyebrow"` through `"hero.portrait": "Retrato de Patricio Gabriel Maseda",` with:
   ```ts
   "hero.eyebrow": "Artesano de software · Ingeniero senior · Desde 2011",
   "hero.title":
     "Doy forma a ideas de producto y procesos de equipo hasta convertirlos en software",
   "hero.titleHot": "hecho para durar.",
   "hero.lead":
     "Interfaces, herramientas internas, automatización y procesos asistidos por IA, hechos con atención a la experiencia, la calidad del código y el uso cotidiano.",
   "hero.viewWork": "Ver los trabajos",
   "hero.contact": "Hacer un encargo",
   "kicker.workshop": "El taller",
   "kicker.process": "El proceso",
   "kicker.works": "Obras forjadas",
   "kicker.capabilities": "Capacidades",
   "kicker.marks": "Marcas del oficio",
   "kicker.commission": "Encargo",
   "process.title": "Hago software que resuelve.",
   "process.intro":
     "Desarrollo software desde 2011, en la intersección entre producto, arquitectura e implementación, con preferencia por herramientas claras, rápidas y fáciles de mantener.",
   "process.portrait": "Retrato de Patricio Gabriel Maseda",
   "process.portraitCaption": "El artesano",
   "process.stepsLabel": "Cómo toma forma cada proyecto",
   "process.step1.title": "Materia prima",
   "process.step1.body":
     "Todo empieza por el producto y las personas que lo usan: la idea, la forma real de trabajar del equipo y lo que tiene que volverse más simple.",
   "process.step2.title": "Arquitectura",
   "process.step2.body":
     "Diseñar el sistema antes de la primera soldadura: servicios, datos y límites claros, para que siga siendo fácil de mantener.",
   "process.step3.title": "Construcción y soldadura",
   "process.step3.body":
     "Servicios de backend e interfaces, unidos en un solo producto. Con IA desde el inicio, para acortar los ciclos de validación y pasar de la idea al software funcionando con mayor rapidez.",
   "process.step4.title": "Templado y prueba",
   "process.step4.body":
     "Entrega, monitoreo y observabilidad, para que siga respondiendo en el uso de todos los días.",
   ```
4. After `"work.card6.link": "fatbeats.org",` insert:
   ```ts
   "work.ownMark": "Sello propio",
   "work.specLabel": "Ficha",
   "spec.scale": "Escala",
   "spec.control": "Control",
   "spec.access": "Acceso",
   "spec.handles": "Resuelve",
   "spec.handsOff": "Entrega a",
   "spec.focus": "Foco",
   "spec.usedBy": "Lo usan",
   "spec.platform": "Plataforma",
   "spec.role": "Rol",
   "spec.cues": "Señales",
   "spec.runsIn": "Corre en",
   "spec.builtOn": "Hecho con",
   "spec.modes": "Modos",
   "spec.privacy": "Privacidad",
   "work.spec.privateClient": "Sistema privado de un cliente",
   "work.spec.webMobile": "Web · Móvil",
   "work.card1.spec.scale": "Un equipo → el edificio completo",
   "work.card1.spec.control": "Remoto",
   "work.card2.spec.handles": "Avances parciales · Validación · Retomar días después",
   "work.card2.spec.handsOff": "Equipos de seguimiento",
   "work.card3.spec.focus": "Páginas rápidas · Contenido desde un CMS · Datos confiables",
   "work.card3.spec.usedBy": "Equipos comerciales y de marketing",
   "work.card4.spec.handles": "Cuotas · Varias monedas · Seguimiento de la inflación",
   "work.card4.spec.role": "Lo diseño, desarrollo y mantengo",
   "work.card5.spec.cues": "Audio · Vibración",
   "work.card5.spec.handles":
     "Rutinas propias · Recordatorios · Rachas · Sincronización · Enlaces para compartir",
   "work.card6.spec.runsIn": "Solo el navegador",
   "work.card6.spec.modes": "Una docena, ajustables en vivo",
   "work.card6.spec.privacy": "El audio no sale del navegador",
   ```
5. Replace `"about.eyebrow": "Sobre mí",` through `"skills.teamCollaboration": "Trabajo en equipo",` with:
   ```ts
   "skills.productEngineering": "Ingeniería de producto",
   "skills.systemArchitecture": "Arquitectura de sistemas",
   "skills.aiWorkflows": "Flujos de trabajo con IA",
   "skills.teamCollaboration": "Trabajo en equipo",
   "capabilities.title": "Lo que aporto a cada proyecto",
   "capabilities.architecture.body":
     "Diseño de sistemas de punta a punta, desde los servicios de backend hasta los límites entre ellos.",
   "capabilities.product.body":
     "Entrega de producto en todas las capas: interfaces, herramientas internas y los servicios que las sostienen.",
   "capabilities.ai.body":
     "IA desde el inicio, para acortar los ciclos de validación y mejorar la forma de trabajar.",
   "capabilities.monitoring.title": "Monitoreo y rendimiento",
   "capabilities.monitoring.body":
     "Rendimiento y observabilidad, con el monitoreo como parte de la entrega.",
   "capabilities.team.body":
     "Me hago cargo de la entrega junto al equipo, incluida la formación de equipos.",
   "capabilities.tools": "Herramientas del oficio",
   ```
6. After the line starting `"contact.invalid":` insert `"contact.orderLabel": "Orden de trabajo",`.

- [ ] **Step 3: Create `src/components/home/data.ts`**

```ts
import type { MessageKey } from "@/lib/i18n";

/** A dictionary key, or a literal that reads the same in both languages (product names, APIs). */
export type Text = MessageKey | { literal: string };

export function textOf(t: (key: MessageKey) => string, text: Text): string {
  return typeof text === "string" ? t(text) : text.literal;
}

export type SpecRow = { label: MessageKey; value: Text };

/**
 * Selected-work cards. Copy lives in the dictionary; only shape lives here.
 * `href` is set only on work that is publicly visitable -- the client systems
 * are behind logins and not attributable, so they stay unlinked. Spec rows
 * restate facts the card copy already gives; they never add disclosure.
 */
export const WORK_CARDS: {
  tag: MessageKey;
  when: Extract<MessageKey, "work.ongoing" | "work.recent">;
  title: MessageKey;
  body: MessageKey;
  spec: SpecRow[];
  own?: boolean;
  href?: string;
  hrefLabel?: MessageKey;
  icon?: string;
}[] = [
  {
    tag: "work.card1.tag",
    when: "work.ongoing",
    title: "work.card1.title",
    body: "work.card1.body",
    spec: [
      { label: "spec.scale", value: "work.card1.spec.scale" },
      { label: "spec.control", value: "work.card1.spec.control" },
      { label: "spec.access", value: "work.spec.privateClient" },
    ],
  },
  {
    tag: "work.card2.tag",
    when: "work.recent",
    title: "work.card2.title",
    body: "work.card2.body",
    spec: [
      { label: "spec.handles", value: "work.card2.spec.handles" },
      { label: "spec.handsOff", value: "work.card2.spec.handsOff" },
      { label: "spec.access", value: "work.spec.privateClient" },
    ],
  },
  {
    tag: "work.card3.tag",
    when: "work.recent",
    title: "work.card3.title",
    body: "work.card3.body",
    spec: [
      { label: "spec.focus", value: "work.card3.spec.focus" },
      { label: "spec.usedBy", value: "work.card3.spec.usedBy" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card4.title",
    body: "work.card4.body",
    own: true,
    href: "https://gastoscasa.com",
    hrefLabel: "work.card4.link",
    icon: "/logos/gastoscasa.png",
    spec: [
      { label: "spec.platform", value: "work.spec.webMobile" },
      { label: "spec.handles", value: "work.card4.spec.handles" },
      { label: "spec.role", value: "work.card4.spec.role" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card5.title",
    body: "work.card5.body",
    own: true,
    href: "https://vivaire.app",
    hrefLabel: "work.card5.link",
    icon: "/logos/vivaire.svg",
    spec: [
      { label: "spec.platform", value: "work.spec.webMobile" },
      { label: "spec.cues", value: "work.card5.spec.cues" },
      { label: "spec.handles", value: "work.card5.spec.handles" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card6.title",
    body: "work.card6.body",
    own: true,
    href: "https://fatbeats.org",
    hrefLabel: "work.card6.link",
    spec: [
      { label: "spec.runsIn", value: "work.card6.spec.runsIn" },
      { label: "spec.builtOn", value: { literal: "Web Audio API · Canvas" } },
      { label: "spec.modes", value: "work.card6.spec.modes" },
      { label: "spec.privacy", value: "work.card6.spec.privacy" },
    ],
  },
];

/** The four strikes of the Process section, in order. */
export const PROCESS_STEPS: { title: MessageKey; body: MessageKey }[] = [
  { title: "process.step1.title", body: "process.step1.body" },
  { title: "process.step2.title", body: "process.step2.body" },
  { title: "process.step3.title", body: "process.step3.body" },
  { title: "process.step4.title", body: "process.step4.body" },
];

/** The old skill chips, each grown into a block. Titles reuse the chip labels. */
export const CAPABILITIES: { title: MessageKey; body: MessageKey }[] = [
  { title: "skills.systemArchitecture", body: "capabilities.architecture.body" },
  { title: "skills.productEngineering", body: "capabilities.product.body" },
  { title: "skills.aiWorkflows", body: "capabilities.ai.body" },
  { title: "capabilities.monitoring.title", body: "capabilities.monitoring.body" },
  { title: "skills.teamCollaboration", body: "capabilities.team.body" },
];

/** Product names, untranslated. */
export const TOOLS = ["React", "Next.js", "Node.js", "AWS"];

/**
 * Career history. `date` is a literal except for the current role, whose
 * "present"/"presente" has to translate. `dark` marks logos that are drawn
 * light-on-dark and so need the dark backdrop.
 */
export const EXPERIENCE: {
  initials: string;
  logo: string;
  dark?: boolean;
  role: MessageKey;
  company: string;
  date?: string;
  dateKey?: MessageKey;
}[] = [
  {
    initials: "UT",
    logo: "/logos/utility.svg",
    dark: true,
    role: "experience.utility.role",
    company: "Utility",
    dateKey: "experience.utility.date",
  },
  {
    initials: "MJ",
    logo: "/logos/mejuri.svg",
    role: "experience.mejuri.role",
    company: "Mejuri",
    date: "2019-2023",
  },
  {
    initials: "SD",
    logo: "/logos/spark-digital.png",
    role: "experience.spark.role",
    company: "Spark Digital",
    date: "2014-2019",
  },
  {
    initials: "AV",
    logo: "/logos/avalith.png",
    role: "experience.avalith.role",
    company: "Avalith",
    date: "2012-2014",
  },
  {
    initials: "UTN",
    logo: "/logos/utn.svg",
    dark: true,
    role: "experience.education.role",
    company: "Universidad Tecnológica Nacional",
    date: "2008-2012",
  },
];
```

- [ ] **Step 4: Create `src/components/home/Kicker.tsx`**

```tsx
/** "02 — THE PROCESS": the small mono label that carries the forge metaphor. */
export function Kicker({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="kicker">
      <span className="kicker-index">{index}</span>
      <span className="kicker-dash" aria-hidden="true" />
      {children}
    </p>
  );
}
```

- [ ] **Step 5: Create `src/components/home/HeroPoster.tsx`**

```tsx
import {
  HERO_TRAIN,
  gearHoles,
  gearOutline,
  outlinePath,
  round,
  type SpurGear,
} from "@/lib/gear";

/** A circle as two arcs, so evenodd fill cuts it out of the gear. */
function circlePath(cx: number, cy: number, r: number): string {
  const [x0, x1, y, rr] = [round(cx + r), round(cx - r), round(cy), round(r)];
  return `M${x0} ${y} A${rr} ${rr} 0 1 0 ${x1} ${y} A${rr} ${rr} 0 1 0 ${x0} ${y} Z`;
}

function gearPath(gear: SpurGear): string {
  const holes = gearHoles(gear).map(({ x, y, r }) => circlePath(x, y, r));
  return [outlinePath(gearOutline(gear)), ...holes].join(" ");
}

const DRIVER = gearPath(HERO_TRAIN.driver);
const DRIVEN = gearPath(HERO_TRAIN.driven);
const DRIVEN_TRANSFORM = `translate(${round(HERO_TRAIN.drivenOffset[0])} ${round(
  HERO_TRAIN.drivenOffset[1],
)}) rotate(${round((HERO_TRAIN.drivenPhase * 180) / Math.PI)})`;

/**
 * The hero's static stage: a forge glow and the same two-gear train the
 * three.js scene renders, drawn as SVG. It is the whole hero visual on the
 * static motion tier, and what the canvas fades in over on the full one.
 */
export function HeroPoster() {
  return (
    <div className="hero-poster">
      <svg className="hero-gears" viewBox="-3.8 -2.7 5.9 4.8" focusable="false">
        <defs>
          <linearGradient id="poster-steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b737e" />
            <stop offset="0.45" stopColor="#30343a" />
            <stop offset="1" stopColor="#15171a" />
          </linearGradient>
        </defs>
        {/* The geometry is y-up, like the three.js scene; SVG is y-down. */}
        <g transform="scale(1 -1)">
          <path
            d={DRIVER}
            fill="url(#poster-steel)"
            fillRule="evenodd"
            stroke="#ff5500"
            strokeOpacity="0.55"
            strokeWidth="0.02"
          />
          <g transform={DRIVEN_TRANSFORM}>
            <path
              d={DRIVEN}
              fill="url(#poster-steel)"
              fillRule="evenodd"
              stroke="#ff5500"
              strokeOpacity="0.55"
              strokeWidth="0.02"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/home/Hero.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { HeroPoster } from "./HeroPoster";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" aria-hidden="true">
        <HeroPoster />
      </div>
      <div className="wrap hero-copy">
        <Kicker index="01">{t("kicker.workshop")}</Kicker>
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 id="hero-title">
          {t("hero.title")} <span className="hot">{t("hero.titleHot")}</span>
        </h1>
        <p className="lead">{t("hero.lead")}</p>
        <div className="actions">
          <Link className="btn" href="#work">
            {t("hero.viewWork")}
          </Link>
          <Link className="btn secondary" href="#contact">
            {t("hero.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/home/Process.tsx`**

The section keeps `id="about"` so old `/#about` links still land.

```tsx
"use client";

import Image from "next/image";
import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { PROCESS_STEPS } from "./data";

export function Process() {
  const { t } = useLanguage();

  return (
    <section id="about" className="has-grid" data-seam data-process>
      <div className="wrap process">
        <div className="process-intro">
          <Kicker index="02">{t("kicker.process")}</Kicker>
          <h2>{t("process.title")}</h2>
          <p>{t("process.intro")}</p>
          <figure className="portrait-plate plate heatable">
            <Image
              src="/pmaseda.jpg"
              alt={t("process.portrait")}
              width={640}
              height={800}
              sizes="(max-width: 860px) 70vw, 300px"
            />
            <figcaption>{t("process.portraitCaption")}</figcaption>
          </figure>
        </div>
        <div className="process-track">
          <span className="process-rail" aria-hidden="true">
            <span className="process-rail-fill" data-rail />
          </span>
          <ol className="process-steps" aria-label={t("process.stepsLabel")}>
            {PROCESS_STEPS.map((step, i) => (
              <li className="process-step plate heatable" key={step.title} data-step>
                <span className="step-node" aria-hidden="true" />
                <span className="step-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t(step.title)}</h3>
                <p>{t(step.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Create `src/components/home/Works.tsx`**

```tsx
"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { WORK_CARDS, textOf } from "./data";

export function Works() {
  const { t } = useLanguage();

  return (
    <section id="work" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="03">{t("kicker.works")}</Kicker>
            <h2>{t("work.title")}</h2>
          </div>
          <p className="section-note">{t("work.note")}</p>
        </div>
        <div className="works">
          {WORK_CARDS.map((card) => (
            <article className="work-card plate heatable" key={card.title} data-card>
              <div className="card-top">
                <span className="tag">{t(card.tag)}</span>
                {card.own ? <span className="maker-stamp">{t("work.ownMark")}</span> : null}
                <span className={card.when === "work.ongoing" ? "status is-hot" : "status"}>
                  {t(card.when)}
                </span>
              </div>
              <h3>
                {/* Plain <img>: a tiny local product mark, decorative
                    next to the title it already names. */}
                {card.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card-icon" src={card.icon} alt="" />
                ) : null}
                {t(card.title)}
              </h3>
              <p>{t(card.body)}</p>
              <p className="spec-label">{t("work.specLabel")}</p>
              <dl className="spec">
                {card.spec.map((row) => (
                  <div className="spec-row" key={row.label}>
                    <dt>{t(row.label)}</dt>
                    <dd>{textOf(t, row.value)}</dd>
                  </div>
                ))}
              </dl>
              {card.href && card.hrefLabel ? (
                <a
                  className="card-link"
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(card.hrefLabel)}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Create `src/components/home/Capabilities.tsx`**

```tsx
"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { CAPABILITIES, TOOLS } from "./data";

export function Capabilities() {
  const { t } = useLanguage();

  return (
    <section id="capabilities" className="has-grid" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="04">{t("kicker.capabilities")}</Kicker>
            <h2>{t("capabilities.title")}</h2>
          </div>
        </div>
        <div className="capabilities">
          {CAPABILITIES.map((capability, i) => (
            <article
              className="capability plate heatable"
              key={capability.title}
              data-card
            >
              <span className="capability-index">C/{String(i + 1).padStart(2, "0")}</span>
              <h3>{t(capability.title)}</h3>
              <p>{t(capability.body)}</p>
            </article>
          ))}
        </div>
        <div className="tools">
          <span className="tools-label">{t("capabilities.tools")}</span>
          <ul className="tool-marks">
            {TOOLS.map((tool) => (
              <li className="tool-mark" key={tool}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Create `src/components/home/Experience.tsx`**

```tsx
"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { EXPERIENCE } from "./data";

export function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="05">{t("kicker.marks")}</Kicker>
            <h2>{t("experience.title")}</h2>
          </div>
          <p className="section-note">{t("experience.note")}</p>
        </div>
        <ol className="marks">
          {EXPERIENCE.map((item) => (
            <li className="mark-row heatable" key={item.company}>
              <span
                className={item.dark ? "hallmark dark" : "hallmark"}
                aria-hidden="true"
                data-hallmark
              >
                <span>{item.initials}</span>
                {/* Plain <img>: tiny local logos layered over a text
                    fallback, so the optimizer buys nothing here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.logo} alt="" />
              </span>
              <div>
                <h3>{t(item.role)}</h3>
                <p>{item.company}</p>
              </div>
              <span className="mark-date">
                {item.dateKey ? t(item.dateKey) : item.date}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 11: Create `src/components/home/Commission.tsx`**

```tsx
"use client";

import { useLanguage } from "../LanguageProvider";
import { ContactForm } from "../ContactForm";
import { Kicker } from "./Kicker";

export function Commission() {
  const { t } = useLanguage();

  return (
    <section id="contact" data-seam>
      <div className="wrap commission">
        <div className="commission-intro">
          <Kicker index="06">{t("kicker.commission")}</Kicker>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.body")}</p>
        </div>
        <div className="work-order plate">
          <p className="work-order-head">{t("contact.orderLabel")}</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 12: Replace `src/components/PortfolioPage.tsx`**

It no longer uses hooks, so it drops `"use client"` and becomes a server component that renders the client sections.

```tsx
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Hero } from "./home/Hero";
import { Process } from "./home/Process";
import { Works } from "./home/Works";
import { Capabilities } from "./home/Capabilities";
import { Experience } from "./home/Experience";
import { Commission } from "./home/Commission";

/** The homepage: sections in order. Content shape lives in home/data.ts. */
export function PortfolioPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Process />
        <Works />
        <Capabilities />
        <Experience />
        <Commission />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 13: Update the nav and delete ScrollReveal**

In `src/components/SiteHeader.tsx`, replace the `PORTFOLIO_LINKS` array with:

```ts
const PORTFOLIO_LINKS: NavLink[] = [
  { href: "/#work", labelKey: "nav.work" },
  { href: "/#about", labelKey: "nav.process" },
  { href: "/#experience", labelKey: "nav.experience" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/#contact", labelKey: "nav.contact" },
];
```

Then run: `git rm src/components/ScrollReveal.tsx`

- [ ] **Step 14: Check for stale keys and references**

Run:
```bash
grep -rnE '"about\.|hero\.portrait|nav\.about|skills\.label|skills\.monitoring|ScrollReveal|data-reveal' src --include=*.ts --include=*.tsx
```
Expected: no output.

- [ ] **Step 15: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: tsc silent; 8 tests pass; build ends with the route table and no errors.

- [ ] **Step 16: Smoke-check in the browser**

Run `npm run dev` and open `http://localhost:3000`. Check:
- six sections appear in order (Workshop, Process, Works, Capabilities, Maker's marks, Commission), each with its `NN — LABEL` kicker
- the EN/ES switch changes every string
- `/#about` jumps to Process

The new sections are unstyled until Task 4; that is expected.

- [ ] **Step 17: Copy checkpoint**

The spec requires the user to review the copy before it's committed. Show them the rendered page in both languages (screenshots), or the `git diff src/lib/i18n.ts`. Apply any wording changes they ask for, keeping EN and ES in step. Wait for an explicit OK before committing.

- [ ] **Step 18: Commit**

```bash
git add src/lib/i18n.ts src/components/home src/components/PortfolioPage.tsx src/components/SiteHeader.tsx
git commit -m "Restructure the homepage into forge sections with new copy in both languages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```
(`git rm` already staged the ScrollReveal deletion.)

---

### Task 4: The forge stylesheet

This task replaces `globals.css` with four files written for the new markup, loads the three fonts, and restyles the blog. Afterwards the whole public site has its final static look (the static motion tier).

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/home.css`, `src/styles/blog.css`
- Delete: `src/app/globals.css`
- Modify: `src/app/(site)/layout.tsx`, `src/components/SiteFooter.tsx`, `src/components/BlogIndex.tsx`, `src/components/PostArticle.tsx`, `src/app/icon.svg`, `README.md`

**Interfaces:**
- Consumes: the class names and data attributes from Task 3.
- Produces, for Tasks 5–7:
  - `--heat` (registered `<number>`, inherits): GSAP tweens it, and `.heatable:hover` sets it.
  - `--seam-draw`: 0–1 on `section[data-seam]`, defaults to 1.
  - `--rail`: 0–1 on `.process-rail-fill`, defaults to 1.
  - `--weld`: registered `<angle>`, used by `.weld-ring`.
  - `.hero-stage.is-live`: the canvas fades in and the poster fades out.
  - `.hero-stage` is a CSS size container.
  - `.sparks-canvas`: the fixed overlay.
  - `.weld-ring`: the success ring.

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
/* Design tokens for the public site (homepage + blog). The admin panel has its
 * own stylesheet and never sees these.
 *
 * Dark only: the forge has no light mode, so `color-scheme` also tells the
 * browser to draw scrollbars, form controls and autofill dark. */

/* One number, 0–1, drives the hot-metal look everywhere: borders and glows
 * run steel → amber → white-hot as it rises. Registered so it can transition
 * and so GSAP can tween it. */
@property --heat {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

/* How far round the work-order border the success weld has run. */
@property --weld {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

:root {
  color-scheme: dark;

  --iron: #121212;
  --iron-raised: #1a1a1a;
  --iron-deep: #0c0c0c;
  --seam: #2a2a2a;
  --seam-strong: #3a3d42;
  --ash: #ece8e1;
  --steel: #8a95a5;
  --steel-bright: #b9c2ce;
  --ember: #ff5500;
  --ember-2: #ff8c00;
  --molten: #c4161c;
  --white-hot: #ffe8c2;

  /* next/font sets --font-sans, --font-display and --font-mono on <html>. */
  --sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --display: var(--font-display), "Arial Narrow", Impact, sans-serif;
  --mono: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Metal plates: tight corners. */
  --radius: 4px;
  --radius-lg: 6px;
  --header-h: 64px;
  --ease: 0.18s cubic-bezier(0.4, 0, 0.2, 1);

  /* Bevel: a lit top edge, a shadowed bottom edge, a long soft drop. */
  --plate-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 24px 48px -28px rgba(0, 0, 0, 0.9);

  /* Cast-iron grain: SVG fractal noise tinted steel, inlined so it costs no
     request. */
  --noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .54 0 0 0 0 .58 0 0 0 0 .65 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Create `src/styles/base.css`**

```css
/* Reset, type, site chrome (header, footer, buttons) and the forge primitives
 * every page uses: kicker labels, heat, plates, weld seams. */

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: var(--iron);
}

body {
  /* A stacking context of its own, so the grain layer can sit between the
     body's background and its content. */
  isolation: isolate;
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(120% 60% at 50% -12%, rgba(255, 85, 0, 0.08), transparent 62%),
    var(--iron);
  color: var(--ash);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Cast-iron grain. A fixed pseudo-element rather than background-attachment:
   fixed, which repaints on every scroll in some browsers. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: var(--noise);
  opacity: 0.4;
  pointer-events: none;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
a {
  cursor: pointer;
}

::selection {
  background: rgba(255, 85, 0, 0.35);
  color: var(--white-hot);
}

/* One visible focus treatment for the whole site, for keyboard users only. */
:focus-visible {
  outline: 2px solid var(--ember);
  outline-offset: 3px;
  border-radius: 2px;
}

.wrap {
  width: min(1080px, calc(100% - 40px));
  margin: 0 auto;
}

/* Reading column for the blog. */
.wrap-narrow {
  width: min(780px, calc(100% - 40px));
  margin: 0 auto;
}

/* ---- type ---- */
h1,
h2,
h3 {
  font-family: var(--display);
  text-transform: uppercase;
  text-wrap: balance;
}

h1 {
  margin: 0;
  font-size: clamp(46px, 7.2vw, 96px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0.005em;
}

h2 {
  margin: 0;
  font-size: clamp(34px, 4.6vw, 56px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.01em;
}

h3 {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.eyebrow {
  margin: 0 0 16px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* "02 — THE PROCESS": the section labels that carry the metaphor. */
.kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kicker-index {
  color: var(--ember);
  font-weight: 700;
}

.kicker-dash {
  width: 28px;
  height: 2px;
  background: linear-gradient(90deg, var(--ember), var(--ember-2));
  box-shadow: 0 0 8px rgba(255, 85, 0, 0.6);
}

/* ---- heat ---- */
/* --heat-color is the edge colour for the element's current heat: seam grey
   to ember by 0.6, then on towards white-hot above 0.7. Metal heats quickly
   and cools slowly, so the two directions get different durations. */
.heatable {
  --heat-color: color-mix(
    in oklab,
    color-mix(in oklab, var(--ember) calc(min(var(--heat) * 1.6, 1) * 100%), var(--seam-strong)),
    var(--white-hot) calc(min(max(var(--heat) - 0.7, 0) * 3, 1) * 100%)
  );
  transition: --heat 1.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.heatable:hover,
.heatable:focus-within {
  --heat: 0.8;
  transition-duration: 0.35s;
}

/* ---- plates ---- */
.plate {
  position: relative;
  border: 1px solid var(--heat-color, var(--seam-strong));
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, #1e1e1e 0%, var(--iron-raised) 38%, #151515 100%);
  box-shadow:
    var(--plate-shadow),
    0 0 calc(var(--heat) * 34px) calc(var(--heat) * 2px) rgba(255, 85, 0, calc(var(--heat) * 0.45));
}

/* Corner rivets. */
.plate::after {
  --rivet: radial-gradient(circle at 40% 35%, #8a919b 0 0.8px, #3b4047 1.6px, #0b0b0b 2.4px, transparent 3px);
  content: "";
  position: absolute;
  inset: 8px;
  background:
    var(--rivet) top left / 6px 6px no-repeat,
    var(--rivet) top right / 6px 6px no-repeat,
    var(--rivet) bottom left / 6px 6px no-repeat,
    var(--rivet) bottom right / 6px 6px no-repeat;
  pointer-events: none;
}

/* ---- header ---- */
header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--seam);
  background: rgba(14, 14, 14, 0.8);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
}

/* Scroll progress: a molten line along the header's bottom edge, driven by
   the page's own scroll timeline. No JS; browsers without scroll-driven
   animations simply don't draw it. */
@supports (animation-timeline: scroll()) {
  header::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--molten), var(--ember) 60%, var(--white-hot));
    box-shadow: 0 0 10px rgba(255, 85, 0, 0.7);
    transform: scaleX(0);
    transform-origin: left center;
    animation: forge-progress linear both;
    animation-timeline: scroll(root);
  }
}

@keyframes forge-progress {
  to {
    transform: scaleX(1);
  }
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-h);
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* The PM mark, stamped into a steel badge. */
.mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius);
  background: linear-gradient(145deg, #6b737e, #3a3f46 45%, #24272c);
  color: #0e0f11;
  font-family: var(--display);
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    0 0 0 1px #0a0a0a;
}

.nav-links {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 20px;
  color: var(--steel);
  font-size: 14px;
  font-weight: 550;
}

.nav-links a {
  padding-bottom: 2px;
  background: linear-gradient(var(--ember), var(--ember)) left bottom / 0 2px no-repeat;
  transition: color var(--ease), background-size var(--ease);
}

.nav-links a:hover {
  color: var(--ash);
  background-size: 100% 2px;
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--seam-strong);
  border-radius: var(--radius);
  background: var(--iron-raised);
}

.lang-switch button {
  min-width: 34px;
  min-height: 28px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  transition: background var(--ease), color var(--ease);
}

.lang-switch button:hover {
  color: var(--ash);
}

.lang-switch button[aria-pressed="true"] {
  background: #2a1608;
  color: var(--ember-2);
  box-shadow: inset 0 0 0 1px rgba(255, 85, 0, 0.45);
}

/* ---- buttons ---- */
/* Primary: molten metal. Secondary: cold steel that heats on hover. */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 22px;
  border: 1px solid #ff7a1f;
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--ember-2) 0%, var(--ember) 55%, #d94400 100%);
  color: #170900;
  font-family: var(--display);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow:
    inset 0 1px 0 rgba(255, 232, 194, 0.6),
    inset 0 -2px 0 rgba(120, 20, 0, 0.45),
    0 0 0 1px rgba(0, 0, 0, 0.6),
    0 8px 28px -8px rgba(255, 85, 0, 0.55);
  transition: box-shadow var(--ease), filter var(--ease), translate var(--ease),
    border-color var(--ease), color var(--ease);
}

.btn:hover {
  filter: brightness(1.08) saturate(1.1);
  translate: 0 -1px;
  box-shadow:
    inset 0 1px 0 rgba(255, 232, 194, 0.6),
    inset 0 -2px 0 rgba(120, 20, 0, 0.45),
    0 0 0 1px rgba(0, 0, 0, 0.6),
    0 10px 36px -6px rgba(255, 120, 0, 0.8);
}

.btn:active {
  translate: 0 1px;
}

.btn.secondary {
  border-color: var(--seam-strong);
  background: linear-gradient(180deg, #232323, #181818);
  color: var(--ash);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.6);
}

.btn.secondary:hover {
  border-color: var(--ember);
  color: var(--white-hot);
  filter: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.6),
    0 0 22px -4px rgba(255, 85, 0, 0.55);
}

.btn[disabled] {
  opacity: 0.6;
  cursor: progress;
  translate: none;
  filter: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 36px;
}

/* ---- sections ---- */
section {
  position: relative;
  isolation: isolate;
  padding: 96px 0;
  /* Anchor links must clear the sticky header. */
  scroll-margin-top: var(--header-h);
}

/* The divider above every section after the hero: a bead of hot weld with a
   soft glow. --seam-draw (0–1) lets the scroll choreography draw it in from
   the left; without that the seam is simply there. */
section[data-seam]::before {
  content: "";
  position: absolute;
  top: -8px;
  right: 0;
  left: 0;
  height: 16px;
  background:
    radial-gradient(ellipse 3px 1.5px at 50% 50%, var(--white-hot), var(--ember-2) 55%, var(--molten) 90%, transparent)
      0 50% / 6px 3px repeat-x,
    linear-gradient(180deg, transparent, rgba(255, 85, 0, 0.26) 50%, transparent);
  transform: scaleX(var(--seam-draw, 1));
  transform-origin: left center;
  mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent);
  pointer-events: none;
}

/* Faint industrial grid behind a section, fading out towards its edges. */
section.has-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(138, 149, 165, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 149, 165, 0.07) 1px, transparent 1px);
  background-position: center top;
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%);
  pointer-events: none;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 40px;
}

.section-note {
  max-width: 440px;
  margin: 0;
  color: var(--steel);
  font-size: 15px;
}

/* ---- footer ---- */
footer {
  padding: 36px 0 48px;
  border-top: 1px solid var(--seam);
  color: var(--steel);
  font-size: 14px;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.footer-links {
  display: flex;
  gap: 20px;
  font-weight: 600;
}

.footer-links a {
  transition: color var(--ease);
}

.footer-links a:hover {
  color: var(--ember-2);
}

.built-with {
  margin-top: 12px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  opacity: 0.8;
}

/* ---- responsive (chrome) ---- */
@media (max-width: 860px) {
  section {
    padding: 64px 0;
  }

  .section-head {
    display: block;
  }

  .section-note {
    margin-top: 12px;
  }

  .footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  nav {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 12px 0;
  }

  .nav-links {
    grid-column: 1 / -1;
    grid-row: 2;
    margin-left: 0;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 13px;
  }

  .lang-switch {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }
}

@media (max-width: 520px) {
  .wrap {
    width: min(100% - 28px, 1080px);
  }

  h1 {
    font-size: 44px;
  }

  .brand {
    min-width: 0;
    gap: 8px;
    font-size: 15px;
    white-space: nowrap;
  }

  .mark {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .actions {
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}

/* Readers who ask for less motion get state changes without the movement. */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }

  .btn:hover,
  .btn:active {
    translate: none;
  }
}
```

- [ ] **Step 3: Create `src/styles/home.css`**

```css
/* Homepage sections: hero, process, works, capabilities, experience,
 * commission, and the sparks overlay. */

/* ---- hero ---- */
.hero {
  display: flex;
  align-items: center;
  min-height: calc(100svh - var(--header-h));
  padding: 72px 0 104px;
  overflow: hidden;
}

/* The stage sits behind the copy: the poster first, then the three.js canvas
   over it once that has drawn a frame. A size container, so the poster can
   be laid out in the same units the 3D camera frames. */
.hero-stage {
  position: absolute;
  inset: 0;
  z-index: -1;
  container-type: size;
}

.hero-stage canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.hero-stage.is-live canvas {
  opacity: 1;
}

.hero-poster {
  position: absolute;
  inset: 0;
  transition: opacity 1.2s ease;
}

.hero-stage.is-live .hero-poster {
  opacity: 0;
}

/* Forge glow, pooled where the gears sit. */
.hero-poster::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(34% 46% at 78% 58%, rgba(255, 85, 0, 0.3), transparent 70%),
    radial-gradient(18% 26% at 76% 64%, rgba(255, 140, 0, 0.24), transparent 70%),
    radial-gradient(60% 50% at 85% 100%, rgba(196, 22, 28, 0.22), transparent 70%);
}

/* Matches the scene's desktop framing: the driver gear centred 79.7% across
   and 56% down, at the size the 3D camera draws it (5.68 world units per
   stage height). */
.hero-gears {
  position: absolute;
  top: 8.5cqh;
  left: calc(79.7cqw - 66.9cqh);
  height: 84.5cqh;
  aspect-ratio: 5.9 / 4.8;
  filter: drop-shadow(0 0 22px rgba(255, 85, 0, 0.3));
}

/* Tall stages (phones, portrait tablets): the scene moves the train up and
   right, shrunk to 0.62. */
@container (max-aspect-ratio: 9 / 10) {
  .hero-gears {
    top: -5.9cqh;
    left: calc(74.6cqw - 41.5cqh);
    height: 52.4cqh;
  }

  .hero-poster::before {
    background:
      radial-gradient(60% 34% at 70% 22%, rgba(255, 85, 0, 0.3), transparent 70%),
      radial-gradient(30% 20% at 72% 20%, rgba(255, 140, 0, 0.22), transparent 70%);
  }
}

/* Keeps the copy legible over whatever the stage draws. */
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(18, 18, 18, 0.94) 0%, rgba(18, 18, 18, 0.8) 36%, rgba(18, 18, 18, 0) 68%),
    linear-gradient(0deg, var(--iron) 0%, transparent 16%);
  pointer-events: none;
}

.hero h1 {
  max-width: 820px;
}

/* The words that are still hot. */
.hot {
  background: linear-gradient(180deg, var(--white-hot) 0%, var(--ember-2) 45%, var(--ember) 75%, var(--molten) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px rgba(255, 85, 0, 0.45));
}

.lead {
  max-width: 600px;
  margin: 28px 0 0;
  color: var(--steel-bright);
  font-size: clamp(17px, 2.2vw, 20px);
  line-height: 1.55;
}

/* ---- process ---- */
.process {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: 56px;
}

.process-intro > p {
  max-width: 46ch;
  margin: 20px 0 0;
  color: var(--steel-bright);
}

/* The portrait as a forged plate, graded towards ember so the café greens
   don't fight the palette. Warming it (hover) brings some colour back. */
.portrait-plate {
  width: min(100%, 300px);
  margin: 32px 0 0;
  overflow: hidden;
  aspect-ratio: 4 / 5;
}

.portrait-plate img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(calc(1 - var(--heat) * 0.7)) contrast(1.08) brightness(0.9);
}

.portrait-plate::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(170deg, rgba(255, 140, 0, 0.5), rgba(255, 85, 0, 0.6) 60%, rgba(196, 22, 28, 0.7));
  mix-blend-mode: color;
  opacity: calc(0.55 - var(--heat) * 0.35);
  pointer-events: none;
}

.portrait-plate::after {
  z-index: 3;
}

.portrait-plate figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  padding: 28px 14px 12px;
  background: linear-gradient(transparent, rgba(12, 12, 12, 0.85));
  color: var(--steel-bright);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.process-track {
  position: relative;
  padding-left: 40px;
}

/* The rail the steps hang on. Its fill glows down it like hot iron: the
   scroll choreography drives --rail (0–1); without it the rail is full. */
.process-rail {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 12px;
  width: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--seam);
}

.process-rail-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--white-hot), var(--ember-2) 30%, var(--ember) 70%, var(--molten));
  box-shadow: 0 0 12px var(--ember);
  transform: scaleY(var(--rail, 1));
  transform-origin: top center;
}

.process-steps {
  display: grid;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.process-step {
  padding: 22px 24px 24px;
}

/* Sits on the rail: 13.5px from the track edge, minus the 40px gutter and
   half its own width. */
.step-node {
  position: absolute;
  top: 30px;
  left: -32px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--heat-color, var(--seam-strong));
  box-shadow: 0 0 0 3px var(--iron), 0 0 calc(var(--heat) * 16px) var(--ember);
}

.step-index {
  color: var(--ember);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.process-step h3 {
  margin: 6px 0 8px;
  font-size: 28px;
  line-height: 1;
}

.process-step p {
  margin: 0;
  color: var(--steel-bright);
  font-size: 15.5px;
}

/* ---- works ---- */
.works {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.work-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
}

/* Keep an odd final card from leaving an empty half-row. */
.work-card:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.work-card:last-child:nth-child(odd) > p {
  max-width: 720px;
}

.card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.tag,
.status,
.maker-stamp {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tag {
  padding: 4px 9px;
  border: 1px solid var(--seam-strong);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--steel-bright);
}

.maker-stamp {
  padding: 3px 8px;
  border: 1px dashed rgba(255, 140, 0, 0.5);
  border-radius: 2px;
  color: var(--ember-2);
  rotate: -2deg;
}

/* Status: ongoing work is still hot, recent work has cooled. */
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  color: var(--steel);
}

.status::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4a4f57;
}

.status.is-hot {
  color: var(--ember-2);
}

.status.is-hot::before {
  background: var(--ember);
  box-shadow: 0 0 0 3px rgba(255, 85, 0, 0.15), 0 0 10px var(--ember);
}

.work-card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 30px;
  line-height: 1;
}

/* Height-driven so the mark keeps its own aspect ratio. */
.card-icon {
  flex: none;
  width: auto;
  height: 22px;
}

.work-card > p {
  margin: 0;
  color: var(--steel-bright);
  font-size: 15px;
}

/* Spec plate: the card's facts as stamped label/value rows. */
.work-card > .spec-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 12px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.spec-label::after {
  content: "";
  flex: 1;
  border-top: 1px solid var(--seam);
}

.spec {
  display: grid;
  gap: 8px;
  margin: 0;
}

.spec-row {
  display: grid;
  grid-template-columns: 7.5rem minmax(0, 1fr);
  gap: 16px;
}

.spec dt {
  padding-top: 2px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.spec dd {
  margin: 0;
  color: var(--ash);
  font-size: 14px;
}

.card-link {
  align-self: flex-end;
  margin-top: auto;
  padding-top: 20px;
  color: var(--ember-2);
  font-family: var(--mono);
  font-size: 13px;
  transition: color var(--ease);
}

.card-link::after {
  content: " ↗";
}

.card-link:hover {
  color: var(--white-hot);
}

/* ---- capabilities ---- */
.capabilities {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.capability {
  grid-column: span 2;
  padding: 24px 24px 28px;
}

.capability:nth-child(n + 4) {
  grid-column: span 3;
}

/* An edge along the bottom that glows with the block's heat. */
.capability::before {
  content: "";
  position: absolute;
  right: 24px;
  bottom: -1px;
  left: 24px;
  height: 2px;
  background: var(--heat-color, var(--seam-strong));
  box-shadow: 0 0 calc(var(--heat) * 14px) var(--ember);
}

.capability-index {
  color: var(--ember);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.capability h3 {
  margin: 10px 0 8px;
  font-size: 26px;
  line-height: 1;
}

.capability p {
  margin: 0;
  color: var(--steel-bright);
  font-size: 15px;
}

.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.tools-label {
  color: var(--steel);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.tool-marks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Stamped into the metal: dark above, a faint lit lip below. */
.tool-mark {
  padding: 6px 12px;
  border: 1px solid var(--seam-strong);
  border-radius: 2px;
  background: linear-gradient(180deg, #202020, #161616);
  color: #9aa3ae;
  font-family: var(--display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ---- experience ---- */
.marks {
  position: relative;
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The steel bar the hallmarks are struck along, centred on them. */
.marks::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 25px;
  width: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #2b2f35, #6b737e 45%, #2b2f35);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
}

.mark-row {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid var(--seam);
}

.mark-row:first-child {
  border-top: 1px solid var(--seam);
}

.hallmark {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border: 1px solid #0a0a0a;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, #2c2f34, #18191c);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 0 3px var(--iron),
    0 0 0 4px var(--heat-color, var(--seam-strong));
  color: var(--steel);
  font-family: var(--display);
  font-size: 12px;
  font-weight: 800;
}

/* Logos read as stamped metal until the row is warmed. */
.hallmark img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 10px;
  object-fit: contain;
  background: #e9e6e0;
  filter: grayscale(calc(1 - var(--heat))) contrast(1.1);
}

.hallmark.dark img {
  background: #141518;
}

.mark-row h3 {
  margin: 0 0 2px;
  font-size: 22px;
  line-height: 1.1;
}

.mark-row p {
  margin: 0;
  color: var(--steel);
  font-size: 15px;
}

.mark-date {
  color: var(--steel);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ---- commission ---- */
.commission {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  align-items: start;
  gap: 48px;
}

.commission-intro > p {
  max-width: 52ch;
  margin: 20px 0 0;
  color: var(--steel-bright);
}

.work-order {
  padding: 28px;
}

.work-order-head {
  margin: 0 0 20px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--seam-strong);
  color: var(--steel);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.work-order-head::before {
  content: "● ";
  color: var(--ember);
}

.contact-form {
  display: grid;
  gap: 14px;
}

.contact-form label {
  display: grid;
  gap: 6px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--seam-strong);
  border-radius: var(--radius);
  background: var(--iron-deep);
  color: var(--ash);
  font-family: var(--sans);
  font-size: 15px;
  letter-spacing: normal;
  text-transform: none;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
  transition: border-color var(--ease), box-shadow var(--ease);
}

.contact-form textarea {
  min-height: 120px;
  resize: vertical;
}

.contact-form input:hover,
.contact-form textarea:hover {
  border-color: #50555c;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--ember);
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 0 3px rgba(255, 85, 0, 0.18),
    0 0 18px -4px rgba(255, 85, 0, 0.6);
}

.contact-form input::placeholder,
.contact-form textarea::placeholder {
  color: #5d636b;
}

.form-status {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 600;
}

.form-status.ok {
  color: #ffb35c;
}

.form-status.error {
  color: #ff7a6b;
}

/* The success weld (Task 5 mounts it): a hot bead runs once round the work
   order, then cools. The mask leaves only a 2px border ring visible. */
.weld-ring {
  position: absolute;
  inset: -1px;
  z-index: 1;
  padding: 2px;
  border-radius: inherit;
  background: conic-gradient(
    from -90deg,
    var(--molten) 0deg,
    var(--ember) calc(var(--weld) - 10deg),
    var(--white-hot) var(--weld),
    transparent var(--weld)
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  animation:
    weld-run 1.4s cubic-bezier(0.6, 0, 0.4, 1) forwards,
    weld-cool 2.4s 1.4s ease-out forwards;
  pointer-events: none;
}

@keyframes weld-run {
  from {
    --weld: 0deg;
  }
  to {
    --weld: 360deg;
  }
}

@keyframes weld-cool {
  to {
    opacity: 0.25;
  }
}

/* ---- sparks ---- */
.sparks-canvas {
  position: fixed;
  inset: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ---- responsive ---- */
@media (max-width: 860px) {
  .hero {
    align-items: flex-end;
    min-height: auto;
    padding: 34vh 0 64px;
  }

  .hero::after {
    background: linear-gradient(180deg, rgba(18, 18, 18, 0.15) 0%, rgba(18, 18, 18, 0.82) 40%, var(--iron) 100%);
  }

  .process,
  .commission {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .works {
    grid-template-columns: 1fr;
  }

  .capabilities {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .capability,
  .capability:nth-child(n + 4) {
    grid-column: span 1;
  }

  .capability:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  .mark-row {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .mark-date {
    grid-column: 2;
  }

  .work-order {
    padding: 22px;
  }
}

@media (max-width: 520px) {
  .capabilities {
    grid-template-columns: 1fr;
  }

  .spec-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
```

- [ ] **Step 4: Create `src/styles/blog.css`**

```css
/* Blog index and articles. Same palette and type as the homepage, none of its
 * motion: this is the one part of the site meant to be read for ten minutes
 * rather than scanned. */

/* ---- article ---- */
.post-header {
  padding: 72px 0 30px;
}

.post-header h1 {
  font-size: clamp(36px, 5.4vw, 60px);
  line-height: 1;
}

.post-meta {
  margin-top: 20px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-lead {
  margin: 22px 0 0;
  color: var(--steel-bright);
  font-size: clamp(17px, 2.2vw, 20px);
  line-height: 1.55;
}

.post-hero {
  margin-bottom: 40px;
}

.post-hero img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--seam-strong);
  border-radius: var(--radius-lg);
  background: var(--iron-raised);
  box-shadow: var(--plate-shadow);
}

/* Let the banner breathe past the reading column on a large screen, sized in
   px so 100vw's scrollbar doesn't reintroduce sideways scroll. (960 - 780) / 2
   keeps it centred on the 780px column. */
@media (min-width: 1040px) {
  .post-hero img {
    width: 960px;
    max-width: none;
    margin-left: -90px;
  }
}

.post-body {
  padding-bottom: 96px;
  font-size: 18px;
  line-height: 1.75;
}

.post-body h2 {
  margin: 56px 0 16px;
  font-size: clamp(28px, 3.4vw, 36px);
  line-height: 1.05;
}

.post-body h3 {
  margin: 38px 0 12px;
  font-size: 22px;
  line-height: 1.15;
}

.post-body p {
  margin: 0 0 22px;
}

.post-body ul,
.post-body ol {
  margin: 0 0 22px;
  padding-left: 24px;
}

.post-body li {
  margin-bottom: 10px;
  padding-left: 4px;
}

.post-body li::marker {
  color: var(--ember);
}

.post-body strong {
  color: #fff6ea;
  font-weight: 650;
}

/* Links in article prose. Scoped to `.post-prose` -- the rendered body --
   rather than `.post-body`, so the "All posts" link after the article keeps
   its own styling. */
.post-prose a {
  color: var(--ember-2);
  font-weight: 550;
  border-bottom: 1px solid rgba(255, 140, 0, 0.4);
  transition: border-color var(--ease), background var(--ease);
}

.post-prose a:hover {
  border-bottom-color: var(--ember);
  background: rgba(255, 85, 0, 0.08);
}

/* Code. Wide blocks scroll inside themselves -- the page body must never
   scroll horizontally on a phone. */
.post-body pre {
  margin: 0 0 24px;
  padding: 18px 20px;
  overflow-x: auto;
  border: 1px solid var(--seam);
  border-radius: var(--radius-lg);
  background: var(--iron-raised);
  box-shadow: var(--plate-shadow);
  color: #dfe7f0;
  font-family: var(--mono);
  font-size: 13.5px;
  line-height: 1.6;
  -webkit-font-smoothing: auto;
}

.post-body code {
  padding: 2px 6px;
  border: 1px solid rgba(255, 140, 0, 0.2);
  border-radius: 3px;
  background: #1f1a16;
  color: #ffb877;
  font-family: var(--mono);
  font-size: 0.86em;
}

.post-body pre code {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font-size: inherit;
}

/* Shiki emits `pre.shiki` with the token colours inline. Its own background
   is stripped by a transformer so the block keeps the plate. */
.post-body pre.shiki {
  color: #dfe7f0;
}

/* `:::callout` renders as <aside>: a plate with a hot edge. */
.post-body aside,
.post-body .callout {
  margin: 0 0 24px;
  padding: 20px 22px;
  border: 1px solid var(--seam-strong);
  border-left: 3px solid var(--ember);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  background: var(--iron-raised);
  box-shadow: inset 6px 0 14px -10px rgba(255, 85, 0, 0.8), var(--plate-shadow);
}

.post-body aside p:last-child,
.post-body .callout p:last-child {
  margin-bottom: 0;
}

/* Section break: a short weld seam. */
.post-body hr {
  height: 3px;
  margin: 48px 0;
  border: 0;
  background: radial-gradient(ellipse 3px 1.5px at 50% 50%, var(--white-hot), var(--ember-2) 55%, var(--molten) 90%, transparent)
    0 50% / 6px 3px repeat-x;
  mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
}

/* Quotation. Deliberately quieter than the callout -- no plate, no glow --
   so a quote and an aside don't compete for the same weight. */
.post-body blockquote {
  margin: 0 0 24px;
  padding: 6px 0 6px 24px;
  border-left: 3px solid var(--seam-strong);
  color: var(--steel-bright);
  font-size: 18px;
  line-height: 1.6;
}

.post-body blockquote p:last-child {
  margin-bottom: 0;
}

/* Attribution: `<cite>` inside a quote reads as a name, not as a title. */
.post-body blockquote cite {
  display: block;
  margin-top: 12px;
  color: var(--steel);
  font-family: var(--mono);
  font-size: 12.5px;
  font-style: normal;
  letter-spacing: 0.06em;
}

/* Images. The max-width is not cosmetic: without it a wide screenshot widens
   the whole document and the page scrolls sideways on a phone. Covers and
   screenshots are content, so they're framed but never colour-graded. */
.post-body img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 0 24px;
  border: 1px solid var(--seam-strong);
  border-radius: var(--radius-lg);
  background: var(--iron-raised);
}

.post-body figure {
  margin: 0 0 28px;
}

.post-body figure img {
  margin-bottom: 12px;
}

.post-body figcaption {
  color: var(--steel);
  font-size: 14px;
  line-height: 1.5;
}

/* Opt-in `#wide`: a screenshot spills past the reading column above 1040px.
   Sized in px, not vw, for the scrollbar reason above. */
@media (min-width: 1040px) {
  .post-body img.wide,
  .post-body figure.wide img {
    width: 960px;
    max-width: none;
    margin-left: -90px;
  }
}

.post-body .table-scroll {
  overflow-x: auto;
  margin: 0 0 24px;
}

.post-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.post-body th,
.post-body td {
  padding: 11px 13px;
  border-bottom: 1px solid var(--seam);
  text-align: left;
  vertical-align: top;
}

.post-body th {
  color: var(--steel);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ---- index ---- */
.post-list {
  display: grid;
  gap: 18px;
  padding: 56px 0 96px;
}

.post-card {
  display: block;
  padding: 28px 30px;
}

.post-card .year {
  color: var(--ember-2);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.post-card h2 {
  margin: 10px 0;
  font-size: 30px;
  line-height: 1.05;
}

.post-card p {
  margin: 0;
  color: var(--steel-bright);
  font-size: 15.5px;
}

.back-link {
  display: inline-block;
  margin-top: 48px;
  color: var(--ember-2);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--ease);
}

.back-link:hover {
  color: var(--white-hot);
}

@media (max-width: 640px) {
  .post-header {
    padding: 44px 0 22px;
  }

  .post-body {
    font-size: 17px;
  }

  .post-body h2 {
    margin-top: 44px;
  }

  .post-card {
    padding: 24px;
  }
}
```

- [ ] **Step 5: Load fonts and stylesheets in `src/app/(site)/layout.tsx`**

Replace the imports and the font setup at the top of the file (everything above `export const metadata`) with:

```tsx
import type { Metadata } from "next";
import { Big_Shoulders, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { messages } from "@/lib/i18n";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/home.css";
import "@/styles/blog.css";

/**
 * next/font self-hosts all three at build time: no runtime request to Google
 * and no flash of unstyled text. Big Shoulders is the heavy condensed display
 * face (Google's renamed "Big Shoulders Display"; its optical-size axis keeps
 * it crisp at headline sizes). The mono face is never above the fold, so it
 * isn't preloaded.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Big_Shoulders({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});
```

and change the `<html>` line to:

```tsx
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
```

- [ ] **Step 6: Delete the old stylesheet**

Run: `git rm src/app/globals.css`

- [ ] **Step 7: Drop the footer's `bordered` prop and give post cards the plate**

Every footer now draws its own top rule, so the prop has nothing left to do.

`src/components/SiteFooter.tsx`: replace the doc comment, signature and opening tag:

```tsx
/** Every page ends on the same hairline seam, drawn by `footer` in base.css. */
export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer>
```

`src/components/BlogIndex.tsx`: change `<SiteFooter bordered />` to `<SiteFooter />` and `className="post-card"` to `className="post-card plate heatable"`.

`src/components/PostArticle.tsx`: change `<SiteFooter bordered />` to `<SiteFooter />`.

- [ ] **Step 8: Replace `src/app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6b737e"/>
      <stop offset="0.5" stop-color="#3a3f46"/>
      <stop offset="1" stop-color="#24272c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="10" fill="url(#steel)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="9" fill="none" stroke="#ff5500" stroke-opacity="0.6" stroke-width="2"/>
  <text x="32" y="34" text-anchor="middle" dominant-baseline="central" font-family="Impact, 'Arial Narrow', Arial, sans-serif" font-size="30" font-weight="800" fill="#0e0f11">PM</text>
</svg>
```

- [ ] **Step 9: Update the README's stack line**

In `README.md`, replace the bullet that starts `- Plain CSS (\`src/app/globals.css\`)` (and its wrapped second line) with:

```markdown
- Plain CSS in `src/styles/`, no framework: `tokens.css` (palette, fonts, the
  `--heat` property), `base.css` (chrome and shared forge primitives),
  `home.css`, `blog.css`
```

- [ ] **Step 10: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all pass, and the build output includes no CSS warnings.

- [ ] **Step 11: Visual check**

Start the production server (`npm run start`, backgrounded). Take screenshots at 375, 768 and 1280px wide, in EN and ES, of `/`, `/blog` and one article (e.g. `/blog/linux-dead-key-apostrophe-fix`). Use the claude-in-chrome tools, or a browser by hand. Check:
- **Hero:** a dark iron base with grain, and the hero gear poster on the right (top-right on phones).
- **Copy:** "built to last." glows. Kickers show ember numbers and dashes. Weld seams sit between sections.
- **Hover:** cards, process steps, capabilities and experience rows heat on hover. Their edges go amber, and the portrait and logos regain colour.
- **No sideways scroll** at any width.
- **Blog:** the reading column is calm and legible. Code blocks sit on plates, links are ember, covers are framed and not tinted.
- **Header:** the molten progress line grows along the header as you scroll (Chrome).

If the grain is too strong or too faint, adjust only `body::before { opacity }` in `base.css` (0.25–0.5).

- [ ] **Step 12: JS-off check**

Run:
```bash
curl -s http://localhost:3000/ | grep -oE "Selected work|What I bring to a build|Raw material|Temper &amp; test|Work order|Maker&#x27;s own" | sort -u
```
Expected: all six strings are listed. The server HTML carries every section with nothing hidden, so the page is complete without JS.

- [ ] **Step 13: Measure**

Run: `node scripts/lighthouse-summary.mjs t4-static`
Expected:
- performance ≥ 90
- CLS 0
- accessibility ≥ baseline
- `scriptKB` within a few KB of baseline (fonts are not script)

If accessibility drops, the Lighthouse report names the failing contrast pairs. Fix them by brightening the text colour, never by removing it.

- [ ] **Step 14: Commit**

```bash
git add src/styles src/app/\(site\)/layout.tsx src/components/SiteFooter.tsx src/components/BlogIndex.tsx src/components/PostArticle.tsx src/app/icon.svg README.md
git commit -m "Restyle the site as an industrial forge: tokens, chrome, homepage and blog

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```
(`git rm` already staged the `globals.css` deletion.)

---

### Task 5: Motion tier and sparks

**Files:**
- Create: `src/lib/motionTier.ts`, `src/lib/idle.ts`, `src/components/forge/sparkPool.ts`, `src/components/forge/sparks.ts`, `src/components/forge/MotionProvider.tsx`
- Test: `src/lib/motionTier.test.ts`, `src/components/forge/sparkPool.test.ts`
- Modify: `src/components/ContactForm.tsx`, `src/components/PortfolioPage.tsx`, `src/components/home/Hero.tsx`, `src/components/home/Works.tsx`, `src/components/home/Commission.tsx`

**Interfaces:**
- Consumes: `.sparks-canvas` and `.weld-ring` styles (Task 4).
- Produces:
  - from `@/lib/motionTier`:
    - `type MotionTier = "full" | "static"`
    - `type TierEnv = { search: string; reducedMotion: boolean; saveData: boolean; webgl2: boolean }`
    - `resolveMotionTier(env: TierEnv): MotionTier`
    - `detectTierEnv(): TierEnv`
  - from `@/lib/idle`: `whenIdle(task: () => void, timeout?: number): () => void`
  - from `./forge/sparkPool`: `createPool`, `emit`, `step`, `GRAVITY`, and the types `Spark`, `SparkPool`, `EmitOptions`
  - from `./forge/sparks`:
    - `type AmbientSource = () => DOMRect | null`
    - `type SparksController = { burst(x, y, intensity?): void; setAmbientSource(source: AmbientSource | null): void; destroy(): void }`
    - `startSparks(canvas: HTMLCanvasElement): SparksController`
  - from `./forge/MotionProvider`: `MotionProvider`, and `useMotion(): { tier: MotionTier; burst(x: number, y: number, intensity?: number): void; setAmbientSource(source: AmbientSource | null): void }`

- [ ] **Step 1: Write the failing motion-tier tests**

Create `src/lib/motionTier.test.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing spark-pool tests**

Create `src/components/forge/sparkPool.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL. `./motionTier` and `./sparkPool` can't be resolved. The 8 gear tests still pass.

- [ ] **Step 4: Implement `src/lib/motionTier.ts`**

```ts
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
```

- [ ] **Step 5: Implement `src/components/forge/sparkPool.ts`**

```ts
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 21 tests (8 gear, 7 tier, 6 pool).

- [ ] **Step 7: Create `src/lib/idle.ts`**

```ts
/**
 * Runs `task` once the browser is idle (or after `timeout` ms at the latest),
 * so heavy optional work never competes with the first render. Returns a
 * cancel function. Safari has no requestIdleCallback; it gets a short timeout.
 */
export function whenIdle(task: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 300);
  return () => window.clearTimeout(id);
}
```

- [ ] **Step 8: Create `src/components/forge/sparks.ts`**

```ts
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
```

- [ ] **Step 9: Create `src/components/forge/MotionProvider.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { detectTierEnv, resolveMotionTier, type MotionTier } from "@/lib/motionTier";
import { startSparks, type AmbientSource, type SparksController } from "./sparks";

type MotionContextValue = {
  tier: MotionTier;
  /** Throws a spray of sparks from a viewport point. A no-op on the static tier. */
  burst: (x: number, y: number, intensity?: number) => void;
  /** Where ambient embers rise from, or null for none. */
  setAmbientSource: (source: AmbientSource | null) => void;
};

const MotionContext = createContext<MotionContextValue>({
  tier: "static",
  burst: () => {},
  setAmbientSource: () => {},
});

/**
 * Decides the motion tier once on mount and owns the sparks overlay.
 *
 * Every render before that effect -- the server's included -- is "static", so
 * the server markup always matches the first client render; the tier upgrades
 * a moment later. Children's effects run before this one, so an ambient
 * source set before the sparks exist is remembered and handed over when they
 * start.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<MotionTier>("static");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<SparksController | null>(null);
  const ambientRef = useRef<AmbientSource | null>(null);

  useEffect(() => {
    setTier(resolveMotionTier(detectTierEnv()));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (tier !== "full" || !canvas) return;
    const sparks = startSparks(canvas);
    sparksRef.current = sparks;
    if (ambientRef.current) sparks.setAmbientSource(ambientRef.current);
    return () => {
      sparks.destroy();
      sparksRef.current = null;
    };
  }, [tier]);

  const burst = useCallback((x: number, y: number, intensity?: number) => {
    sparksRef.current?.burst(x, y, intensity);
  }, []);

  const setAmbientSource = useCallback((source: AmbientSource | null) => {
    ambientRef.current = source;
    sparksRef.current?.setAmbientSource(source);
  }, []);

  const value = useMemo(
    () => ({ tier, burst, setAmbientSource }),
    [tier, burst, setAmbientSource],
  );

  return (
    <MotionContext.Provider value={value}>
      {children}
      {tier === "full" ? (
        <canvas ref={canvasRef} className="sparks-canvas" aria-hidden="true" />
      ) : null}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
```

- [ ] **Step 10: Give `ContactForm` an `onSent` callback**

In `src/components/ContactForm.tsx`:
- change `import { useActionState } from "react";` to `import { useActionState, useEffect } from "react";`
- replace `export function ContactForm() {` and the two lines under it with:

```tsx
export function ContactForm({ onSent }: { onSent?: () => void }) {
  const { locale, t } = useLanguage();
  const [state, formAction] = useActionState(submitContact, INITIAL);

  /* useActionState hands back a new state object per submission, so this
     fires once for each successful send. */
  useEffect(() => {
    if (state.status === "success") onSent?.();
  }, [state, onSent]);
```

- [ ] **Step 11: Wrap the homepage in `MotionProvider`**

Replace `src/components/PortfolioPage.tsx` with:

```tsx
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MotionProvider } from "./forge/MotionProvider";
import { Hero } from "./home/Hero";
import { Process } from "./home/Process";
import { Works } from "./home/Works";
import { Capabilities } from "./home/Capabilities";
import { Experience } from "./home/Experience";
import { Commission } from "./home/Commission";

/** The homepage: sections in order. Content shape lives in home/data.ts. */
export function PortfolioPage() {
  return (
    <MotionProvider>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Process />
        <Works />
        <Capabilities />
        <Experience />
        <Commission />
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
```

- [ ] **Step 12: Hero embers**

Replace `src/components/home/Hero.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "../LanguageProvider";
import { useMotion } from "../forge/MotionProvider";
import { Kicker } from "./Kicker";
import { HeroPoster } from "./HeroPoster";

export function Hero() {
  const { t } = useLanguage();
  const { tier, setAmbientSource } = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  /* Embers rise off the gear side of the stage while the hero is on screen. */
  useEffect(() => {
    const stage = stageRef.current;
    if (tier !== "full" || !stage) return;
    const source = () => {
      const r = stage.getBoundingClientRect();
      return new DOMRect(r.left + r.width * 0.45, r.top, r.width * 0.55, r.height);
    };
    const observer = new IntersectionObserver(([entry]) =>
      setAmbientSource(entry.isIntersecting ? source : null),
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      setAmbientSource(null);
    };
  }, [tier, setAmbientSource]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" ref={stageRef} aria-hidden="true">
        <HeroPoster />
      </div>
      <div className="wrap hero-copy">
        <Kicker index="01">{t("kicker.workshop")}</Kicker>
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 id="hero-title">
          {t("hero.title")} <span className="hot">{t("hero.titleHot")}</span>
        </h1>
        <p className="lead">{t("hero.lead")}</p>
        <div className="actions">
          <Link className="btn" href="#work">
            {t("hero.viewWork")}
          </Link>
          <Link className="btn secondary" href="#contact">
            {t("hero.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 13: Sparks when a mouse enters a work card**

In `src/components/home/Works.tsx`:
- add `import { useMotion } from "../forge/MotionProvider";` below the `useLanguage` import
- change `const { t } = useLanguage();` to:
  ```tsx
  const { t } = useLanguage();
  const { burst } = useMotion();
  ```
- change the card's opening tag to:
  ```tsx
            <article
              className="work-card plate heatable"
              key={card.title}
              data-card
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") burst(event.clientX, event.clientY, 0.35);
              }}
            >
  ```

- [ ] **Step 14: The success weld on the work order**

Replace `src/components/home/Commission.tsx` with:

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { ContactForm } from "../ContactForm";
import { useMotion } from "../forge/MotionProvider";
import { Kicker } from "./Kicker";

export function Commission() {
  const { t } = useLanguage();
  const { burst } = useMotion();
  const orderRef = useRef<HTMLDivElement>(null);
  const [welds, setWelds] = useState(0);

  /* Each successful send mounts a fresh ring (keyed by count), so the weld
     runs again for a second message rather than staying finished. */
  const onSent = useCallback(() => {
    setWelds((n) => n + 1);
    const r = orderRef.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top, 1.2);
  }, [burst]);

  return (
    <section id="contact" data-seam>
      <div className="wrap commission">
        <div className="commission-intro">
          <Kicker index="06">{t("kicker.commission")}</Kicker>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.body")}</p>
        </div>
        <div className="work-order plate" ref={orderRef}>
          {welds > 0 ? <span className="weld-ring" key={welds} aria-hidden="true" /> : null}
          <p className="work-order-head">{t("contact.orderLabel")}</p>
          <ContactForm onSent={onSent} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 15: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all pass, 21 tests.

- [ ] **Step 16: Behaviour check**

On the production server:
- **`/`:** embers drift up from the bottom of the hero's right side. A small spray of sparks comes off the cursor when it enters a work card. Scrolling away from the hero stops the embers.
- **`/?motion=static`:** no canvas element in the DOM (`document.querySelector(".sparks-canvas") === null`) and no sparks.
- **Contact form:** send one test message. The weld runs round the work order with a burst of sparks. Delete the message afterwards in `/a`.

- [ ] **Step 17: Commit**

```bash
git add src/lib/motionTier.ts src/lib/motionTier.test.ts src/lib/idle.ts src/components/forge src/components/ContactForm.tsx src/components/PortfolioPage.tsx src/components/home/Hero.tsx src/components/home/Works.tsx src/components/home/Commission.tsx
git commit -m "Add the motion tier, a sparks overlay, hero embers and the contact weld

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

---

### Task 6: GSAP scroll choreography

**Files:**
- Modify: `package.json`, `package-lock.json` (add `gsap`)
- Create: `src/components/forge/forgeMotion.ts`, `src/components/forge/ForgeMotionMount.tsx`
- Modify: `src/components/PortfolioPage.tsx`

**Interfaces:**
- Consumes:
  - the DOM hooks from Task 3 (`main#top`, `section[data-seam]`, `[data-process]`, `[data-step]`, `[data-rail]`, `[data-card]`, `[data-hallmark]`)
  - the CSS variables `--seam-draw`, `--rail` and `--heat` from Task 4
  - `useMotion()` and `whenIdle()` from Task 5
- Produces: `initForgeMotion(root: HTMLElement, burst: (x: number, y: number, intensity?: number) => void): () => void` in `forgeMotion.ts`. The only gsap importer.

- [ ] **Step 1: Install GSAP**

Run: `npm install --save-exact gsap@3.15.0`
Expected: `package.json` gains `"gsap": "3.15.0"`.

- [ ] **Step 2: Create `src/components/forge/forgeMotion.ts`**

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Burst = (x: number, y: number, intensity?: number) => void;

/** Pinning needs the whole Process section to fit on screen at once. */
const PIN_QUERY = "(min-width: 900px) and (min-height: 760px)";

/**
 * Only things that start below the fold get a hidden starting state. What is
 * already on screen when this loads stays as it is; hiding it now would flash.
 */
function belowFold(el: Element): boolean {
  return el.getBoundingClientRect().top > window.innerHeight;
}

/**
 * `.heatable` transitions --heat over 1.4s, which would smear every value GSAP
 * writes, so GSAP sets `transition: none` while it drives heat. This hands
 * both back in one go: the element eases from wherever GSAP left it to its
 * CSS heat, and hover heat works again.
 */
function releaseHeat(el: Element) {
  const style = (el as HTMLElement).style;
  style.removeProperty("transition");
  style.removeProperty("--heat");
}

/**
 * The homepage's scroll choreography. Loaded only for the "full" motion tier,
 * after the page is idle. Returns a cleanup that reverts every tween, trigger
 * and pin, leaving the static page as it was.
 */
export function initForgeMotion(root: HTMLElement, burst: Burst): () => void {
  const mm = gsap.matchMedia();

  // The pin goes first: it inserts spacing that moves everything below it, and
  // triggers created after it measure against the final layout.
  const process = root.querySelector<HTMLElement>("[data-process]");
  if (process && belowFold(process)) {
    mm.add(PIN_QUERY, () => pinnedProcess(process, burst));
    mm.add(`not all and ${PIN_QUERY}`, () => steppedProcess(process, burst));
  }

  const ctx = gsap.context(() => {
    seams(root);
    cards(root);
    hallmarks(root, burst);
  }, root);

  ScrollTrigger.refresh();

  return () => {
    ctx.revert();
    mm.revert();
  };
}

/** Weld seams draw left to right as their section comes up the screen. */
function seams(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-seam]").forEach((section) => {
    if (!belowFold(section)) return;
    gsap.fromTo(
      section,
      { "--seam-draw": 0 },
      {
        "--seam-draw": 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 55%", scrub: 0.6 },
      },
    );
  });
}

/** Cards and capability blocks arrive hot and cool off. */
function cards(root: HTMLElement) {
  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-card]")).filter(belowFold);
  if (targets.length === 0) return;
  // Opacity only, never visibility: hidden content would drop out of the
  // accessibility tree until it was scrolled to.
  gsap.set(targets, { opacity: 0, y: 28, "--heat": 0.9, transition: "none" });
  ScrollTrigger.batch(targets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        clearProps: "opacity,transform",
      });
      gsap.to(batch, {
        "--heat": 0,
        duration: 1.8,
        delay: 0.2,
        ease: "power2.out",
        stagger: 0.09,
        onComplete: () => batch.forEach(releaseHeat),
      });
    },
  });
}

/** Hallmarks are struck onto the steel bar one after another. */
function hallmarks(root: HTMLElement, burst: Burst) {
  const marks = Array.from(root.querySelectorAll<HTMLElement>("[data-hallmark]")).filter(
    belowFold,
  );
  if (marks.length === 0) return;
  gsap.set(marks, { opacity: 0, scale: 1.6 });
  ScrollTrigger.batch(marks, {
    start: "top 85%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((mark, i) => {
        gsap.to(mark, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          delay: i * 0.14,
          ease: "power4.in",
          clearProps: "opacity,transform",
          onComplete: () => {
            const r = mark.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2, 0.4);
          },
        });
      });
    },
  });
}

/**
 * One hammer strike: the step drops in hot, sparks fly, it jolts, then cools.
 * Leaves no inline styles behind once it settles.
 */
function strike(step: HTMLElement, burst: Burst) {
  gsap
    .timeline({
      onComplete: () => {
        releaseHeat(step);
        gsap.set(step, { clearProps: "opacity,transform" });
      },
    })
    .fromTo(
      step,
      { opacity: 0, y: -36, "--heat": 1, transition: "none" },
      { opacity: 1, y: 0, duration: 0.26, ease: "power4.in" },
    )
    .call(() => {
      const r = step.getBoundingClientRect();
      burst(r.left + 24, r.top + r.height / 2, 0.8);
    })
    .to(step, { x: 3, duration: 0.04, yoyo: true, repeat: 3, ease: "none" })
    .to(step, { "--heat": 0.12, duration: 1.4, ease: "power2.out" }, "<");
}

/**
 * Desktop: the Process section pins while the four steps strike in turn and
 * the rail fills. Step 1 strikes as the pin begins, so arriving by the nav
 * link never shows an empty column.
 */
function pinnedProcess(section: HTMLElement, burst: Burst) {
  const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
  const rail = section.querySelector<HTMLElement>("[data-rail]");
  const struck = new Set<number>();

  gsap.set(steps, { opacity: 0, y: -36 });
  if (rail) gsap.set(rail, { "--rail": 0 });

  ScrollTrigger.create({
    trigger: section,
    start: "top top+=64",
    end: `+=${steps.length * 55}%`,
    pin: true,
    onUpdate: (self) => {
      if (rail) gsap.set(rail, { "--rail": self.progress });
      const due = Math.min(steps.length, Math.floor(self.progress * steps.length) + 1);
      for (let i = 0; i < due; i++) {
        if (struck.has(i)) continue;
        struck.add(i);
        strike(steps[i], burst);
      }
    },
  });
}

/** Phones and short screens: no pin, each step strikes as it scrolls in. */
function steppedProcess(section: HTMLElement, burst: Burst) {
  const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]")).filter(belowFold);
  gsap.set(steps, { opacity: 0, y: -36 });
  steps.forEach((step) =>
    ScrollTrigger.create({
      trigger: step,
      start: "top 82%",
      once: true,
      onEnter: () => strike(step, burst),
    }),
  );
}
```

- [ ] **Step 3: Create `src/components/forge/ForgeMotionMount.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { whenIdle } from "@/lib/idle";
import { useMotion } from "./MotionProvider";

/**
 * Loads the GSAP choreography for the full motion tier once the page is idle,
 * and reverts it on unmount. Renders nothing. If the chunk fails to load, the
 * page simply stays static.
 */
export function ForgeMotionMount() {
  const { tier, burst } = useMotion();

  useEffect(() => {
    if (tier !== "full") return;
    const root = document.getElementById("top");
    if (!root) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      import("./forgeMotion")
        .then((m) => {
          if (!cancelled) cleanup = m.initForgeMotion(root, burst);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, [tier, burst]);

  return null;
}
```

- [ ] **Step 4: Mount it in `PortfolioPage`**

In `src/components/PortfolioPage.tsx`, add `import { ForgeMotionMount } from "./forge/ForgeMotionMount";` after the `MotionProvider` import, and make `<ForgeMotionMount />` the first child of `<MotionProvider>`, before `<SiteHeader />`.

- [ ] **Step 5: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all pass.

- [ ] **Step 6: Behaviour check**

On the production server at 1280×800:
- **Weld seams** draw left to right as each section rises.
- **Process:** the section pins below the header. Step 1 strikes immediately and the others strike as you scroll, each with sparks, a jolt and a cool-down, while the rail fills. The pin then releases.
- **Cards and capabilities** arrive hot and cool. Hover heat still works on them afterwards.
- **Hallmarks** stamp in sequence, with small bursts.

At 375px wide there's no pin, and each step strikes as it enters. On `/?motion=static` nothing moves and nothing is ever hidden. Click "Process" in the nav: no empty column at any width.

- [ ] **Step 7: Measure**

Run:
```bash
node scripts/lighthouse-summary.mjs t6-gsap "http://localhost:3000/?motion=full"
node scripts/lighthouse-summary.mjs t6-static
```
Expected:
- `t6-gsap`: `scriptKB` ≤ baseline-full + ~55 (GSAP + ScrollTrigger are ~45 KB gzip), performance ≥ 90, CLS 0.
- `t6-static`: performance and CLS are unchanged from `t4-static`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/forge/forgeMotion.ts src/components/forge/ForgeMotionMount.tsx src/components/PortfolioPage.tsx
git commit -m "Choreograph the homepage on scroll with GSAP: seams, strikes, heat and hallmarks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

---

### Task 7: The three.js hero

**Files:**
- Modify: `package.json`, `package-lock.json` (add `three`, `@types/three`)
- Create: `src/components/forge/heroScene.ts`
- Modify: `src/components/home/Hero.tsx`, `README.md`

**Interfaces:**
- Consumes: `HERO_TRAIN`, `gearHoles`, `gearOutline`, `type SpurGear` (Task 2); `.hero-stage` / `.is-live` CSS (Task 4); `useMotion()`, `whenIdle()` (Task 5).
- Produces: `mountHeroScene(canvas: HTMLCanvasElement, stage: HTMLElement): () => void` in `heroScene.ts`. The only three importer.

- [ ] **Step 1: Install three.js**

Run: `npm install --save-exact three@0.186.1 && npm install --save-exact --save-dev @types/three@0.186.0`

- [ ] **Step 2: Create `src/components/forge/heroScene.ts`**

```ts
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

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    return new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
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
```

- [ ] **Step 3: Mount the scene from the hero**

Replace `src/components/home/Hero.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { whenIdle } from "@/lib/idle";
import { useLanguage } from "../LanguageProvider";
import { useMotion } from "../forge/MotionProvider";
import { Kicker } from "./Kicker";
import { HeroPoster } from "./HeroPoster";

export function Hero() {
  const { t } = useLanguage();
  const { tier, setAmbientSource } = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Embers rise off the gear side of the stage while the hero is on screen. */
  useEffect(() => {
    const stage = stageRef.current;
    if (tier !== "full" || !stage) return;
    const source = () => {
      const r = stage.getBoundingClientRect();
      return new DOMRect(r.left + r.width * 0.45, r.top, r.width * 0.55, r.height);
    };
    const observer = new IntersectionObserver(([entry]) =>
      setAmbientSource(entry.isIntersecting ? source : null),
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      setAmbientSource(null);
    };
  }, [tier, setAmbientSource]);

  /* The three.js scene: loaded after idle, never on the static tier. The
     poster stays underneath until the first frame is drawn. */
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (tier !== "full" || !stage || !canvas) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      import("@/components/forge/heroScene")
        .then((m) => {
          if (!cancelled) destroy = m.mountHeroScene(canvas, stage);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      cancelIdle();
      destroy?.();
    };
  }, [tier]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" ref={stageRef} aria-hidden="true">
        <HeroPoster />
        {tier === "full" ? <canvas ref={canvasRef} /> : null}
      </div>
      <div className="wrap hero-copy">
        <Kicker index="01">{t("kicker.workshop")}</Kicker>
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 id="hero-title">
          {t("hero.title")} <span className="hot">{t("hero.titleHot")}</span>
        </h1>
        <p className="lead">{t("hero.lead")}</p>
        <div className="actions">
          <Link className="btn" href="#work">
            {t("hero.viewWork")}
          </Link>
          <Link className="btn secondary" href="#contact">
            {t("hero.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Document the motion layer**

In `README.md`, under `## Stack`, add after the CSS bullet:

```markdown
- three.js (hero gear scene) and GSAP + ScrollTrigger (scroll choreography) on
  the homepage only. Both load after first paint, and only for the "full"
  motion tier (`src/lib/motionTier.ts`). Reduced motion, data saver or no
  WebGL2 gets the static poster instead. `?motion=static` / `?motion=full`
  force a tier for testing.
```

- [ ] **Step 5: Type-check, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all pass.

- [ ] **Step 6: Visual check (real GPU)**

In a normal (headed) Chrome window on the production server:
- **Crossfade:** the poster shows first. Within about 2s the 3D gear train fades in over it, in the same place and at the same size, with no jump. If it jumps, adjust only the `.hero-gears` numbers in `home.css`.
- **Gears:** they mesh and turn. Moving the mouse tilts the train. Cracks glow in the molten backdrop.
- **Scroll:** scrolling down turns the gears further and cools everything to dull steel.
- **Text:** stays legible over the scene at 1280 and 375px.
- **`/?motion=static`:** no canvas, poster only.

- [ ] **Step 7: Measure**

Run:
```bash
node scripts/lighthouse-summary.mjs t7-full "http://localhost:3000/?motion=full"
node scripts/lighthouse-summary.mjs t7-static
```
Headless Chrome has no WebGL, so `?motion=full` downloads and parses three.js and then falls back to the poster. That measures the JS cost, which is what the budget covers.

Expected:
- `t7-full`: `scriptKB` ≤ baseline-full + 200, performance ≥ 90, CLS 0.
- `t7-static`: unchanged from `t6-static`.

If `t7-full` misses the budget, try these in order and re-measure after each:
1. Drop `RoomEnvironment`: delete its import, the PMREM lines and their dispose calls, and raise `rim` to 2.4 to compensate.
2. Reduce `curveSegments` to 16.

If it still misses, stop and report the numbers to the user. The spec allows cutting or slimming the scene, but that's their call.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/forge/heroScene.ts src/components/home/Hero.tsx README.md
git commit -m "Forge the hero in three.js: a meshing gear train over molten metal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

---

### Task 8: Final verification and results

**Files:**
- Modify: `docs/superpowers/specs/2026-10-11-forge-rebrand-design.md` (add a "Results" table to section 5)

- [ ] **Step 1: Full test and build from clean**

Run: `rm -rf .next && npx tsc --noEmit && npm test && npm run build`
Expected: all pass, 21 tests.

- [ ] **Step 2: The full checklist on the production server**

The spec's section 5 checklist:
1. Screenshots at 375, 768 and 1280px, in EN and ES, of `/`, `/blog` and one article. Every string is translated, with no clipping and no sideways scroll.
2. Fallbacks:
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, then reload: static poster, nothing moves, and hover heat is instant.
   - `?motion=static`: the same.
   - The `curl` check from Task 4 Step 12 still lists all six strings.
3. Keyboard: Tab through the homepage. Every link, button and field shows the ember focus ring, and focusing inside a card heats it.
4. The contact form sends a test message and the weld plays. Delete the message in `/a`.
5. `/a` renders unchanged with its own styles: `git diff master --stat -- 'src/app/(admin)'` prints nothing.

- [ ] **Step 3: Final measurements**

Run:
```bash
node scripts/lighthouse-summary.mjs final
node scripts/lighthouse-summary.mjs final-full "http://localhost:3000/?motion=full"
node scripts/lighthouse-summary.mjs final-blog "http://localhost:3000/blog/linux-dead-key-apostrophe-fix"
```

- [ ] **Step 4: Record results in the spec**

In section 5, after the Baseline table, add:

```markdown
**Results** (after Task 7, same method):

| URL | Perf | A11y | LCP | CLS | TBT | Script KB (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | <performance> | <accessibility> | <lcp> | <cls> | <tbt> | <scriptKB> |
| `/?motion=full` | <performance> | <accessibility> | <lcp> | <cls> | <tbt> | <scriptKB> |
| article | <performance> | <accessibility> | <lcp> | <cls> | <tbt> | <scriptKB> |
```

Fill each `<…>` cell with the value from Step 3, and note in one sentence whether each budget line was met.

- [ ] **Step 5: Commit and hand back**

```bash
git add docs/superpowers/specs/2026-10-11-forge-rebrand-design.md
git commit -m "Record the forge rebrand's final measurements

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016mj2VTYYksBByAr4a4SR74"
```

Then report to the user:
- the results table, set against the baseline
- the commits on `forge-rebrand`
- a reminder that nothing has been pushed

Ask whether to push the branch. A push creates a Vercel preview, so it's their call.
