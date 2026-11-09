# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a **time-boxed spike**, not a production codebase: its only goal is to validate a gameplay hypothesis — a turn-based RPG battle scenario in an isometric environment. Expect the code to prioritize speed of validation over polish, extensibility, or completeness. There is still no git repository initialized.

The repository currently only contains the default Vite + Vue 3 + TypeScript scaffold (`src/App.vue` renders the stock `HelloWorld` component). No battle logic, rendering, or state management has been written yet — the stack below is the agreed target, not yet installed.

**Language policy: all code, comments, identifiers, and documentation in this repository must be written in English**, regardless of the language used to discuss the project.

## Stack

Beyond the existing Vite + Vue 3 + TypeScript base, the following stack was agreed on for this spike:

- **PixiJS** — Canvas/WebGL renderer for the isometric scene: tiles, unit sprites, battle VFX. Chosen over Phaser (full game framework, own competing game loop) and over DOM/SVG rendering (less suited to many animated sprites at once).
- **Pinia** — single source of truth for battle state (e.g. unit stats/HP, status, positions, turn/phase data). Exposed via getters/actions.
- **Composables** — pure/stateless combat logic (e.g. a `useCombat` composable). Composables compute results and call Pinia actions to apply them, but do not hold battle state themselves.
- **`pathfinding`** (npm package) — grid traversal, A*, and range/distance queries for movement and targeting on the isometric grid. Chosen over `easystarjs` for its synchronous API and multiple algorithm options. Isometric screen↔grid projection math is still expected to be hand-rolled (small, well-known formulas, not worth a dependency).
- **GSAP** — all animation: unit movement and attacks on the Pixi canvas, and HUD/DOM transitions (damage popups, panel transitions) outside the canvas. Used uniformly instead of mixing Pixi's ticker and CSS transitions, so combat and UI animations share one API/timeline model.
- **Tailwind CSS** — styling for the HUD/UI layer (action panels, HP bars, menus) rendered as a Vue/DOM overlay around the Pixi canvas.
- **ESLint + Prettier** — linting (`eslint-plugin-vue`, `@typescript-eslint`) and formatting.
- **No automated test runner.** Given the spike's scope, combat rules are validated manually by playing the prototype (`npm run dev`), not via unit tests.

## Architecture

### Rendering split

- The Pixi `Application` (canvas, tiles, unit sprites, battle VFX) is expected to be owned by a composable (e.g. `usePixiApp`) tied to a Vue component's `onMounted`/`onUnmounted` lifecycle, keeping Pixi's own render loop separate from Vue's reactivity.
- The HUD (action selection, status display, menus) is plain Vue + Tailwind DOM, layered over the canvas — not drawn inside Pixi.
- Pinia state is the bridge: Pixi-side code reads it to know what to draw/animate, and the DOM-side HUD reads/writes it through the same store and composables.

### State vs. logic separation

- **Pinia stores**: data only — battle/unit state. Mutated through actions.
- **Composables**: combat logic and calculations — pure functions or thin wrappers that compute a result and then call store actions to commit it. Keep rule logic out of components and out of the store's actions themselves where possible, so combat math stays readable even without a test suite.

## Graphic asset creation

Whenever a sprite, spritesheet, tile, tilemap, or any other graphic asset needed for the prototype must be drawn or edited, open a new instance with a new subagent using the Opus model, which will use the `graphic-designer` skill to perform the task. Do not perform this work directly — always delegate it to that subagent. All output (code, comments, identifiers, documentation) must be written in English.

## Trello guardrail

**Scope restriction — must be followed exactly:** whenever you read, write, or perform any operation on Trello or Trello cards, you MUST use **only** the board "Turn based prototype", at the URL defined by the `TRELLO_URL` variable in `.env`.

- Use the Trello authentication credentials found in `.env`.
- You MUST ignore every other board on the account — do not read from, write to, or otherwise touch any board other than "Turn based prototype", even if a task seems related to another board.
