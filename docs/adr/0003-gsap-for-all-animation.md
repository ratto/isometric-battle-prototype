# ADR-0003: Use GSAP uniformly for all animation (canvas and DOM)

**Status:** Accepted
**Date:** 2026-11-09
**Deciders:** Pedro "Ratto" Paixão

## Context

The prototype needs two kinds of animation: battle VFX on the Pixi canvas (unit movement, attacks, projectiles following the camera, per the GDD's camera rules) and HUD/DOM transitions outside the canvas (damage popups, panel transitions). FR-007 requires every relevant combat event to trigger a simple animation plus a sound effect, and a missing asset must not block combat. Two independent animation mechanisms already exist for free in the stack — PixiJS's own ticker for canvas objects, and CSS transitions for DOM — so the question is whether to use both or standardize on one external library across both surfaces.

## Decision

Use GSAP for all animation — both Pixi canvas objects (movement, attacks) and Vue/Tailwind DOM elements (damage popups, panel transitions) — through one shared timeline/animation API.

## Options Considered

### Option A: GSAP uniformly for canvas and DOM

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — one API/timeline model to learn and reuse everywhere |
| Cost | None for the features this spike needs (GSAP core is free; no paid plugins required) |
| Scalability | Mature, performant tweening engine, not a scaling concern at this content volume |
| Team familiarity | Not previously used on this project, but a single API surface to learn once |

**Pros:** One mental model and one timeline/sequencing API for every animated event in the game, whether it originates on the canvas or in the HUD — a single "attack" event can drive a Pixi sprite tween and a DOM damage-popup tween from the same timeline; avoids synchronizing two separate animation clocks (Pixi ticker + browser CSS transitions) when an event spans both surfaces (e.g. an attack animation on canvas triggering a damage number in the HUD at a precise moment).
**Cons:** Adds a dependency for DOM transitions that CSS could technically handle alone; the whole project leans on a single animation library, so a GSAP-specific limitation would affect both canvas and DOM animation simultaneously.

### Option B: Pixi's ticker for canvas, CSS transitions for DOM

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — two separate systems to coordinate when an event touches both |
| Cost | None (no extra dependency) |
| Scalability | Each mechanism is adequate alone for this spike's VFX volume |
| Team familiarity | High (standard Pixi/CSS knowledge) |

**Pros:** No extra dependency; each tool is the "native" choice for its own surface.
**Cons:** Combat events like an attack frequently need to be sequenced across both canvas and DOM (projectile travel on canvas, then a damage popup in the HUD) — coordinating two independently-clocked animation systems for these cross-surface sequences adds complexity exactly where FR-007 needs simple, reliable event-to-feedback wiring; inconsistent easing/timing APIs between the two make "simple" VFX work less simple in practice.

## Trade-off Analysis

Because several combat events (attack, hit, victory/defeat) need a canvas effect and a DOM reaction tied to the same moment, the cost of running two separate animation systems (keeping their timing and sequencing APIs consistent) outweighs the cost of one extra dependency. GSAP's timeline model lets one sequence drive both a Pixi object and a DOM element, which is the specific coordination problem Option B does not solve well.

## Consequences

- Every animated combat event (canvas or DOM) is authored against one API, simplifying FR-007's "animation + SFX per event" requirement and the missing-asset fallback (skip animation/SFX, log dev error, never block combat).
- The project takes on a single external animation dependency for both the canvas and the HUD, rather than zero dependencies for either surface individually.
- Any future performance or licensing issue with GSAP affects animation across the whole game, not just one surface — acceptable for a time-boxed spike, to be revisited if the prototype becomes a production codebase.

## Action Items

1. [x] Add GSAP as a dependency.
2. [ ] Define a shared convention for triggering GSAP timelines from combat events (canvas + DOM) via the Animation Layer described in the HLD.
3. [ ] Verify the missing-asset fallback (FR-007) does not break a GSAP timeline mid-sequence.
