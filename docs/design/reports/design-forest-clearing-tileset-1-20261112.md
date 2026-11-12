# Design Report: Forest-Clearing Tileset (Grass Top, Water Top, Cliff Riser)

**Slug:** `forest-clearing-tileset`
**Report version:** 1
**Author:** Human + Claude (Opus)
**Date:** 2026-11-12

## 1. Summary

This task produced the first real terrain art for the prototype's combat scene (feature `05-combat-scene`):
three pixel-art SVG tiles that replace the flat-coloured placeholder `Graphics` shapes currently drawn by
`src/composables/useBattlefieldRenderer.ts`. The combat scene renders a 24x24 isometric battlefield as
FFT-Tactics-style "stacked columns": every grid cell is one top-face diamond — grass when the heightmap value
is above water level, water when it is at or below it — sitting on top of zero or more one-height-unit
"riser" sprites, one per unit of drop toward the lower neighbour to the south or to the east. Three assets
cover that entire vocabulary: `tile-grass-top.svg`, `tile-water-top.svg`, and a single `tile-riser.svg` reused
for both visible cliff faces.

The defining constraint here was not stylistic but geometric: the renderer already exists and already places
these sprites at fixed pixel offsets derived from `TILE_WIDTH = 64`, `TILE_HEIGHT = 32`, and
`HEIGHT_STEP = 16`. Each file therefore had to match an exact canvas size and an exact silhouette so that
columns assemble with no gaps and no overlaps. To guarantee that rather than eyeball it, all three files were
authored as explicit per-scanline pixel grids by a generator script, then verified programmatically (silhouette
spans, absence of interior holes, exact 16px vertical pitch per riser column) and visually by compositing a
synthetic multi-height patch into an image and inspecting it. Per the PRD, visual quality is explicitly not a
priority for this spike, so the art is deliberately simple: flat colours, a three-band vertical ramp per tile,
a 1px tile-edge rim for grid readability, and light scattered detail.

## 2. Request and scope

| Item                      | Value                                                    |
| -------------------------- | --------------------------------------------------------- |
| Original request           | Produce a small forest-clearing tileset for feature `05-combat-scene` as a drop-in replacement for the existing placeholder `Graphics` shapes, matching their exact canvas dimensions and silhouettes: (1) `tile-grass-top.svg`, 64x32, diamond (32,0)/(64,16)/(32,32)/(0,16); (2) `tile-water-top.svg`, same canvas and silhouette, for cells at or below water level; (3) `tile-riser.svg`, 32x32, parallelogram (0,0)/(32,16)/(32,32)/(0,16), reused for both the south- and east-facing cliff edges (the code mirrors it horizontally for one of them), so it must carry no asymmetric detail. Pixel art, transparent outside the silhouette, small palette: greens / blues / earthy browns-greys. Save under `src/assets/tilemaps/` with exactly those file names; touch no application code. |
| Deliverable type           | Tileset (three loose single-tile SVG files, not a packed sheet) |
| In scope for this report   | The three SVG tiles listed above and this report.        |
| Explicitly out of scope    | All application code — nothing under `src/composables/`, `src/scenes/`, `src/utils/`, `src/stores/`, or `src/components/` was created or edited, and the placeholder `Graphics` shapes in `useBattlefieldRenderer.ts` were **not** swapped out (that is step 6 of the feature plan and belongs to `game-dev-js`). Also out of scope: a treeline/forest-border tile (explicitly deferred to a future US by spec question 9), the impassable rock-formation obstacle tile from the GDD, tile-highlight/selection overlays for movement range, unit sprites, VFX, and any water-edge/shoreline transition tile. |

## 3. Source documents reviewed

| Document                                     | Key takeaways for this deliverable                     |
| ---------------------------------------------- | --------------------------------------------------------- |
| `docs/PRD-isometric-battle-prototype.json`     | Time-boxed spike validating an FFT-like tactical combat hypothesis. Its `dependencies` section states visual quality is **explicitly not a priority** and that art may be AI-generated or taken from free packs, which set the investment level: legible, flat, cheap. Its NFR section repeatedly flags capping simultaneous sprites for the frame-rate target, reinforcing that tiles should stay trivial to batch (flat fills, no gradients or alpha blending). FR-003/FR-005 also confirm height is a first-class gameplay quantity, not decoration — so the per-unit step must be *visually countable*, which drove the riser's bottom seam line. |
| `docs/GDD-isometric-battle-prototype.md`       | Confirms the battlefield is "24x24 tiles, isometric projection", a single fixed map, "an open field with rocky outcrops", and exactly two terrain features: variable **Height** (interacting with Movement/Jump) and a single impassable **rock formation**. Only height needed representing here; the rock formation is a separate asset not requested. Because each height step costs Movement, the art must make a one-unit step readable at a glance — hence one riser = one height unit, with a visible seam between stacked risers. No difficult-terrain type exists, so water needs no distinct passability tell beyond being obviously water. |
| `docs/HLD-isometric-battle-prototype.json`     | No tile size, sprite size, or projection ratio is fixed there (consistent with CLAUDE.md). The binding numbers came instead from the already-written `src/utils/isometricProjection.ts` (`TILE_WIDTH = 64`, `TILE_HEIGHT = 32`, `HEIGHT_STEP = 16`) and feature-plan question 2. The HLD's relevant constraints are the rendering split (Pixi owns the canvas; these are Pixi textures, not DOM images) and its "cap simultaneous sprites" mitigation. |
| Relevant ADRs                                  | `0001-pixijs-as-rendering-engine.md` — assets are consumed as Pixi textures via `Assets.load(...)`; the plan confirms SVG loads directly as a texture, so no atlas or power-of-two constraint applies and loose files are fine. `0003-gsap-for-all-animation.md` — all animation goes through GSAP, which is why the water tile is a **single static frame** with no baked animation. `0002` (pathfinding) and `0004` (SQLite/WASM) have no bearing on terrain art. `0005` (`src/model` vs `src/utils`) is a code-organisation ADR, not applicable. |
| Existing `src/assets/spritesheets` / `tilemaps`| Both were empty apart from `.gitkeep` — **these are the first tile assets in the project**, so no tile size, palette, or naming convention existed to inherit. The only prior art in the repo is `src/assets/ui/` (initial-screen UI chrome, report `design-initial-screen-ui-1-20261110.md`), whose conventions were reviewed and partly reused (flat `<rect>` shapes on an integer grid, `shape-rendering="crispEdges"`, kebab-case names, English identifiers) and partly deliberately not (its 4x authoring upscale and its dusk-UI palette — see section 5). |
| `docs/features/05-combat-scene/spec-...md` and `plan-...md` | Fixed the content: a forest-clearing theme, grass ground plus a water tile for height 0, stacked block tiles whose visible height reflects the heightmap, a fixed 1280x720 canvas, and **no treeline** (question 9). The plan fixed the composite stacked-column approach (question 1), the 64x32 / 16px-step geometry (question 2), the three exact file names, and that it is the renderer — not the art — which decides riser counts from south/east neighbour deltas. It also notes the exact palette was left open for this deliverable to decide. |
| `src/composables/useBattlefieldRenderer.ts` and `src/utils/isometricProjection.ts` | Read to extract the authoritative silhouettes from the placeholder `Graphics` polygons rather than trusting the brief alone. Confirmed: top face is the diamond `(0,-16) (32,0) (0,16) (-32,0)` in cell-local coordinates; the **south** riser polygon is `(-32,0) (0,16) (0,32) (-32,16)`, which normalises to exactly the requested 32x32 `(0,0) (32,16) (32,32) (0,16)`; the **east** riser is its horizontal mirror; and risers stack at `step * HEIGHT_STEP` = 16px. The art was authored to the south orientation, so the file is correct as drawn and correct when the renderer mirrors it for the east face. |
| `docs/heightmap-grid-24x24.md`                 | The data the scene is built from; confirmed the value range in use spans both negative (at/below water) and strongly positive cells, i.e. tall multi-riser columns genuinely occur and the riser must look acceptable stacked many times, not just once. |

## 4. Stylistic research

Both references informed style only, from general recollection of their visual conventions. **No artwork from
either game was traced, copied, sampled, or closely reproduced**, and no reference image was opened or
consulted while drawing. Every shape and every colour value in these three files was authored from scratch —
in fact generated from explicit per-scanline rules in a script — so the resemblance is a family resemblance of
era, scale, and genre and nothing more specific.

| Reference                        | What was taken as inspiration                        | What was deliberately NOT copied          |
| ---------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Final Fantasy Tactics (GBA)        | The core structural idiom this deliverable exists to serve: terrain as **stacked solid columns** with a flat diamond top face and plain vertical cliff faces, so a height difference is a physical step the player can count rather than a shading cue; the 2:1 isometric diamond footprint and its characteristic 2px-per-scanline staircase; keeping top faces visually calm and low-contrast so unit sprites and selection highlights stay the busiest thing on screen; and a subtle darker rim at each tile edge so the grid stays countable without a hard black outline. | Its actual tile artwork, textures, and terrain motifs; its specific palettes and colour values; its water, cliff, and grass treatments; its map layouts, named locations, unit and job sprites, UI, and fonts. |
| Breath of Fire III (SNES)          | The shading economy for small flat elements: a shallow stepped ramp per material (here three bands plus a rim) instead of gradients, letting one well-chosen mid-tone carry the surface; scattering a few 1-3px specks of a lighter and a darker tone to break up a large flat fill without adding colours; and rendering water as a flat body with short discrete horizontal ripple dashes rather than any gradient or transparency. | Its overworld and battle backgrounds, its tilesets and terrain art, its specific palettes and ramps, its character/monster art, and any identifiable location or iconography. |

## 5. Design decisions

| Decision                         | Value                                     | Rationale                                   |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Pixel dimensions                   | `tile-grass-top.svg` and `tile-water-top.svg`: **64x32**. `tile-riser.svg`: **32x32**, with its art occupying a 16px-tall sheared band per column. All multiples of 4. | **Not a free choice** — dictated by the already-written renderer (`TILE_WIDTH = 64`, `TILE_HEIGHT = 32`, `HEIGHT_STEP = 16`) and by the placeholder polygons the art must replace one-for-one. Any other size would break column assembly. 64x32 is also the canonical 2:1 isometric footprint, which keeps the diamond's staircase clean at exactly 2px per scanline. |
| Authoring scale                     | **1x — authored at native pixel size**, unlike `src/assets/ui/`, which authors at 1x and upscales 4x via `viewBox`. | The UI assets are DOM images at a fixed layout size, so a chunky 4x "pixel" was a free stylistic choice. These are Pixi textures sampled on a canvas the player can pan, and the renderer positions them in these exact pixel units; authoring at native size means one SVG unit = one screen pixel = one art pixel, with no scaling step that could soften edges or misalign a column by a fraction of a pixel. Recorded here because it is an intentional divergence from the one existing convention in the repo. |
| Isometric projection details        | 2:1 diamond top face (64 wide x 32 tall), staircased 2px horizontally per scanline so each row widens by exactly 4px (4, 8, 12 … 64 … 12, 8, 4). Riser: a 16px-tall band sheared along the same 2:1 slope, so each column of the sprite starts at `y = floor(x / 2)` and is exactly 16px tall. | The 2px/1px staircase is what makes a 2:1 iso edge read as deliberate pixel art instead of an aliased vector diagonal, and it makes the riser's top edge land exactly on the top face's lower edge. The exact 16px column height is the property that makes N stacked risers tile with no gap and no overlap at a 16px pitch — this was verified programmatically for all 32 columns, not assumed. |
| Light direction                     | **Head-on and from directly above** — all shading is a vertical ramp; there is deliberately **no left/right light bias** on any of the three tiles. | This is the constraint that makes a single riser file serve both cliff faces. The renderer mirrors the sprite horizontally for the east face, so any left-lit/right-shadowed treatment (the more obvious choice for a cliff) would flip with it and make the two faces of one column contradict each other. Top faces adopt the same convention for consistency. Consequence: a column's south and east faces are the same brightness, losing some three-dimensional punch — an accepted trade for one asset instead of two (noted in section 8). |
| Color palette                       | **23 colours total**, in three per-material ramps with no sharing between them. **Grass (7):** `#5d9243` light band, `#4e7f38` base band, `#426c2f` dark band, `#38602a` edge rim, `#6fa84f` and `#89c266` tufts, `#3d6a2d` clump. **Water (6):** `#3a79b0`, `#2f6ba1`, `#27588a` bands, `#1f4a75` rim, `#58a0cf` ripple, `#8fcbe8` sparkle. **Riser (10):** `#7d6950` lit top lip, `#6b5840`, `#5a4833` base, `#4e3e2b` strata line, `#503f2c`, `#4a3927`, `#433422`, `#332618` bottom seam, plus `#6f6657` grey rock chip and `#2d2117` crack. | Small and era-appropriate, and sized so each material reads at a glance on a 24x24 grid: mid-saturation green for ground, clearly bluer and darker for water, and a desaturated warm brown-grey for cliffs that cannot be confused with either. Each tile uses a three-band vertical ramp (light/base/dark top-to-bottom) rather than a gradient; because the bands are at fixed scanlines, they line up across neighbouring tiles and read as one continuous surface instead of per-tile vignetting. The palette is **intentionally not** the `src/assets/ui/` dusk palette — that one was tuned for gold-on-deep-blue menu chrome against a night sky and is too dark and too violet for daylit terrain (its own report anticipated exactly this, noting terrain would need to extend rather than reuse it). |
| 1px tile-edge rim                   | Every scanline of both top faces has its first and last pixel darkened to the material's rim colour, producing a thin darker diamond outline. | The GDD makes tile counting a gameplay act (Movement in tiles, abilities with a 2-3 tile radius), so the player must be able to see individual cells on a large expanse of similar green. 1px in the material's own darker tone is the lightest touch that achieves this — a full black outline would make a 24x24 field read as a mesh and fight the unit sprites later. |
| Riser bottom seam                   | The bottom scanline of each riser column is the ramp's darkest tone (`#332618`), with a second, lighter strata line partway up (`#4e3e2b`). | Each riser is exactly one height unit, and Jump/Movement costs are per unit, so stacked risers must be **countable**. The dark bottom seam makes the boundary between two stacked risers explicit; the mid strata line keeps a single tall face from looking like one flat slab. Both are horizontal, hence mirror-safe. |
| Grid layout (if spritesheet/tilemap) | **Not applicable** — three separate single-tile files, no packed sheet, no grid slicing, no nine-slicing. | The plan already specifies `Assets.load('tile-grass-top.svg')` per tile and the file names were fixed by the request. With only three tiles there is no atlas benefit worth the extra indirection, and Pixi batches them regardless once uploaded. |
| Format and rendering                | SVG, transparent outside the silhouette, built **only** from 1px-tall flat-filled `<rect>` runs at integer coordinates, with `shape-rendering="crispEdges"` on the root. No gradients, filters, opacity, transforms, clip paths, embedded raster, or external references. | Emitting the art as explicit per-scanline rect runs (rather than a polygon plus decorative shapes on top) makes the silhouette *exactly* the specified diamond/parallelogram by construction — no renderer-dependent edge anti-aliasing, no detail shape able to leak past an edge, and a trivially verifiable result. `crispEdges` keeps the edges hard if the asset is ever viewed scaled. Avoiding clip paths and transforms also keeps the files safe for any SVG rasterisation path Pixi may take. |
| Water animation                     | Single static frame; the ripple dashes are baked, not animated. | ADR-0003 routes all animation through GSAP, and this feature's scene is explicitly static (the plan leans on that for its frame-rate argument). Animating water is a future request, not a property of the tile. |
| Water used for `height <= 0`        | A single flat water tile with no shoreline/edge variant. | The renderer's rule is purely `height <= 0 ? water : grass`, and a cell at height 0 adjacent to a raised cell still gets ordinary brown risers from the raised neighbour, which reads acceptably as a bank. A proper shoreline transition would require edge-aware tile selection — new renderer logic, out of scope here (noted in section 8). |

### Assumptions made

The request fixed the geometry precisely but left the art itself open. Each of the following was decided
rather than escalated, consistent with this being a low-stakes spike asset:

1. **Daylight, not dusk.** Nothing specifies a time of day for the battlefield. Daylight was chosen because
   the spec calls the setting a forest *clearing* and because a brighter field gives unit sprites (drawn later)
   the most room to contrast against the ground. This knowingly breaks visual continuity with the dusk initial
   screen; the two are different scenes and the transition is a scene switch, so no single image shows both.
2. **Level of detail on top faces.** The tufts/ripples are deliberately sparse (roughly a dozen 1-3px marks per
   tile). Denser texture was tried conceptually and rejected: identical detail repeated across 576 cells turns
   into a visible repeating pattern, and busy ground competes with the units and movement highlights that will
   be layered on top. Reasonable because the PRD deprioritises visual polish and the tile's job is to be
   legible, not interesting.
3. **One riser look for all heights.** No variation by depth (e.g. rockier at the bottom of a tall cliff) and
   no variation between the south and east faces beyond the mirror. Reasonable because the renderer reuses one
   sprite by design and any variation would need new renderer logic to select it.
4. **Rim is per-material, not a shared outline colour.** Each tile's rim is a darker tone of its own ramp
   rather than one global near-black. Reasonable because it keeps a grass/water boundary reading as two
   materials meeting rather than as two outlined stickers.
5. **No `.gitkeep` cleanup.** `src/assets/tilemaps/.gitkeep` was left in place; removing it is a repo-hygiene
   change, not art, and the folder now has real content either way.

## 6. Deliverables produced

| File path                                      | Description                               |
| ------------------------------------------------ | -------------------------------------------- |
| `src/assets/tilemaps/tile-grass-top.svg`          | Top face for any cell above water level (`height > 0`). 64x32, exact 2:1 diamond `(32,0) (64,16) (32,32) (0,16)`, transparent outside it. Three horizontal green bands (light `#5d9243` for rows 0-9, base `#4e7f38` for 10-21, dark `#426c2f` for 22-31), a 1px `#38602a` rim on both ends of every scanline, and 14 scattered 1-3px grass tufts/clumps in `#6fa84f`, `#89c266`, and `#3d6a2d`, all kept clear of the rim. 7 colours. |
| `src/assets/tilemaps/tile-water-top.svg`          | Top face for any cell at or below water level (`height <= 0`). Same 64x32 canvas and identical diamond silhouette as the grass tile, so the two are interchangeable per cell with no geometric difference. Three horizontal blue bands (`#3a79b0`, `#2f6ba1`, `#27588a`), a 1px `#1f4a75` rim, and 11 short horizontal ripple/sparkle dashes (5-14px) in `#58a0cf` and `#8fcbe8`. 6 colours, fully opaque within the silhouette (no alpha — depth is conveyed by colour, not transparency). |
| `src/assets/tilemaps/tile-riser.svg`              | One height unit of cliff face, reused for both visible faces of a column. 32x32 canvas, parallelogram `(0,0) (32,16) (32,32) (0,16)`: each sprite column `x` starts at `y = floor(x / 2)` and is exactly 16px tall, matching `HEIGHT_STEP`. Vertical-only brown-grey ramp — lit top lip `#7d6950`/`#6b5840`, `#5a4833` body, `#4e3e2b` strata line, `#503f2c`/`#4a3927`/`#433422` lower body, `#332618` bottom seam — plus 12 small rock chips (`#6f6657`) and cracks (`#2d2117`). 10 colours. **Mirror-safe by construction:** no left/right light bias and no asymmetric motif, so the horizontally flipped copy the renderer uses for the other face is equally correct. |

**Confirmed for each file:** single self-contained `.svg`; transparent background outside the silhouette; only
flat-filled 1px-tall `<rect>` runs at integer coordinates with `shape-rendering="crispEdges"` (no gradients,
filters, opacity, transforms, clip paths, embedded raster, or external references); all canvas dimensions are
multiples of 4; kebab-case English file names; and all `<title>` elements and comments written in English per
the repository's language policy.

**Verification performed** (these are generated files, so correctness was checked mechanically rather than by
eye alone):

- Every `<rect>` lies inside its declared canvas, and each file has exactly one well-formed `<svg>` root.
- Both top faces: every scanline is a single contiguous run with **zero interior holes**, spans widen/narrow
  by exactly 4px per row, and reach the full 64px width at rows 15 and 16 — i.e. the silhouette is exactly the
  requested diamond.
- Riser: all 32 columns verified to be exactly 16px tall, contiguous, and to start at `y = floor(x / 2)` — the
  property that guarantees gap-free, overlap-free stacking at the renderer's 16px pitch.
- Visual check: a synthetic 7x7 patch spanning heights -1 to +5 was composited using the renderer's own
  placement rules (south riser at the cell origin, horizontally mirrored riser for the east face, top face
  last, painted back-to-front by `row + col`) and inspected as an image. The columns assemble seamlessly, the
  stepped-terrain read is correct, and grass / water / cliff are distinguishable at a glance.
- No application file was modified; the only files added to the repository are the three SVGs and this report.

## 7. How to consume these assets

For whoever wires this in (`game-dev-js`, plan step 6 — "real art swap-in"). **No atlas, no slicing, no
nine-slicing**; each file is one standalone tile.

- **Load:** `Assets.load('…/tile-grass-top.svg')` etc., then `new Sprite(texture)`. Render each at its natural
  size (64x32, 64x32, 32x32) — these are authored at 1:1 with the renderer's own pixel units, so **do not
  scale them**. If the camera ever zooms, use integer factors only.
- **Replacing `createTopFaceTile`:** the placeholder polygon is centred on the cell origin, while a `Sprite`
  anchors at its top-left by default. Either set `anchor.set(0.5)` or offset the sprite by
  `(-TILE_WIDTH / 2, -TILE_HEIGHT / 2)`. The grass/water choice stays exactly as it is today
  (`height <= 0 ? water : grass`).
- **Replacing `createRiserTile`:** the art matches the **south** face as drawn. Place the south riser with its
  top-left at the cell-local point `(-TILE_WIDTH / 2, 0)` — i.e. the diamond's left vertex. For the **east**
  face, use the same texture mirrored horizontally (`scale.x = -1` with `anchor.x = 1`, or equivalently
  `scale.x = -1` plus a `+TILE_WIDTH / 2` x-offset) and place its top-left-equivalent at the cell-local point
  `(0, 0)`. The existing `riser.position.set(0, step * HEIGHT_STEP)` stacking loop needs no change: each
  sprite column is exactly 16px tall, so a 16px pitch tiles perfectly.
- **Draw order is unchanged:** risers first (bottom-most step first), top face last, cells sorted by
  `row + col`. The tiles carry no alpha within their silhouettes, so painter's-algorithm overlap is safe.
- **Nothing is animated.** The water tile is a single static frame by design (ADR-0003). If water motion is
  ever wanted, it should be a GSAP-driven effect or additional frames requested separately — not a change to
  this file.
- **If a column ever needs to extend below the bottom of the map**, stack more risers; the sprite is designed
  to repeat indefinitely, and the dark bottom seam is what keeps each repetition countable.

## 8. Known issues / follow-ups

- **Both cliff faces are equally lit.** The deliberate no-left/right-bias decision (section 5) is what lets one
  file serve both faces, but it costs some three-dimensionality: a column's south and east faces are the same
  brightness, so the corner between them reads less sharply than in a conventionally lit scene. If that turns
  out to matter once units are on the field, the cheap fix is a second file (`tile-riser-east.svg`) that is the
  current art darkened a few percent, consumed in place of the mirror — a colour-swap variant, not new art.
- **No shoreline or water-edge transition.** Grass and water meet with a hard diamond edge, and a height-0
  water cell next to a raised cell simply shows that neighbour's brown risers as its bank. A proper shoreline
  would need edge-aware tile selection in the renderer, so it should be its own request if the hard edge reads
  badly on the real heightmap.
- **Tile detail repeats identically across all 576 cells.** Every grass tile carries the same 14 tufts and
  every water tile the same 11 ripples, which can become a visible repeating pattern on a large open expanse —
  most noticeable on the water. The standard fix is 2-3 variants per material picked pseudo-randomly per cell;
  deliberately not done here because it would require renderer changes and the PRD deprioritises polish.
- **No rock-formation (impassable obstacle) tile.** The GDD defines one impassable terrain type that blocks
  movement and line of sight. It is not part of this feature's scope and no art exists for it yet; it will need
  its own request, and should probably be a raised object sitting on a grass top face rather than a new top
  face, so it can be dropped onto any cell.
- **No treeline/forest-border tile**, per spec question 9 — the clearing's "forest" is currently narrative
  only. A future US adds it.
- **No selection/highlight overlay tiles.** FR-003 requires highlighting reachable movement tiles. Whether that
  is a tinted copy of the top face, a separate translucent overlay diamond, or a Pixi tint on the existing
  sprite is a rendering decision for that feature; the tiles here are plain and will accept a tint cleanly
  (uniform flat fills, no baked highlights).
- **Not yet verified in the running app.** The assets were validated by geometric checks and by an offline
  composite image built from the renderer's own placement rules, but `npm run dev` was not run and no browser
  screenshot was taken, per the "no application code" constraint. The swap-in step should confirm the sprite
  anchoring/offset notes in section 7 and look at the real 24x24 heightmap, particularly the steep `+5` and
  `-3` regions where many risers stack.
- **Palette still lives literally inside each file.** As the initial-screen report already flagged, the project
  now has two unrelated palettes (UI dusk chrome, daylit terrain) with no shared reference. Worth extracting a
  documented project palette before unit sprites are drawn, so units are chosen to contrast against *these*
  greens and blues rather than drifting.

## 9. Token usage and estimated cost

| Metric                   | Value              |
| --------------------------- | --------------------- |
| Model(s) used               | Claude Opus 5 (single model; this ran as one `graphic-designer` subagent invocation, with no further delegation) |
| Input tokens (approx.)      | ~95,000 (cumulative across turns, including conversation context re-sent on each turn) |
| Output tokens (approx.)     | ~13,000              |
| Estimated cost (USD)        | ~US$ 2.40            |
| Estimated cost (BRL)        | ~R$ 13.00            |
| Cost basis                  | Published Opus-tier rates, from recollection, not verified this session |

- **All figures are approximations, not measured values.** This environment exposes no per-session token or
  cost accounting to the agent, so nothing here was read from tooling.
- **How the approximation was derived.** Input: the skill body and report template, the previous design report
  (~226 lines, read in full to match conventions), `useBattlefieldRenderer.ts`, and targeted `grep` output from
  the PRD, GDD, HLD, the `05-combat-scene` spec and plan — roughly 20-25k tokens of unique content, re-sent as
  context across ~10 turns, which is what makes the cumulative figure several times the unique total. One
  rendered preview image was also read back, which carries a non-trivial token cost (~1.5k). Output: the
  generator and verification scripts (~4k), plus this report (~7k), plus tool-call overhead. Treat both figures
  as order-of-magnitude correct, plausibly off by ±30%. Note the three SVGs themselves were **generated by a
  script rather than typed token by token**, which saved an estimated 8-10k output tokens versus authoring
  ~1,800 `<rect>` elements directly.
- **Pricing basis.** Estimated at roughly US$ 15 per million input tokens and US$ 75 per million output tokens,
  giving ~US$ 1.43 input + ~US$ 0.98 output ≈ US$ 2.40, with an assumed ~R$ 5.40/US$ 1.00 exchange rate.
  Neither the rate card nor the exchange rate was verified during this session, so the currency figures are
  indicative only. If this session ran under a subscription plan rather than metered API billing, the real
  marginal cost is zero and these figures represent equivalent API value.
