# Isometric Battle Prototype

A time-boxed spike validating a turn-based RPG battle scenario in an isometric environment, grounded in
the **Sistema Daemon** tabletop RPG rules. It is a client-side-only SPA: no backend, no external
integrations, deployed as a static site.

See [CLAUDE.md](CLAUDE.md) for the project's scope, architecture, and working conventions, and
[docs/](docs/) for the product requirements, high-level design, ADRs, and per-feature specs/plans.

## Stack

- **Vite + Vue 3 + TypeScript** — application shell
- **PixiJS** — canvas/WebGL renderer for the isometric scene
- **Pinia** — single source of truth for battle state
- **Composables** — pure/stateless combat logic, consuming `src/model/` and `src/utils/`
- **`pathfinding`** — grid traversal, A\*, and range/distance queries
- **GSAP** — all animation, canvas and DOM
- **Tailwind CSS** — HUD/UI styling layer
- **SQLite via WASM (`sql.js`)** — static game data (Items, Weapons, Upgrades, Spells)
- **Vitest** — unit tests for `src/model/` entities and the pure combat formulas in `src/utils/`
- **ESLint + Prettier** — linting and formatting

## Project structure

```
src/
├── assets/       graphics, spritesheets, tilemaps
├── components/   the Vue + Tailwind HUD (DOM overlay)
├── composables/  reactive combat/rendering logic
├── model/        entities/models (typed data shapes with attached behavior)
├── scenes/       the title screen and the battle scene
├── stores/       Pinia state
└── utils/        pure TypeScript, framework-agnostic functions
```

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # type-check and build for production
npm run preview # preview the production build locally
npm run lint    # lint .ts and .vue files
npm run format  # format the project with Prettier
npm run test    # run the Vitest unit tests
```
