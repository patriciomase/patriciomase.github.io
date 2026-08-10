---
publishedAt: 2026-08-08
readMinutes: 8
status: published
eyebrow: AI workflows · Measurement
title: A hand-drawn plan, checked by closure
lead: A sketch on graph paper, twenty-two handwritten dimensions, and the question of how much paving to buy. The interesting capability is not that an agent can read the sketch. It is that it can treat the dimensions as an over-determined system, prove that they are inconsistent, and rank which one is lying.
excerpt: A hand-drawn floor plan whose measurements did not close by 50 cm. How a coding agent found the error, how it identified the culprit by measuring the drawing itself, and where it was stuck until a human went outside with a tape.
metaDescription: Turning a hand-drawn floor plan into a square-metre figure with a coding agent — polygon closure as a consistency test, pixel measurement of the scan for error attribution, and the shoelace formula for the area.
---

## Summary

A hand-drawn plan of a house and the paving strip around it, photographed to PDF by a note-taking app. Twenty-two handwritten dimensions. The goal was one number: square metres of flooring to buy.

The measurements did not close. Two independent paths around the outline disagreed by 50 cm. Three rounds of re-measurement brought the residual to 2 cm, at which point the area was 84.95 m² net. What follows is the method, because the method transfers and the number does not.

## The input is a photograph, not a drawing

The file is a single-page PDF produced by a phone note-taking app: a raster scan of ink on graph paper. There is no vector data, no layers, no structure. The dimensions are handwritten in Argentine decimal notation — `8,40` — some of them rotated ninety degrees to sit alongside vertical lines.

Reading that is the easy part, and it is the part people expect to be hard. A current model looks at the page and extracts the numbers and roughly where they sit. But reading produces a *belief*, and a belief about somebody's handwriting is a poor thing to buy 93 m² of ceramic against. The reading has to be tested.

## Closure is the test

Any closed outline, traversed once, returns to where it started. The sum of the edge vectors is zero. For an axis-aligned plan the two components separate, which makes the test trivial to state:

```
Σ dx = 0        Σ dy = 0
```

A fully dimensioned outline is therefore over-determined. Every horizontal edge length appears in one equation and every vertical edge length in the other, and nothing about the act of measuring forces either equation to hold. The redundancy is the entire value of the exercise: it converts *did I measure this right* from a judgement call into arithmetic.

First pass, using the numbers exactly as written on the sketch:

```
horizontal   8,40 + 2,40 + 0,80  = 11,60   going right
             0,40 + 4,17 + 7,00  = 11,57   going left      → 3 cm

vertical     2,60 + 9,00 + 3,53  = 15,13   down the right side
             3,53 + 6,10 + 6,00  = 15,63   up the left side  → 50 cm
```

Three centimetres over eleven metres is tape error. Fifty centimetres is a wrong number. The system says so; it does not say which number.

## The hard part is topology, not arithmetic

This is the honest part of the exercise. The arithmetic is trivial. What is not trivial is deciding **which segment each handwritten number labels**.

One example carried most of the difficulty. A `1,45` written along a short vertical line near the bottom of the plan has two plausible readings:

- **(a)** the width of the paving strip along the back of the house, or
- **(b)** the step in the house's own outline at that point.

Both are consistent with where the ink sits. They imply different geometry and about 2 m² of difference. My first reading was (a). The owner corrected it to (b).

The useful answer turned out to be neither, and it came out of the constraint system rather than out of the drawing. The two segments are *the same segment* if and only if the patio slab begins flush with the outer edge of the paving — and it does. One label was legitimately doing two jobs, which is why only one number had been written.

That is the pattern worth noticing. Solving the constraints does not only find errors. It recovers facts about the physical object that nobody wrote down, and that nobody would have thought to state.

## An independent estimate: measure the drawing itself

Closure proves an inconsistency exists. Attributing it to a specific number needs evidence from outside the constraint system, and the scan supplies some, because a sketch drawn on graph paper is roughly to scale even when it is not accurate.

The procedure is short:

1. Rasterise the page at a known resolution — `pdftoppm -r 200 -png -gray`.
2. Threshold. The pen strokes are much darker than the printed grid, so a cut at `pixel < 110` isolates the drawing.
3. Sum the boolean mask along each axis. A long straight stroke produces a spike in the column sum (for vertical lines) or the row sum (for horizontal ones). Runs above a threshold are the drawn lines; the argmax within each run is its position in pixels.
4. Fix the scale with one dimension you trust. The `8,40` top edge spans 650 px, giving 77.4 px/m.
5. Convert every detected line position to metres and compare each segment against its handwritten label.

Every segment agreed with its label to within 0.3 m — except one. The long right-hand vertical labelled `9,00` measured about 9.8 m at the drawing's own scale.

That is not proof; hand drawings distort, and this one distorts most where the gaps are narrow. But combined with a 50 cm closure failure it points at one number instead of five, which is the difference between a useful question to ask the owner and a vague one. Note the precondition: this only works because the sketch was drawn on graph paper with honest proportions. A deliberately schematic drawing yields nothing.

## Four rounds

| Round | Left chain | Right chain | Vertical residual |
|---|---|---|---|
| As written | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — right side short |
| Label reassigned | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — proposal: 9,50 |
| Left re-measured | 5,80 + 5,50 = 11,30 | 2,60 + 9,00 = 11,60 | 30 cm — right side **long**, proposal: 8,70 |
| Left re-measured again | 5,90 + 5,68 = 11,58 | 2,60 + 9,00 = 11,60 | **2 cm** — closes |

The sign flip in round three is the instructive event. Under the first hypothesis the correction to `9,00` was upward, to 9,50; under the second it was downward, to 8,70. Both were derived correctly from the data available at the time, and they contradict each other.

A residual tells you the magnitude of an inconsistency, not its cause. Attribution is a separate problem, and it is only settled by more measurements. An agent that reports the proposed correction without reporting that it is one of several possible attributions is producing a number that looks firmer than it is.

## What fell out that nobody measured

Once the outline closes, the rest of the geometry is determined. None of the strip widths were ever measured; they are consequences:

| | metres |
|---|---|
| Strip along the front | 1,73 |
| Left side, upper run | 2,03 |
| Left side, lower run | 1,73 |
| Strip along the back | 1,45 |
| Strip along the right | 0,54 |

So is the length of the house's right-hand wall, 8,05 m, which carries no dimension anywhere on the sketch.

The internal coherence of that set is itself a check. Four of the five widths land between 1.45 and 2.03 m, which is what a person laying a footpath actually produces. Had one come out at 0.2 and another at 3.4, the topology would have been wrong somewhere and the closure would have been a coincidence.

The right-hand strip is the exception, and it is instructive too: 0.54 m by closure against `0,40` written on the sketch. That 14 cm is precisely the residual of the house's own perimeter loop — `5,45 + 2,78 = 8,23` against `4,17 + 5,30 − 1,10 = 8,37`. Accumulated tape error has to land somewhere, and it lands in the narrowest dimension, because that is the one where a fixed absolute error is least visible.

## Producing the drawing and the number

The plan is generated, not drawn: two arrays of vertices, one for the outer boundary and one for the house, converted to SVG paths in a loop. Dimension text sits at each segment's midpoint with a per-segment offset, which is the only part that needs manual fiddling — labels collide, and where they collide is not predictable from the geometry.

The paved region is a single path using both polygons with `fill-rule="evenodd"`, so the house is a hole rather than something that has to be subtracted by decomposing the strip into rectangles. That matters more than it sounds: rectangle decomposition is where hand calculations of this kind normally go wrong.

The area comes from the shoelace formula applied to the same arrays:

```
A = ½ |Σ (xᵢ · yᵢ₊₁ − xᵢ₊₁ · yᵢ)|

outer   138,09 m²
house    73,60 m²
paved    64,49 m²
```

Plus a detached car pad and three steps measured separately: **84.95 m² net**, 93.4 m² with 10 % cutting waste.

Because the drawing and the area are computed from the same arrays, they cannot disagree. The common failure mode in this kind of work is a plan that says one thing and a spreadsheet that says another; deriving both from one source removes that class of error entirely.

## Verification detail: render what you generate

One general lesson, worth a paragraph. Generated SVG has to be looked at, and an agent cannot look at a file — it has to render it to a raster and read that back.

ImageMagick's `convert` was available and rendered the SVG **wrongly**: bad font metrics, mishandled `viewBox`, output that looked like a serious bug in the generator. It was not. Headless Chrome rendered the same file correctly:

```bash
google-chrome --headless --disable-gpu --screenshot=out.png \
  --window-size=1240,1150 --hide-scrollbars "file://$PWD/plan.html"
```

Two label collisions were found and fixed this way that were invisible in the source. The broader point is that a verification tool that silently disagrees with the target renderer is worse than no verification at all, and the only way to find that out is to check its output against something you already know is right.

## What it could not do

Every genuinely new fact in this exercise came from the person holding the tape. The agent could show that a number was wrong, rank which one, and state what the answer must be if everything else is right. It could not:

- know that the car pad sits at the entrance to the lot rather than against the house — the difference between 85 and 75 m²;
- know whether the risers of the steps get tiled as well as the treads;
- decide whether `0,40` or 0,54 is the true width of the right-hand strip.

The division of labour is stable across this class of task: the agent holds the model and the arithmetic, the human holds the ground truth. What changes is the quality of the questions. Because the constraint system identifies which measurement is load-bearing, the agent asks *re-measure the right-hand side, it is worth 2 m²* instead of *are you sure about these numbers*.

## What generalises

The transferable claim is not that an agent can read a sketch. It is:

1. **Any measured artefact with redundancy can be checked mechanically.** Floor plans close. So do bills of materials, timing budgets, and financial models. The redundancy is usually already there and simply not exercised.
2. **The check should be a program, not a reading.** Re-running closure after each correction cost nothing, which is the only reason four rounds was practical rather than tedious.
3. **Independent estimates are what make attribution possible.** Closure finds the error; measuring the scan points at the culprit. Neither alone would have got there.
4. **Drawing and number must come from one source of truth**, or they will eventually disagree and nobody will notice.

Total elapsed time was under an hour, most of it the owner walking outside with a tape measure. That ratio is the actual result.
