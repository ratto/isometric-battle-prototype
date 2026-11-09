# ADR-0001: Use PixiJS as the rendering engine for the isometric battle scene

**Status:** Accepted
**Date:** 2026-11-09
**Deciders:** Pedro "Ratto" Paixão

## Context

The prototype needs to render an isometric 24x24 tile grid, unit sprites, and battle VFX (attack animations, projectiles, damage popups) with many animated sprites on screen at once, while sustaining a minimum of 30 FPS (PRD NFR "Performance"). The HUD is a separate Vue/Tailwind DOM overlay, so the renderer only needs to own the canvas, not the whole UI. Per `CLAUDE.md`, the rendering layer is expected to be owned by a composable (`usePixiApp`) tied to a Vue component's lifecycle, decoupled from Pinia state and from the DOM HUD.

## Decision

Use PixiJS as the canvas/WebGL renderer for tiles, unit sprites, and battle VFX, owned by a `usePixiApp` composable with its own render loop separate from Vue's reactivity.

## Options Considered

### Option A: PixiJS

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — renderer-only library, integrates cleanly as a leaf dependency behind one composable |
| Cost | None (open source) |
| Scalability | Well suited to many simultaneous animated sprites (WebGL-backed) |
| Team familiarity | Not previously used on this project, but scoped to a single composable |

**Pros:** Lightweight 2D renderer with no opinion on game loop, state, or input handling, which fits the project's existing Pinia-as-state-owner architecture; strong sprite/VFX batching performance for an isometric scene with many units.
**Cons:** Still requires hand-rolling isometric screen↔grid projection math, scene graph organization, and camera/pan logic — PixiJS gives no battle-specific help.

### Option B: Phaser

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium/High — full game framework with its own scene lifecycle, input, and game loop |
| Cost | None (open source) |
| Scalability | Comparable rendering performance to PixiJS (Phaser uses Pixi internally in some builds) |
| Team familiarity | Not previously used on this project |

**Pros:** Batteries-included (input, scenes, physics, tweening) could reduce some boilerplate.
**Cons:** Phaser's own game loop and scene management compete with Vue's component lifecycle and with Pinia as the single source of truth, forcing two competing owners of "what is the current state" instead of one; most of Phaser's extra batteries (physics, built-in tweening) are redundant with GSAP and the custom turn-based combat model and would go unused.

### Option C: DOM/SVG rendering

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low to start, but grows fast with VFX |
| Cost | None |
| Scalability | Poor for many simultaneously animated elements |
| Team familiarity | High (ordinary Vue/CSS) |

**Pros:** No new rendering dependency; reuses Vue/CSS skills directly.
**Cons:** DOM/SVG layout and repaint costs scale poorly with many animated sprites and VFX at once, risking the 30 FPS target; isometric depth-sorting and pixel-precise sprite layering are awkward to express in DOM/CSS compared to a canvas scene graph.

## Trade-off Analysis

The real choice is between a renderer-only library (PixiJS) and a full game framework (Phaser). Phaser's game loop and scene model would duplicate responsibilities this project already assigns to Pinia (state) and Vue (component lifecycle), adding a second competing source of truth rather than simplifying anything — this is a bigger cost than the batteries-included convenience is worth for a time-boxed spike. DOM/SVG is rejected primarily on performance risk against the explicit 30 FPS NFR, not on familiarity.

## Consequences

- Rendering stays a thin, replaceable layer: `usePixiApp` only draws what Pinia already holds, keeping combat logic fully testable (Vitest) without a canvas.
- Isometric projection math, camera/pan, and depth-sorting must be hand-rolled; no framework convenience here.
- If sprite/VFX count still threatens the 30 FPS NFR, the existing HLD mitigation (cap simultaneous sprites/effects, test on modest hardware) applies without changing this decision.

## Action Items

1. [x] Add PixiJS as a dependency.
2. [ ] Implement `usePixiApp` composable with isolated render loop and lifecycle teardown.
3. [ ] Validate frame rate with the full 24x24 grid and a representative unit/VFX count on modest hardware.
