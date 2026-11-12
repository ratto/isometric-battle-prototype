# ADR-0006: Render isometric terrain elevation as composite stacked columns

**Status:** Accepted
**Date:** 2026-11-12
**Deciders:** Pedro "Ratto" Paixão

## Context

The combat scene (`05-combat-scene`) needed to render the 24x24 isometric battlefield's elevation —
taken from `docs/heightmap-grid-24x24.md`, ranging from -3 to +5 — in the stepped, physically-stacked
style of Final Fantasy Tactics, per CLAUDE.md's stylistic reference and the feature's spec. The spec's
own risk log flagged that doing this with a unique tile sprite per height level, and per transition
between adjacent differing heights, could require an unmanageably large tileset (9 height levels plus
every possible adjacent-height transition) for a time-boxed spike. A rendering approach was needed that
produces the correct stepped-terrain look from a small, fixed set of art assets, hand-rolled on top of
PixiJS per ADR-0001 (isometric projection and depth-sorting are not provided by the renderer itself).

## Decision

Render each grid cell as a composite "column": one top-face sprite (grass or water, depending on whether
the cell's height is above or at/below water level) sitting on top of zero or more stacked "riser"
sprites, one per unit of height drop toward the cell's south and/or east neighbor (the two faces visible
in this isometric orientation). A single riser texture is authored for the south-facing edge and reused,
horizontally mirrored, for the east-facing edge, so only three total sprites (`tile-grass-top.svg`,
`tile-water-top.svg`, `tile-riser.svg`) cover the entire elevation range and every possible
height-difference transition between neighbors.

Each cell is its own `Container` holding its riser sprites (added first) and its top-face sprite (added
last), with `zIndex = row + col` on a single `sortableChildren` world `Container`, giving a standard
back-to-front isometric painter's-algorithm paint order across the whole 24x24 grid.

## Options Considered

### Option A: Composite stacked columns, one mirrored riser sprite (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low-medium — riser count per cell is a simple `max(0, height - neighborHeight)` derived from the grid data already in hand; mirroring one texture for the second face is a one-line `scale.x = -1` |
| Cost | Three static SVG assets total, regardless of map size or height range |
| Scalability | Scales to any height range or map size with no new art; a future map with a wider range of heights needs zero additional assets |
| Team familiarity | Standard technique in FFT-style/isometric engines (stacked block terrain); new to this codebase, but now has a reference implementation (`useBattlefieldRenderer.ts`) |

**Pros:** Fixed, small art budget independent of the heightmap's range or the number of distinct
adjacent-height transitions; naturally produces exact, gap-free stacking between any two neighboring
cells (riser height matches the projection's `HEIGHT_STEP` by construction); keeps the "how tall is this
cliff" question entirely in code (grid data), not in art asset selection logic.
**Cons:** Both faces of a column (south- and east-facing) end up equally lit, since the same texture
mirrored cannot carry an asymmetric light/shadow treatment — a deliberate trade recorded in the tileset's
own design report (`docs/design/reports/design-forest-clearing-tileset-1-20261112.md`), fixable later
with a second, darkened variant if needed without touching the rendering approach itself.

### Option B: One unique top-face sprite per height level, no separate riser sprites

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low per-cell code (one sprite per cell, no column/riser logic) |
| Cost | At least one sprite per height level (9, for this map's -3..+5 range), plus some way to represent every adjacent-height transition if a stepped look is still wanted at edges |
| Scalability | Art cost grows with the height range; a future map with a larger range needs proportionally more art |
| Team familiarity | Simpler mental model, but does not by itself produce FFT's physically-stepped cliff faces between differing heights — only a flat color/height cue, which the spec explicitly rejected in favor of physical elevation |

**Pros:** Simplest possible per-cell rendering code; no column/riser math at all.
**Cons:** Cannot express the required stepped-terrain look between two adjacent cells of different
height without still needing transition art of some kind; directly re-creates the large-tileset risk the
spec flagged, since every distinct height level needs its own sprite and nothing handles the seam between
levels.

### Option C: Procedurally drawn `Graphics` shapes at runtime, no sprite art

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — this is exactly the placeholder used early in `05-combat-scene` before real art existed |
| Cost | No art asset cost, but no real pixel-art look either |
| Scalability | Scales trivially to any height range (just draws more polygons), but visual quality is capped at flat-colored shapes |
| Team familiarity | Quick to stand up for prototyping; not a substitute for the pixel-art aesthetic CLAUDE.md and the `graphic-designer` skill establish for this project |

**Pros:** Fastest possible path to a working, height-accurate prototype (used for exactly this purpose
during `05-combat-scene`'s implementation, before the real tileset was ready).
**Cons:** Flat-colored polygons do not meet the project's pixel-art visual direction; CLAUDE.md requires
graphic assets to be delegated to the `graphic-designer` skill, not hand-drawn as permanent production
art.

## Trade-off Analysis

The decisive factor is art-budget scaling: Option B's cost grows with the number of height levels and
transitions, which is exactly the risk this feature's spec already flagged as likely to blow the spike's
art budget; Option A's cost is fixed at three sprites regardless of the heightmap's range, because the
riser/column technique encodes "how different are these two neighbors' heights" as a repeat count in
code rather than as a distinct asset. Option C is rejected only as a *permanent* approach — it remains the
right tool for early, art-less verification of the projection math and camera, which is in fact how
`05-combat-scene` sequenced its own implementation (placeholder `Graphics` columns first, real sprites
swapped in once the tileset was ready), but production rendering must use real art per CLAUDE.md. The
accepted cost of Option A — both cliff faces sharing one lighting treatment — is minor and reversible
(a second riser asset, not a rendering rewrite) compared to the asset-scaling problem it avoids.

## Consequences

- Adding units, obstacles (e.g. the GDD's rock formation), or any other object that sits "on" a tile can
  reuse the same column's top-face position as an anchor point, without needing to know how many risers
  that column has.
- A future map with a different height range, or a redesigned heightmap for this same map, needs no new
  tile art — only the data in `src/model/battlefieldGrid.ts` changes.
- The two cliff faces (south/east) will continue to read as equally lit until/unless a second, darkened
  riser variant is introduced; this is tracked as a known, low-priority follow-up in the tileset's design
  report, not a defect in this decision.
- Any future terrain feature that needs a *different* per-height treatment (e.g., snow caps above a
  certain height, or a distinct cliff material) can be layered onto this same column structure by
  selecting a different top-face or riser texture per cell, without changing the stacking/zIndex scheme.

## Action Items

1. [x] Implement the composite stacked-column renderer (`src/composables/useBattlefieldRenderer.ts`),
   feature `05-combat-scene`.
2. [x] Produce the three-asset tileset (`graphic-designer` subagent), with the riser authored for
   mirror-safety (no left/right light bias), per
   `docs/design/reports/design-forest-clearing-tileset-1-20261112.md`.
3. [ ] If a future feature finds the equally-lit cliff faces visually insufficient, add a second,
   darkened riser variant for one of the two faces — a new asset, not a change to this ADR's approach.
