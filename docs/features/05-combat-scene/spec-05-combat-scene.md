# Spec: Combat Scene

**Slug:** `05-combat-scene`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

This feature adds the battle prototype's combat scene: an isometric battlefield representing a forest
clearing, rendered on a Pixi canvas, that the player reaches from the main menu's "Configure Match"
placeholder (introduced in `02-initial-screen`). The battlefield is a 24x24 tile grid whose elevation
comes from `docs/heightmap-grid-24x24.md` (0 = water level, positive values = rising ground, negative
values = dips), drawn as stacked isometric block tiles in the style of Final Fantasy Tactics, so height
differences are visibly physical rather than just color-coded. The player can look around the empty
battlefield by holding the right mouse button (or a touch, on touch-capable devices) and dragging, with
the camera clamped to the map's bounds. No units, turn order, or combat math exist yet — this US is
purely the scene/map foundation the future battle logic will be built on top of.

## 2. Daemon System grounding

Not applicable. This feature is scene/rendering infrastructure — a static battlefield and a camera — with
no attribute, skill, initiative, or attack/damage resolution involved. It only touches the combat domain
indirectly, as the physical stage those mechanics will later run on (see
[docs/daemon-system-rules-reference.md](../../daemon-system-rules-reference.md) §15, point 7, which notes
movement ranges will later be read from `AGI`/`CON` — not part of this US).

## 3. Goal and value

- **Goal:** validate that the project can render a readable, FFT-style isometric battlefield from a
  hand-authored heightmap, and that the player can navigate from the existing menu shell into a
  dedicated Pixi-driven scene and look around it — establishing the rendering/camera foundation that
  unit placement, movement, and combat will be layered onto in later USs.
- **Value:** gives the prototype its first real gameplay space to look at, turns the abstract heightmap
  document into a concrete visual, and proves out the Pixi-owned-by-composable rendering split from
  CLAUDE.md before any combat logic depends on it.

## 4. Scope

### In scope

- A new `CombatScene.vue` component, rendering a Pixi `Application` owned by a composable (e.g.
  `useBattlefieldScene`), following CLAUDE.md's rule that Pixi's render loop is tied to the component's
  `onMounted`/`onUnmounted` lifecycle.
- Extending the existing top-level scene Pinia store (from `02-initial-screen`) with a third scene value
  for the combat scene, so `App.vue` can render it via the same `<component :is>` mechanism.
- A new, enabled "Start Battle" button added to the "Configure Match" placeholder menu, which transitions
  the top-level scene store to the combat scene.
- A minimal "Back" control in the combat scene that returns the top-level scene store to the initial menu
  (main menu, not "Configure Match"), so the Start Battle -> Back loop is repeatable for manual testing.
- A 24x24 isometric tilemap generated from `docs/heightmap-grid-24x24.md`, rendered as stacked isometric
  block tiles: each tile's screen position/visible height reflects its heightmap value (0 = water level,
  positive = raised ground, negative = a dip), matching the visual language of Final Fantasy Tactics'
  elevated terrain.
- A forest-clearing visual theme for the tileset (grass-like ground tiles, a water tile for height 0,
  and distinct tiles/sprites for each other height step) — open ground only, no treeline/forest border
  around the clearing's edge in this US.
- Camera panning: holding the right mouse button and dragging moves the camera; holding a touch and
  dragging does the same on touch-capable devices. No zoom.
- Camera bounds: panning is clamped so the map's edges cannot be dragged past the point where they would
  leave the visible canvas (no empty void beyond the map).
- Fixed 1280x720 canvas size, consistent with `02-initial-screen` — not a responsive/resizing canvas, but
  both pointer-drag and touch-drag input are implemented at that fixed size.
- Delegating all new tile/tilemap art (via a new subagent instance running the `graphic-designer` skill
  on the Opus model, per CLAUDE.md) — this feature's implementer does not draw assets directly.

### Out of scope

- Any unit/character sprites, placement, or selection on the battlefield.
- Turn order, initiative, actions, attacks, or any other Daemon System combat math.
- Any HUD (action panels, HP bars, menus) — this US is the bare battlefield and camera only.
- Camera zoom or rotation.
- A treeline/forest border around the clearing (narrative flavor only for now).
- Responsive/resizing canvas for arbitrary viewport sizes (canvas stays fixed at 1280x720).
- Persisting or restoring combat-scene state across page reloads.
- Pathfinding, movement ranges, or any use of the `pathfinding` package (no units exist yet to move).
- Any changes to the "Configure Match" menu beyond adding the "Start Battle" button (no actual match
  configuration options are added).

## 5. Functional requirements

1. On the "Configure Match" placeholder menu, a "Start Battle" button is visible and enabled.
2. Clicking "Start Battle" transitions the top-level Pinia scene store to the combat scene, replacing the
   menu with `CombatScene.vue`.
3. On entering the combat scene, the player sees a 24x24 isometric tilemap representing a forest clearing,
   with visible elevation differences matching `docs/heightmap-grid-24x24.md` (e.g. the row/column of `+5`
   cells visibly stands higher than the `-3` cells near it).
4. The combat scene renders via a Pixi `Application`; no units, HUD, or other overlays are present besides
   the battlefield itself and the Back control.
5. Holding the right mouse button down and moving the mouse pans the camera over the battlefield in the
   direction of the drag.
6. Pressing and dragging a touch point has the same panning effect as the right-mouse-drag, on
   touch-capable devices.
7. The camera cannot be panned past the point where the map's edge would leave the visible canvas in any
   direction — the map edge is always at most flush with the canvas edge, never leaving a void beyond it.
8. Releasing the mouse button or lifting the touch stops the panning; a left-click or left-drag does not
   pan the camera.
9. A visible "Back" control in the combat scene, when clicked, returns the top-level scene store to the
   initial main menu (title + Start/Options/Exit), not to "Configure Match".
10. The Start Battle -> Back cycle can be repeated multiple times without the scene entering a broken
    state (e.g. duplicated Pixi canvases, memory leaks visible as growing listener counts, or a frozen
    camera).

## 6. Non-functional requirements

- Rendering: the battlefield is drawn on a Pixi `Application`, owned by a composable tied to
  `CombatScene.vue`'s `onMounted`/`onUnmounted` lifecycle, per CLAUDE.md's rendering-split architecture.
  The `Application` and its event listeners must be torn down in `onUnmounted` so repeated Start
  Battle -> Back cycles don't leak canvases or pointer listeners.
- State: the active top-level scene (menu vs. combat) lives in the existing Pinia store from
  `02-initial-screen`, extended with the new scene value; the Pixi battlefield's own per-frame camera
  position is composable-local state, not Pinia, since it has no value outside the running scene in this
  US.
- Input handling: right-mouse-button drag and touch drag must both be implemented directly against Pixi's
  pointer events (no new dependency added solely for camera panning, since this is a small, well-known
  drag-delta calculation).
- Layout: fixed 1280x720 canvas, matching `02-initial-screen`'s target; both mouse and touch input paths
  are implemented at this fixed size (no responsive breakpoints).
- Assets: all new tile/tilemap art (water tile, every distinct elevation/slope tile needed to cover the
  heightmap's -2..+5 range) must be produced by delegating to a new subagent instance running the
  `graphic-designer` skill (Opus model), per CLAUDE.md — not drawn directly by the implementing agent.
- Animation: if any camera easing or transition animation is added beyond the raw drag-follow, it must
  use GSAP, per CLAUDE.md's rule that all animation goes through GSAP rather than ad hoc tickers/CSS.

## 7. Edge cases

| Edge case | Expected behavior |
| --- | --- |
| Player drags the camera toward/past a map edge | Camera position clamps at the bound; further drag in that direction has no additional effect until the drag reverses direction. |
| Player releases the right mouse button outside the canvas (or the browser window loses focus) mid-drag | Panning stops cleanly; no stuck "dragging" state remains on the next pointer-down. |
| Player presses left mouse button and drags | No camera movement; left-drag is ignored for panning. |
| Multiple rapid Start Battle -> Back cycles | Each cycle fully tears down the previous Pixi `Application`/listeners before or as part of mounting the next; no duplicated canvases, no doubled pan speed from leaked listeners. |
| Touch device: multi-touch (e.g. second finger down mid-drag) | The existing single-touch drag continues to track the original touch point; a second touch does not start a competing/second drag. |
| Window/viewport smaller than 1280x720 | Not handled in this US (fixed canvas size, same as `02-initial-screen`); overflow/cropping is acceptable. |
| Heightmap cell at the grid's outer edge | Still rendered as a stacked block tile per its height value; no special-cased "edge" tile variant is required since there is no treeline border in this US. |

## 8. Risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| The heightmap spans 8 distinct height levels (-2 to +5) plus the slope transitions between adjacent differing heights, which could require a large isometric tileset to look right in FFT style | Medium/Medium | Scope the `graphic-designer` subagent's brief to a small base set of block/slope tiles that can be reused and flipped/rotated across the grid, rather than one unique sprite per cell; accept a simpler slope treatment (e.g. a single generic "step" tile between any two adjacent heights) if a fully stepped FFT-accurate transition proves too large for this US. |
| This is the first feature to introduce a Pixi `Application` and pointer-based camera control in the project, with no prior pattern to follow | Medium/Medium | Keep the camera composable minimal (position + clamp + drag-delta only); treat it as the reference implementation future scenes/composables (`usePixiApp`) will follow, per CLAUDE.md. |
| Extending the `02-initial-screen` scene store incorrectly could regress the existing menu navigation (Start/Back, Options/Exit disabled state) | Low/Medium | Add the new scene value alongside the existing ones without changing their names/behavior; manually re-run `02-initial-screen`'s verification steps after this change. |
| Touch-drag and right-mouse-drag handling via raw Pixi pointer events may behave inconsistently across browsers/devices | Low/Medium | Manually verify on at least one desktop browser (mouse) and, if available, one touch device or browser touch-emulation mode, before marking this done. |

## 9. Dependencies

- Depends on `02-initial-screen` (the top-level Pinia scene store and the "Configure Match" placeholder
  menu), already done.
- Depends on `docs/heightmap-grid-24x24.md` as the authoritative source for tile elevations.
- Depends on the `graphic-designer` skill/subagent for all new tile/tilemap art.
- Blocks any future US that places units on the battlefield, implements movement/pathfinding, or starts
  wiring actual combat (initiative, attacks, damage) onto this scene.

## 10. Definition of Done

- [ ] The "Configure Match" placeholder menu shows an enabled "Start Battle" button.
- [ ] Clicking "Start Battle" opens the combat scene, replacing the menu entirely.
- [ ] The combat scene renders a 24x24 isometric tilemap whose visible elevation matches
      `docs/heightmap-grid-24x24.md` (water level at 0, raised blocks for positive values, lowered
      ground for negative values), styled as a forest clearing (open ground, no treeline border).
- [ ] The tilemap is rendered on a Pixi `Application` owned by a composable tied to the component's
      `onMounted`/`onUnmounted` lifecycle.
- [ ] Holding the right mouse button and dragging pans the camera over the battlefield; left-click/drag
      does not pan.
- [ ] Holding a touch and dragging pans the camera the same way on a touch-capable device/emulator.
- [ ] The camera cannot be panned to show empty space beyond any of the map's four edges.
- [ ] A visible "Back" control returns to the initial main menu from the combat scene.
- [ ] The Start Battle -> Back cycle can be repeated multiple times without visual glitches, console
      errors, or leaked Pixi canvases/listeners.
- [ ] All new tile/tilemap art was produced by a `graphic-designer` subagent, with a design report under
      `docs/design/reports`.
- [ ] All code, identifiers, comments, and file names are in English, per CLAUDE.md's language policy.

## 11. Manual verification plan

1. Run `npm run dev` and open the app in a browser at 1280x720 (or a window at least that size).
2. Navigate Start -> Configure Match; confirm a new "Start Battle" button is present and enabled.
3. Click "Start Battle"; confirm the menu is replaced by the combat scene showing the isometric
   battlefield.
4. Visually compare the rendered tilemap against `docs/heightmap-grid-24x24.md`: pick two or three
   reference cells (e.g. the `+5` peak around row 11-12, the `-3` dip around row 17-18) and confirm they
   render visibly higher/lower than their neighbors, FFT-style.
5. Hold the right mouse button and drag in each of the four directions; confirm the camera pans smoothly
   and follows the drag.
6. Try a left-click drag; confirm it does not pan the camera.
7. Drag the camera toward each of the four map edges until it stops; confirm no empty void appears beyond
   the map on any side.
8. If a touch-capable device or the browser's touch-emulation mode is available, repeat steps 5-7 using a
   press-and-drag touch gesture.
9. Click "Back"; confirm the initial main menu reappears (title pulsing, Start/Options/Exit visible).
10. Repeat steps 2-3 and 9 two or three times to confirm the Start Battle -> Back cycle is stable, and
    check the browser console for errors throughout.

## 12. Open questions

None.

## 13. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | What is this US's context? | Player starts a match from the main menu and enters the combat scene to see the battlefield: a forest-clearing battlefield, isometric, FFT-Tactics-inspired, generated from `docs/heightmap-grid-24x24.md` (0 = water level, positive = aclive/rise, negative = declive/dip); the player can pan the empty map via right-mouse-drag (or touch-hold-drag on mobile). |
| 2 | How should the main menu -> combat scene transition be architected, given no vue-router exists? | Simple local/Pinia state toggle on the existing top-level scene store (from `02-initial-screen`), no router added. |
| 3 | Is the main menu itself in scope? | No — it was already implemented in `02-initial-screen`; this US only adds a way to go from "Configure Match" into the combat scene. |
| 4 | How should the heightmap drive isometric rendering? | Stacked isometric block tiles (FFT-Tactics style): each tile's visible height reflects its heightmap value, not just a color/shading cue. |
| 5 | Should the tilemap reuse existing art or need new art? | New art, delegated to the `graphic-designer` subagent per CLAUDE.md, since no forest-clearing tileset exists yet. |
| 6 | How does the player actually reach the combat scene given feature 02's "Configure Match" is a dead-end placeholder? | Add an enabled "Start Battle" button to "Configure Match" that transitions to the new combat scene. |
| 7 | Feature 02 was fixed 1280x720 desktop-only; this US asks for touch-hold-drag on mobile — what's the target? | Keep the fixed 1280x720 canvas, but implement both right-mouse-drag and touch-drag input handling at that size (no full responsive layout). |
| 8 | Should camera panning be bounded? | Yes — clamp to the map's edges; no panning into empty void beyond the map. |
| 9 | Should the clearing have a forest/treeline border? | No — open ground only (grass/water/slope tiles per the heightmap); a treeline is a future US. |
| 10 | Should the combat scene have a way back to the menu? | Yes — a simple Back control returning to the initial main menu, so the flow is repeatable for manual testing. |
| 11 | Is camera zoom in scope? | No — panning only, at a fixed zoom level. |

## 14. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this spec-writing session.
