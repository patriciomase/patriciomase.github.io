# Forge rebrand — design

Date: 2026-10-11 · Branch: `forge-rebrand`

Rebrand the public site (homepage + blog) around "Software Craftsmanship &
The Industrial Forge": dark cast iron, forge amber, raw steel, welds, embers,
gears. The `/a` admin panel is out of scope and must not change.

## Decisions

| Topic | Decision |
| --- | --- |
| Copy voice | **Frame, not costume.** The metaphor lives in visuals, small mono section labels ("kickers") and a few key lines. Headlines, body and nav stay plain and specific. |
| Scope | **Whole public site.** Homepage gets the full treatment; blog index and articles get palette, type and chrome but stay calm (no WebGL, GSAP or sparks). |
| Project specs | **Existing facts only.** Spec plates restate what the site already says. No numbers, no new disclosure about client work. |
| Visual direction | **Cinematic forge.** three.js hero, GSAP + ScrollTrigger sequences, canvas sparks, behind strict performance guardrails. |
| Styling | Plain CSS with custom-property tokens. No Tailwind (the repo is framework-free on purpose). |
| Portrait | Moves from the hero to 02 The Process, framed and colour-graded. |

Copy rule for every rewrite: **no new claims.** Each sentence must restate
something already on the site (`src/lib/i18n.ts` at commit `15c49f8`). Every
string ships in EN and in Rioplatense ES (voseo), via `i18n.ts`; the existing
`es: Record<MessageKey, string>` typing makes a missing ES key a build error.

## 1. Structure and content map

Old anchor ids are kept so existing inbound links still land.

| # | id | Kicker (EN / ES) | Heading | Source |
| --- | --- | --- | --- | --- |
| 01 | `top` | THE WORKSHOP / EL TALLER | "I shape product ideas and team workflows into software built to last." | `hero.*` |
| 02 | `about` | THE PROCESS / EL PROCESO | "I build things that don't get in the way." (kept; ES kept: "Hago software que resuelve.") | `about.body1/2` |
| 03 | `work` | FORGED WORKS / OBRAS FORJADAS | Selected work / Proyectos destacados | `work.*` |
| 04 | `capabilities` (new) | CAPABILITIES / CAPACIDADES | "What I bring to a build" / "Lo que aporto a cada proyecto" (draft, final in phase 2 review) | skills chips, `experience.note`, `about.body1` |
| 05 | `experience` | MAKER'S MARKS / MARCAS DEL OFICIO | Experience / Experiencia | `experience.*` |
| 06 | `contact` | COMMISSION / ENCARGO | "Have something useful to build?" (kept) | `contact.*` |

Kickers render as `NN — LABEL` in mono with an ember dash.

**01 Hero.** Eyebrow: "Software craftsman · Senior engineer · Since 2011"
(2011 from `about.body1`). Lead adapted from `hero.lead`: interfaces, internal
tools, automation and AI-assisted processes, with attention to feel,
maintainable code and everyday use. Buttons: **See the work** (`#work`),
**Start a commission** (`#contact`). Right side: the hero scene (§3).

**02 Process.** Portrait plate ("the craftsman") + heading + four steps:

1. **Raw material**: understand the product and the team's workflow.
2. **Architecture**: system design.
3. **Build & weld**: backend services, interfaces; AI-assisted by default to
   shorten feedback loops (`about.body2`).
4. **Temper & test**: delivery, monitoring, observability.

**03 Works.** The six existing cards, current order. Each card: tag, status,
icon + title, body, spec plate, link (own products only). Status words stay
"Ongoing"/"Recent"; visually ongoing = still hot (glowing ember dot), recent =
cooled steel. The three own products carry a "maker's own" stamp.

Spec plates (labels in mono; all values from existing copy):

| Card | Rows |
| --- | --- |
| PTAC control | SCALE: Single unit → whole building · CONTROL: Remote · ACCESS: Private client system |
| Guided intake | HANDLES: Partial progress · Validation · Resuming days later · HANDS OFF TO: Follow-up teams · ACCESS: Private client system |
| Storefronts & content | FOCUS: Fast pages · CMS-driven content · Clean analytics · USED BY: Merchandising and marketing teams |
| GastosCasa | PLATFORM: Web · Mobile · HANDLES: Installments · Multi-currency · Inflation tracking · ROLE: Designed, built and run by me |
| Vivaire | PLATFORM: Web · Mobile · CUES: Audio · Haptics · HANDLES: Custom routines · Reminders · Streaks · Sync · Share by link |
| FATBEATS.org | RUNS IN: The browser · BUILT ON: Web Audio API · Canvas · MODES: A dozen, tunable live · PRIVACY: Audio never leaves the browser |

**04 Capabilities.** Five blocks from the five skill chips: System
architecture; Product engineering; AI workflows; Monitoring & performance;
Team collaboration (delivery and hiring). Tool marks: React · Next.js ·
Node.js · AWS (untranslated).

**05 Experience.** The existing timeline (UTN 2008 → Utility present) as
hallmarks stamped along a steel bar. Logos stay, colour-graded; `dark` logos
keep their dark backdrop.

**06 Commission.** Same form (name, email, message, honeypot, locale), same
server action, BotID and schema. Laid out as a work order with mono labels.
Submit stays "Send message".

**Nav:** Work · Process · Experience · Blog · Contact (ES: Trabajo · Proceso ·
Experiencia · Blog · Contacto). Capabilities is reached by scrolling.
**Meta:** `metaDescription` updated in both languages. Footer line kept.

## 2. Design system

Tokens (`color-scheme: dark`, dark only):

| Token | Value | Use |
| --- | --- | --- |
| `--iron` | #121212 | page |
| `--iron-raised` | #1A1A1A | surfaces |
| `--seam` | #2A2A2A | hairlines |
| `--ash` | #ECE8E1 | body text |
| `--steel` | #8A95A5 | secondary text, resting borders (6.2:1 on `--iron`) |
| `--ember` / `--ember-2` | #FF5500 / #FF8C00 | accents, kicker dash, focus ring |
| `--molten` | #C4161C | sparing deep red inside glows |
| `--white-hot` | #FFE8C2 | top of the heat ramp |

**Type** (all via `next/font`, self-hosted): Big Shoulders Display 800–900
for headings (confirm the current Google family name at install; it may now
be "Big Shoulders"); Inter for body (kept); JetBrains Mono for kickers, spec
plates, hallmarks and blog code.

**Textures** (CSS only, no image requests): cast iron = tiny inline SVG
`feTurbulence` noise over `--iron` + vignette; industrial grid = 48px hairline
grid, edge-masked; weld seam = rippled bead line, amber core + soft glow,
used as section dividers; forged frame = bevel (light top inset, dark bottom)
+ corner rivets via pseudo-elements.

**Heat:** one registered custom property, `@property --heat` (`<number>`,
0–1). Borders and glows interpolate steel → amber → white-hot from it. Hover,
focus and scroll sequences only ever animate `--heat`.

**Components:** `.kicker`; buttons `.btn-molten` (primary) and `.btn-steel`
(secondary, heats on hover); forged card + spec plate (`<dl>`, mono `<dt>`);
capability block; hallmark (engraved text-shadow); tool mark; work-order
fields (amber seam on focus); portrait grade (grayscale + amber duotone
overlay via blend mode). Focus: 2px `--ember` outline, keyboard only.

**Files:** `globals.css` (1,200 lines, mostly rewritten) splits into
`src/styles/tokens.css`, `base.css` (reset, type, header, footer, buttons),
`home.css`, `blog.css`, imported from `src/app/(site)/layout.tsx`.
`src/app/(admin)/admin.css` is untouched.

## 3. Cinematic layer

**Hero scene** (three.js): a procedurally extruded, bevelled gear
(`ExtrudeGeometry`, metalness ~1, roughness ~0.45), lit by an ember point
light from below and a cool steel rim light, over a full-bleed molten-metal
shader (fbm noise, dark crust, glowing cracks `--ember` → `--white-hot`).
Gear tilts toward the pointer, rotates with scroll (ScrollTrigger scrub) and
cools (glow fades) as the hero leaves the viewport. A left-side gradient keeps
the text legible. A static poster (CSS ember glow + inline SVG gear) renders
first; the canvas fades in over it with no layout change.

**Scroll sequences** (GSAP + ScrollTrigger):
- Process: pinned on ≥768px; steps strike one at a time (hammer jolt, heat
  flash, spark burst, cool) while a progress rail glows forward. Below 768px:
  no pin, each step strikes on entry.
- Works: cards heat on entry; on hover, heat + a small burst at the pointer.
- Experience: hallmarks stamp in sequence.
- Section dividers: weld seams draw left → right on scroll.
- Header: thin molten scroll-progress line.
- Contact: on success, a weld bead runs the form edge + a burst.

**Sparks:** one shared fixed 2D canvas, ~3 KB, pooled particles capped at 120,
API `burst(x, y, intensity)` plus a low ambient ember emitter for the hero.
Pauses when the tab is hidden.

**Guardrails:**
- LCP element is the server-rendered H1 text. three.js and GSAP load via
  dynamic `import()` after hydration, on idle. Nothing heavy is render-blocking.
- One tier switch, `src/lib/motionTier.ts` → `"full" | "static"`. `full`
  requires WebGL2, `prefers-reduced-motion: no-preference`, and no
  `navigator.connection.saveData`. `static` = poster, no particles, no
  pin/scrub, sections plainly visible, hover heat as colour only.
- Debug override for testing: `?motion=static` / `?motion=full` forces a tier.
- Renderer DPR capped at 1.5; scene pauses offscreen (IntersectionObserver)
  and when the tab is hidden.
- Content is complete with JS disabled. Hidden start states are applied only
  once GSAP has loaded, and only to elements below the fold. This replaces
  `ScrollReveal.tsx` and its CSS.
- Budget: ≤ ~200 KB gzip of added JS, all deferred; CLS 0; Lighthouse mobile
  performance ≥ 90.

**Files:**
- `src/components/home/{Hero,Process,Works,Capabilities,Experience,Commission}.tsx`
- `src/components/home/data.ts`: work cards, spec rows, experience, capabilities
- `src/components/PortfolioPage.tsx`: composes the sections only
- `src/components/forge/HeroScene.tsx`: the only file importing three.js
- `src/components/forge/ForgeMotion.tsx`: the only file importing GSAP
- `src/components/forge/sparks.ts`: particle engine
- `src/lib/motionTier.ts`: the tier switch

Each effect can be deleted without breaking the page.

## 4. Blog

CSS only. Shared dark header/footer; the PM mark becomes a stamped steel
badge and `src/app/icon.svg` is re-tinted to match. Index: posts as forged
plates, date as a mono hallmark. Articles: column on `--iron`, `--ash` text
~18px with generous leading, Big Shoulders headings, ember-underlined links
(`.post-prose a`), callout = hot-edged plate, blockquote = quieter steel rule.
Reading-progress line under the header via CSS scroll-driven animation
(`animation-timeline: scroll()`), absent where unsupported. Shiki stays on
`github-dark-default`; `pre` gets `--iron-raised` and a seam border. Covers
and screenshots get a forged frame, never a colour filter.

## 5. Local testing (before anything is pushed)

Everything is verified on this machine first. The branch is only pushed when
you say so (a push also creates a Vercel preview, which is a second check,
not the first).

Prerequisites already in place: `node_modules/`, `.env` and `.env.local`
(DATABASE_URL, Clerk, PostHog, ADMIN_EMAILS), Node 24.

```bash
npm install                      # after phases 3/4 add three + gsap
npm run dev                      # iterate at http://localhost:3000

npx tsc --noEmit                 # types, incl. every ES key present
npm run build && npm run start   # production build, what Vercel serves

# Lighthouse, mobile profile (the CLI default), against the production build
npx lighthouse http://localhost:3000 \
  --only-categories=performance,accessibility \
  --output=html --output-path=/tmp/lh-<phase>.html --view
```

**Baseline** (measured on the pre-rebrand code, production build, Lighthouse mobile):

| URL | Perf | A11y | LCP | CLS | TBT | Script KB (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 94 | 100 | 3.1 s | 0 | 40 ms | 291 |
| `/?motion=full` | 95 | 100 | 3.0 s | 0 | 40 ms | 291 |

Each phase is compared against it.

**Checklist per phase** (on the production build):
1. `tsc` and `next build` pass.
2. Screenshots at 375 / 768 / 1280 px, EN and ES: `/`, `/blog`, one article.
3. Fallbacks: DevTools → Rendering → `prefers-reduced-motion: reduce`;
   DevTools → Disable JavaScript; `?motion=static`. All content readable.
4. Lighthouse vs baseline: perf ≥ 90, CLS 0, a11y ≥ baseline; JS transferred
   (DevTools Network, JS filter; `next start` serves gzip) within budget.
5. Contact form: one test submission succeeds (and plays the weld animation
   in phase 3+); delete it afterwards in `/a`.
6. `/a` renders unchanged with its own stylesheet.

**Analytics while testing (decided: accept the noise).** Local runs use
`.env.local`, so localhost page views reach PostHog and `page_views`, and the
test message lands in `messages`. No guard will be added.

## 6. Delivery phases

Each phase leaves the site fully working and is committed separately.

0. Baseline Lighthouse on `master`.
1. Tokens, type, textures, base components, header/footer, blog styling.
   CSS split.
2. Homepage restructure into section components + all new copy (EN + ES).
   Copy reviewed by you before commit.
3. GSAP motion, sparks, `motionTier`, removal of `ScrollReveal`.
4. three.js hero scene + poster.

Heaviest layers last: if 3 or 4 misses the budget, it can be cut or slimmed
without losing the rebrand.

## Out of scope

`/a` admin; database schema; post content and the publish/LinkedIn workflow;
OG/cover image generation; light mode.
