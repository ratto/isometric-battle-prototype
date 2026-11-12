# Dev Report: Combat Scene

**Slug:** `05-combat-scene`
**Plan:** [plan-05-combat-scene.md](../plan-05-combat-scene.md)
**Branch:** `feature/05-combat-scene`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

Implemented the combat scene: a new `CombatScene.vue`, reached from the existing "Configure Match"
placeholder via a new "Start Battle" button, that mounts a Pixi `Application` and renders a static 24x24
isometric tilemap derived from `docs/heightmap-grid-24x24.md`. Elevation renders as FFT-Tactics-style
stacked columns (a grass/water top-face tile plus one reusable riser tile per height unit of drop,
mirrored for the south vs. east cliff faces), using real pixel-art SVG tiles produced by a
`graphic-designer` subagent. The player pans the camera by holding the right mouse button or a touch and
dragging, clamped to the map's bounds, and a Back button returns to the main menu. No units, turn logic,
or Daemon System combat math were touched — this is rendering/navigation infrastructure only, exactly as
scoped.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-05-combat-scene.md` | Full technical design: affected files, composable responsibilities, the composite stacked-column rendering approach, the 64x32/16px-step geometry, and the step-by-step implementation sequencing this report follows. |
| `docs/HLD-isometric-battle-prototype.json` | Confirms the "Pixi Renderer (`usePixiApp` composable)" component name/responsibility; this feature is its first concrete implementation. No deviation needed. |
| Relevant ADRs | ADR-0001 (PixiJS) named `usePixiApp` and confirmed isometric projection/camera must be hand-rolled — followed exactly. ADR-0005 (`src/model` vs `src/utils`) directly placed the heightmap grid (`src/model/battlefieldGrid.ts`) vs. the projection math (`src/utils/isometricProjection.ts`). |
| `spec-05-combat-scene.md` | Original business intent: Start Battle button, FFT-style stacked elevation, right-mouse/touch drag panning clamped to bounds, no zoom, Back control, new art via `graphic-designer`. All satisfied. |
| Existing codebase | Extended `src/stores/scene.ts`'s already-present (unused) `'battle'` `AppScene` value; extended `App.vue`'s scene-switch mapping; extended `ConfigureMatchPanel.vue` and `InicialMenuScene.vue` for the new navigation path. Reused `PixelButton.vue` as-is. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/05-combat-scene` (already existed, matching the slug) |
| Branch used for this task | `feature/05-combat-scene` (reused, confirmed by human) |
| Trello card | https://trello.com/c/Ni4Vo8Wk/5-05-combat-scene |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `model/battlefieldGrid.ts` | `BattlefieldGrid` entity wrapping the 24x24 height matrix transcribed from `docs/heightmap-grid-24x24.md` (verified range: -3..+5, 9 levels), with `getHeightAt`/`isInBounds`/`rows`/`cols`. |
| `utils/isometricProjection.ts` | Pure `gridToScreen(row, col, height)` projection and the tile footprint constants (`TILE_WIDTH=64`, `TILE_HEIGHT=32`, `HEIGHT_STEP=16`). |
| `composables/usePixiApp.ts` | Generic Pixi `Application` lifecycle composable: inits on mount, fully destroys (canvas, children, textures) on unmount. |
| `composables/useBattlefieldRenderer.ts` | Loads the three tile textures and builds the tilemap: one `Container` per cell (stacked riser sprites + a top-face sprite), added to a `sortableChildren` world `Container` ordered by `row + col`. |
| `composables/useBattlefieldCamera.ts` | Right-mouse-drag / touch-drag panning with multi-touch guarding, left-click exclusion, `contextmenu` suppression, window-blur drag reset, and bounds clamping computed from the world's rendered bounds vs. the canvas size. |
| `scenes/CombatScene.vue` | Wires the three composables together, renders the canvas host and the Back button overlay. |
| `src/assets/tilemaps/tile-grass-top.svg`, `tile-water-top.svg`, `tile-riser.svg` | Real forest-clearing tile art (via `graphic-designer` subagent), replacing the initial placeholder `Graphics` shapes. |
| `docs/design/reports/design-forest-clearing-tileset-1-20261112.md` | Design report for the tileset. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `components/initial-menu/ConfigureMatchPanel.vue` | Added an enabled "Start Battle" `PixelButton` emitting `startBattle`. |
| `scenes/InicialMenuScene.vue` | Listens for `@start-battle` and calls `useSceneStore().setActiveScene('battle')`. |
| `App.vue` | `activeSceneComponent` now maps `'battle'` to `CombatScene` (removed the now-obsolete `null` fallback). |

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `cc35811` | Add battlefield heightmap grid model and isometric projection utils |
| `76a628a` | Add spec, plan, and heightmap reference for the combat scene feature |
| `f6a0e71` | Render the battlefield tilemap and wire camera panning |
| `141bcb0` | Swap placeholder tiles for real forest-clearing art |

## 5. Deviations from the plan

- **Sequencing steps 3 and 5 merged.** The plan's incremental sequencing called for a flat placeholder
  tilemap (step 3) and elevation (step 5) as separate, separately-verified passes. These were implemented
  together in one pass (placeholder `Graphics` with full riser stacking from the start), since both were
  being hand-verified via the same manual testing loop in this session; panning (step 4) was still
  verified against that combined placeholder version before the real-art swap (step 6), preserving the
  plan's intent of debugging geometry/clamping before layering in art.
- **Added an explicit `instance.render()` call after building the tilemap, after centering the camera,
  and on every pan update**, which the plan did not call for. During manual verification, building the
  576-cell tilemap after the async `Assets.load` texture fetch (and, separately, repositioning the world
  container to center it) could leave a stale pre-build/pre-center frame on screen until the Pixi ticker's
  next render happened to pick up the change — observed consistently across multiple fresh reloads, not
  just once. Forcing a render at each of these three points (tilemap build, camera centering, each pan
  move) removes the dependency on ticker timing entirely; for a static, non-animated scene the extra
  render calls are cheap. This is a defensive correctness fix, not a workaround for a test-only artifact:
  the stale-frame symptom was reproduced with real rendered content (not a tooling quirk), independent of
  whatever tool was used to observe it.
- Everything else matches the plan's architecture, file placement, and composable responsibilities
  exactly.

## 6. External dependencies / Context7 lookups

No new Context7 lookups were needed during implementation itself — the plan already captured the
relevant PixiJS v8 API usage (confirmed via Context7 during planning): `Assets.load` for SVG textures,
`Container({ sortableChildren: true })` + per-child `zIndex` for depth sorting, the pointer/touch event
model (`pointerdown`/`globalpointermove`/`pointerup`/`pointerupoutside`, native `button`/`pointerType`),
`contextmenu` suppression, and `Application.destroy()` teardown options. All were used exactly as
documented, with no surprises.

## 7. Manual verification performed

All steps run via `npm run dev` in a Chrome tab, driven through the `claude-in-chrome` browser tools
(screenshots plus synthetic pointer events for precise drag-delta/button/pointerType control).

| # | Step taken | Expected result | Actual result |
| - | --- | --- | --- |
| 1 | Navigate Start -> Configure Match | "Start Battle" button visible and enabled | As expected |
| 2 | Click "Start Battle" | Combat scene replaces the menu, Pixi canvas visible | As expected |
| 3 | Visually compare the rendered tilemap against `docs/heightmap-grid-24x24.md` | 24x24 diamond grid shape matches, elevation (stacked risers) visible | As expected; the diagonal water valley and raised areas match the heightmap's layout |
| 4 | Hold right mouse button and drag in all four directions (synthetic `button:2` pointer events) | Camera pans smoothly, stops at map edges with no void beyond them | As expected, confirmed both via screenshots and direct inspection of `world.position` against computed `bounds` |
| 5 | Left-click and drag (synthetic `button:0` pointer events) | No camera movement | Confirmed: position unchanged before/after |
| 6 | Touch-drag (synthetic `pointerType:'touch'` events), including a second touch mid-drag | Pans like right-mouse-drag; second touch does not hijack the active drag | Confirmed: first touch's drag continued tracking correctly, second touch's events were ignored |
| 7 | Drag toward each of the four map edges until clamped | No empty void beyond the map on any side | Confirmed visually at both X-axis extremes (Y-axis clamp range is only 16px given this map's aspect ratio vs. the 1280x720 canvas, which is expected, not a bug) |
| 8 | Click "Back", repeat Start Battle -> Back 2-3 times | Main menu reappears each time (title pulsing, Options/Exit still disabled); cycle is stable | Confirmed, no visual glitches |
| 9 | Check browser console throughout | No errors/warnings | Confirmed: only Vite's own connection logs were present, no app errors at any point |
| 10 | After the real-art swap, re-verify tile seams/mirroring at a zoomed-in crop | Risers and top faces tile with no gaps; east/south mirrored faces look correct | Confirmed via zoomed screenshot of a representative patch |

## 8. Known issues / follow-ups

- **A dedicated ADR for the composite stacked-column tile-rendering approach is still needed**, per the
  plan's own open item — to be produced via the `architecture` skill, not by this implementation task.
- Per the design report's own follow-ups: both cliff faces are equally lit (an accepted trade-off for
  reusing one mirrored sprite), there is no shoreline/water-edge transition tile, tile detail repeats
  identically across all 576 cells, and there is no rock-formation/obstacle or selection-highlight art yet
  — all explicitly out of scope for this feature and listed as candidates for future work.
- The Y-axis camera clamp range is small (16px) given this specific map's proportions relative to the
  1280x720 canvas; this is expected geometry, not a defect, but worth knowing if a future map has a
  different aspect ratio.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No (pending PR) |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 (main implementation); Claude Opus 5 (delegated `graphic-designer` subagent for the tileset, reported separately in its own design report) |
| Input tokens (approx.) | Not tracked by tooling available in this session |
| Output tokens (approx.) | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this implementation session. The delegated `graphic-designer` subagent's own report
  estimates its portion at ~US$2.40 (see `design-forest-clearing-tileset-1-20261112.md` §9).
