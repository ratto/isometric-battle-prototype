# Technical Plan: Combat Scene

**Slug:** `05-combat-scene`
**Spec:** [spec-05-combat-scene.md](spec-05-combat-scene.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

This plan implements the battlefield foundation: a new `CombatScene.vue`, reached from the existing
"Configure Match" placeholder via a new "Start Battle" button, that mounts a Pixi `Application` and
renders a static 24x24 isometric tilemap derived from `docs/heightmap-grid-24x24.md`. Elevation is
rendered as FFT-Tactics-style stacked columns (a top-face sprite plus one reusable riser sprite per
height unit of drop to a lower neighbor), not a unique sprite per height level, which keeps the new art
set small. The player can pan the camera by holding the right mouse button or a touch and dragging,
clamped to the map's bounds, and a Back button returns to the main menu. No units, turn logic, or
Daemon System combat math are touched — this is rendering/navigation infrastructure only.

## 2. Source documents reviewed

| Document | Key takeaways for this plan |
| --- | --- |
| `spec-05-combat-scene.md` | Full functional/non-functional scope: Start Battle button, 24x24 isometric tilemap from the heightmap doc, FFT-style stacked elevation, right-mouse/touch drag panning clamped to bounds, no zoom, Back control, new art via `graphic-designer`. |
| Trello card (`05-combat-scene`) | No additional context beyond the spec; checklist mirrors the spec's Definition of Done. |
| `docs/GDD-isometric-battle-prototype.md` | §Grid: 24x24 isometric grid, height affects movement cost (not relevant yet, no units). §Camera: camera pans manually and follows the active turn (turn-follow is out of scope here, no turns exist); fixed zoom, pan only — confirms no zoom is correct for the whole project, not just this US. §Terrain: a "rock formation" obstacle type exists in the GDD but is not part of this US's empty-map scope. |
| `docs/HLD-isometric-battle-prototype.json` | Confirms the "Pixi Renderer (`usePixiApp` composable)" component name/responsibility and the state/logic separation; this feature is the first concrete implementation of that component, with no battle state involved yet. |
| Existing ADRs | ADR-0001 (PixiJS, names the `usePixiApp` composable, confirms isometric projection/camera must be hand-rolled). ADR-0002 (`pathfinding` package) — not used in this feature, no units/movement yet. ADR-0003 (GSAP for all animation) — no animation is strictly required for a static map + raw drag-follow camera, but any added easing must use GSAP. ADR-0005 (`src/model/` vs `src/utils/` split) — directly informs where the heightmap grid data and the projection math go (see §4). |
| Current codebase | `src/stores/scene.ts` already defines `AppScene = 'initial-menu' \| 'battle'` with the `'battle'` value unused; `src/App.vue` only maps `'initial-menu'`. `src/scenes/InicialMenuScene.vue` owns local `main`/`configure-match` inner-menu state; `ConfigureMatchPanel.vue` only has a `Back` button today. `src/components/initial-menu/PixelButton.vue` exists and is reused by both inner menus. No Pixi `Application`, no `src/composables/*`, and no `src/model/*` battlefield-related files exist yet — this feature is greenfield for all of them. |

## 3. Architecture fit

This feature is the first real instance of the HLD's "Pixi Renderer (`usePixiApp` composable)"
component, and introduces no Battle Store (Pinia) changes — the HLD's "Battle Store" component stays
empty of battlefield-grid state, because the grid is **static reference data**, not dynamic battle
state. Per CLAUDE.md's state/logic separation, this plan treats the heightmap grid as read-only data
(a `src/model/` entity, not a Pinia store) and all rendering/camera behavior as composable-owned logic,
with no store mutation needed beyond the existing top-level scene switch.

This does **not** deviate from the layered architecture; it simply exercises, for the first time, the
"Pixi owns its own render loop, Pinia stays the only source of truth for things that change" split from
CLAUDE.md and ADR-0001 — here, "things that change" is reduced to just the top-level active scene, since
camera position and the grid itself don't change during this US.

## 4. Affected surface

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `scenes/CombatScene.vue` | Mounts the battlefield via `usePixiApp` + `useBattlefieldRenderer`, wires `useBattlefieldCamera` to the canvas, renders the DOM/Tailwind "Back" button overlay. |
| `composables/usePixiApp.ts` | Generic composable owning a Pixi `Application`'s `init()`/`destroy()` lifecycle, tied to a host component's `onMounted`/`onUnmounted`. Named per ADR-0001 so later scenes/features reuse it instead of re-inventing Pixi lifecycle management. |
| `composables/useBattlefieldRenderer.ts` | Builds the static tilemap scene graph from a `BattlefieldGrid`: one `Container` per cell (stacked risers + top-face sprite), added to a single "world" `Container` with `sortableChildren` for back-to-front depth order. |
| `composables/useBattlefieldCamera.ts` | Owns the world container's pan offset; wires pointer/touch drag input on the canvas and clamps the offset to the rendered map's bounds. |
| `model/battlefieldGrid.ts` | `BattlefieldGrid` entity: wraps the 24x24 height matrix transcribed from `docs/heightmap-grid-24x24.md`, exposes `getHeightAt(row, col)`, `rows`, `cols`. Per ADR-0005, this is a typed thing with behavior, not a pure formula. |
| `utils/isometricProjection.ts` | Pure functions: `gridToScreen(row, col, height)` → `{ x, y }`, plus the tile footprint constants (`TILE_WIDTH = 64`, `TILE_HEIGHT = 32`, `HEIGHT_STEP = 16`). No instance state, per ADR-0005 → belongs in `utils/`. |
| `assets/tilemaps/tile-grass-top.svg`, `assets/tilemaps/tile-water-top.svg`, `assets/tilemaps/tile-riser.svg` | New forest-clearing tile art (top-face grass, top-face water for height 0, one reusable riser/cliff-side sprite), produced by a `graphic-designer` subagent per CLAUDE.md. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `components/initial-menu/ConfigureMatchPanel.vue` | Add an enabled `PixelButton` labeled "Start Battle" below the existing "Back" button (or above it — final ordering is a small UI call during implementation), emitting a new `start-battle` event. |
| `scenes/InicialMenuScene.vue` | Listen for `@start-battle` on `ConfigureMatchPanel` and call `useSceneStore().setActiveScene('battle')` — this leaves `InicialMenuScene`'s own local `main`/`configure-match` state untouched; the top-level scene switch away from the menu is a separate concern already owned by the Pinia store. |
| `App.vue` | Extend `activeSceneComponent`'s computed mapping so `sceneStore.activeScene === 'battle'` renders the new `CombatScene`, alongside the existing `'initial-menu'` mapping. The current `null` fallback and its explanatory comment are removed since both scene values are now handled. |

### Out of scope for this plan

- `src/stores/scene.ts` itself — the `AppScene` type and `setActiveScene` action already support `'battle'`; no change needed there.
- Any Pinia "Battle Store" for unit/turn state — intentionally not introduced yet, per the spec's scope.
- `MainMenuPanel.vue` and the pulsing title — untouched by this feature.

## 5. State design (Pinia)

Not applicable. `src/stores/scene.ts`'s existing `AppScene = 'initial-menu' | 'battle'` already covers
this feature's only state need (which top-level scene is active); no fields are added or changed. Camera
pan offset and the static grid data are intentionally kept out of Pinia, per the spec's non-functional
requirements (composable-local state, since they have no value outside the running `CombatScene`).

## 6. Logic design (composables)

| Composable | Responsibility | Inputs → Output | Store actions it calls |
| --- | --- | --- | --- |
| `usePixiApp` | Creates and tears down a Pixi `Application` bound to a host element ref; exposes the live `Application` instance once initialized. | `(canvasHost: Ref<HTMLElement \| null>, options: { width: number; height: number })` → `{ app: Ref<Application \| null> }` | None. |
| `useBattlefieldRenderer` | Builds the tilemap scene graph once the `Application` and `BattlefieldGrid` are ready; adds the resulting world `Container` to `app.stage`. Computes each cell's screen position via `isometricProjection.gridToScreen` and its riser count via adjacent-cell height deltas. | `(app: Ref<Application \| null>, grid: BattlefieldGrid)` → `{ worldContainer: Ref<Container \| null> }` | None. |
| `useBattlefieldCamera` | Reads pointer/touch events on the canvas to compute a drag delta, applies it to the world container's position, and clamps the result to the map's rendered bounding box (computed from `worldContainer`'s size vs. the canvas size). | `(app: Ref<Application \| null>, worldContainer: Ref<Container \| null>)` → `{ }` (side-effecting: mutates `worldContainer.position` directly; no return value consumed by the caller) | None. |

All three are pure/side-effecting composables with no Pinia dependency, consistent with this feature
having no dynamic battle state to commit.

## 7. Rendering / HUD impact

- **Pixi renderer:** `CombatScene.vue` creates a canvas host `<div>`, calls `usePixiApp` to get the
  `Application`, then `useBattlefieldRenderer` to populate it from a module-level `BattlefieldGrid`
  instance (constructed once from the hardcoded heightmap data), then `useBattlefieldCamera` to wire
  panning. Each grid cell renders as its own `Container` (so riser sprites and the top-face sprite share
  one transform), with `zIndex = row + col` set on the world container's children for a stable
  back-to-front paint order (`sortableChildren: true` on the world container); within a single cell's
  container, sprites are added bottom riser first, top-face sprite last, so Pixi's default add-order
  front-to-back handles the intra-column stacking without needing per-sprite `zIndex`.
- **HUD:** a single Tailwind-styled "Back" button, absolutely positioned over the canvas (e.g. top-left
  corner), calling `useSceneStore().setActiveScene('initial-menu')` directly on click — no new HUD
  composable needed for one button.
- **GSAP:** not required for this feature's static scene and raw drag-follow camera; if any pan easing
  (e.g. a soft "catch-up" instead of 1:1 drag-follow) is added later, it must go through GSAP per
  CLAUDE.md, not a custom ticker tween.

## 8. Data layer impact

Not applicable. The heightmap is small, fixed, and campaign-specific to this single prototype map — it
is transcribed directly into `src/model/battlefieldGrid.ts` as a TypeScript constant, not stored in or
queried from the SQLite/WASM static data layer (which is reserved for Items/Weapons/Upgrades/Spells per
the HLD).

## 9. External dependencies

No new npm packages. New usage of the existing `pixi.js` (^8.22.0) dependency, confirmed via Context7
(`/pixijs/pixijs/v8.22.0`) against this exact installed version:

- **SVG tile loading:** `Assets.load('tile-grass-top.svg')` returns a texture usable directly in
  `new Sprite(texture)`; an optional `resolution` can be passed in the load call for crisper scaling of
  pixel-art SVGs if the default rasterization looks soft at this tile size.
- **Depth sorting:** `new Container({ sortableChildren: true })` plus per-child `zIndex` re-sorts before
  render; confirmed this is the supported v8 pattern for painter's-algorithm depth ordering.
- **Pointer/touch drag:** confirmed event model — `pointerdown`/`globalpointermove`/`pointerup`/
  `pointerupoutside` are the cross-device event set; the native `button` field (0/1/2) and `pointerType`
  (`'mouse'` / `'touch'`) on the event distinguish "right mouse button" from "touch" from "left click" (a
  left-click must be excluded, per the spec). PixiJS does **not** block the browser's native context
  menu on right-click by itself — a `contextmenu` listener calling `event.preventDefault()` on the canvas
  element is required and confirmed as the documented approach.
- **Application teardown:** `app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true })`
  confirmed as the full-cleanup call, needed in `usePixiApp`'s `onUnmounted` to satisfy the spec's
  "no leaked canvases/listeners across repeated Start Battle -> Back cycles" requirement.

## 10. Implementation sequencing

1. **Data and math first, no Pixi yet:** write `model/battlefieldGrid.ts` (transcribe the heightmap) and
   `utils/isometricProjection.ts` (`gridToScreen` + constants). These are plain TypeScript, verifiable by
   reading the output of a few sample calls (e.g. in a scratch script or the browser console) against
   hand-checked coordinates before anything renders.
2. **Pixi lifecycle:** implement `usePixiApp` and mount it from a minimal `CombatScene.vue` that renders
   just a colored background rectangle, wired into `App.vue`'s scene switch and the new "Start Battle"
   button/handler chain (`ConfigureMatchPanel.vue` → `InicialMenuScene.vue`). Verifies navigation and
   Pixi mount/unmount before any tilemap complexity.
3. **Flat placeholder tilemap:** implement `useBattlefieldRenderer` using flat-colored `Graphics` tiles
   (no riser stacking, no real art yet) at the correct projected grid positions, to validate the 24x24
   grid math and overall map shape against `docs/heightmap-grid-24x24.md` visually (e.g. confirm the
   `+5` peak area and `-3` dip area are in the right relative screen positions even before elevation is
   visible).
4. **Camera pan:** implement `useBattlefieldCamera` against this placeholder tilemap — right-mouse-drag,
   touch-drag, left-click exclusion, and bounds clamping. Easiest to debug panning math without also
   debugging elevation rendering at the same time.
5. **Elevation (composite columns):** extend `useBattlefieldRenderer` to add riser containers per cell
   using `isometricProjection`'s height step, still with placeholder `Graphics` colors (e.g. a visibly
   different shade per riser) before real art exists.
6. **Real art swap-in:** once the `graphic-designer` subagent delivers the grass/water/riser SVG tiles,
   swap the placeholder `Graphics` tiles for `Sprite`s loaded via `Assets.load`, with no other logic
   change.
7. **Back button and full-cycle check:** add the Back button overlay and do a final pass of repeated
   Start Battle → Back cycles, checking the console for leaks/errors.

## 11. Technical risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Riser-stacking math (how many risers per cell, and on which side) gets the FFT "steps down toward the viewer" look wrong if derived from the wrong neighbor | Medium/Medium | Derive each cell's riser count strictly from the height difference to its two "downhill-facing" neighbors (south and east, the sides visible in this isometric orientation) rather than all four neighbors, and visually spot-check against the reference heightmap's `+5` and `-3` regions during step 3/5 of the sequencing above. |
| Large total sprite count (24x24 cells, each with up to ~8 stacked risers in the steepest areas) could threaten the HLD's 30 FPS NFR even for a static scene | Low/Medium | This is a static, non-animated scene (no ticking VFX), so the GPU draw cost is a one-time batch per frame with no CPU recomputation; if profiling during step 5/6 shows a problem, merge riser sprites of the same column into a single taller stretched sprite instead of N stacked ones, per the HLD's existing "cap simultaneous sprites" mitigation. |
| Pointer-based camera clamping math (map bounds vs. canvas size) is easy to get subtly wrong at the edges (off-by-one tile, or clamping against the wrong axis) | Medium/Low | Implement and verify clamping against the flat placeholder tilemap (step 4) before elevation is added, so bounds issues are debugged against simple, predictable geometry. |
| This plan's composite-column tile rendering approach has no prior pattern in this codebase and will likely constrain how future features draw units standing on tiles | Low/Medium | Per the interview, a dedicated ADR for this rendering approach should be written via the `architecture` skill before or during implementation, so the decision (and its consequences for later unit/VFX layering) is recorded rather than left implicit in this plan alone. |

## 12. Manual verification plan

1. Run `npm run dev`, navigate Start → Configure Match, and confirm the new "Start Battle" button is
   present and enabled (covers sequencing step 2).
2. Click "Start Battle"; confirm the menu is replaced by the combat scene and a Pixi canvas is visible
   (step 2).
3. With the placeholder flat tilemap in place (step 3), visually compare the grid's overall shape/extent
   against `docs/heightmap-grid-24x24.md`'s 24x24 layout (no elevation differences expected yet at this
   point).
4. Hold the right mouse button and drag in all four directions; confirm the camera pans and stops
   cleanly at each map edge with no empty void beyond it (step 4). Try a left-click drag and confirm it
   does not pan.
5. If a touch-capable device or the browser's touch-emulation mode is available, repeat step 4 with a
   press-and-drag touch gesture.
6. With elevation added (step 5), visually confirm the `+5` peak area and the `-3` dip area (see the
   spec's reference cells) render visibly higher/lower than their neighbors, FFT-style.
7. After the real art swap (step 6), re-run steps 3-6 to confirm nothing regressed visually or
   interaction-wise with real sprites in place of placeholders.
8. Click "Back"; confirm the initial main menu reappears in its original state (title pulsing,
   Start/Options/Exit visible). Repeat the Start Battle → Back cycle 2-3 times, watching the browser
   console for errors or warnings each time (step 7).

## 13. Open technical questions

- ~~A dedicated ADR for the composite stacked-column tile-rendering approach is needed~~ — done:
  [ADR-0006](../../adr/0006-composite-stacked-columns-for-terrain-elevation.md).
- Exact riser/top-face tile color palette and the precise "Start Battle" button placement within
  `ConfigureMatchPanel.vue` (above or below "Back") are small visual judgment calls left to the
  `graphic-designer` subagent and implementation time respectively; neither affects this plan's
  architecture.

## 14. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | Should the plan commit to a composite stacked-column tile approach (top-face + reusable riser sprites) instead of a unique sprite per height level/transition? | Yes — composite stacked column, to resolve the spec's flagged tileset-size risk. |
| 2 | What tile footprint and per-height-unit pixel offset should the isometric projection use? | 64x32 diamond tile, 16px per height step. |
| 3 | Should this feature's tile-rendering approach get its own ADR, given it's the first hand-rolled isometric/Pixi pattern in the codebase? | Yes — write a dedicated ADR via the `architecture` skill. |
| 4 | Where should the heightmap data and the screen/grid projection math live? | Heightmap data in `src/model/` (a `BattlefieldGrid` entity, per ADR-0005); projection math in `src/utils/` (pure functions). |

## 15. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this planning session.
