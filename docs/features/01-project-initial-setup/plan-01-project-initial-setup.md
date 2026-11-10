# Technical Plan: Project Initial Setup

**Slug:** `01-project-initial-setup`
**Spec:** [spec-01-project-initial-setup.md](spec-01-project-initial-setup.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

This plan installs the full stack agreed for the prototype, wires it into the existing Vite + Vue 3 +
TypeScript scaffold, and removes everything in that scaffold that has no place in the project. It adds
no gameplay logic: no store holds battle state, no composable computes anything, no Pixi scene renders
a sprite. What changes is purely infrastructural — dependencies, build/lint/test configuration, folder
structure, and the three documents whose statements this work makes true (`README.md`, `CLAUDE.md`, and
ADR-0004).

A developer picking this up needs to know three things the spec decided and this plan now makes
concrete: Tailwind v4 is wired through its first-party Vite plugin (not PostCSS), Vitest is added despite
CLAUDE.md currently saying otherwise (CLAUDE.md gets corrected as part of this work), and `sql.js` is the
chosen SQLite/WASM driver (ADR-0004 gets amended to record it). None of these require new judgment here —
they are spec decisions being executed.

## 2. Source documents reviewed

| Document                                            | Key takeaways for this plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-01-project-initial-setup.md`                  | Full dependency list split by `dependencies`/`devDependencies`; exact deletion list; folder structure (including `stores/` and `components/`, decided during the spec interview); Tailwind v4 via Vite plugin; `@/` alias; Pinia-driven scene switching (no `vue-router`); minimal Definition of Done (build/lint/test/dev pass, no runtime smoke test).                                                                                                                                           |
| Trello card `01-project-initial-setup`              | Matches the spec; no clarification added after the spec was written.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `docs/GDD-isometric-battle-prototype.md`            | Not consulted for this plan — this US implements no gameplay rule, so no GDD section applies.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `docs/HLD-isometric-battle-prototype.md`            | Confirms the layered architecture (Pinia ↔ composables ↔ Pixi/HUD) this folder structure must stay visible for; lists Vitest among the main technologies (the basis for the spec's decision to install it) and SQLite via WASM as the static data driver (not built in this US).                                                                                                                                                                                                                   |
| `docs/adr/0004-sqlite-wasm-for-static-game-data.md` | Action item 1 ("choose the SQLite/WASM driver") is still open. This plan closes it by recording `sql.js` as the chosen driver, per the human's decision during this plan's interview.                                                                                                                                                                                                                                                                                                              |
| Current codebase                                    | `src/App.vue` renders `HelloWorld.vue`, which imports `hero.png`, `vite.svg`, `vue.svg`; `public/icons.svg` is referenced only from `HelloWorld.vue`; `index.html` already has a generic title and favicon reference that need no change; `src/style.css` holds scaffold demo styling only; `package.json` has no `pinia`/`pixi.js`/`gsap`/`pathfinding`/`sql.js`/`tailwindcss`/`vitest`/`eslint` dependency yet; `vite.config.ts` has only the Vue plugin; `tsconfig.app.json` has no path alias. |

Additionally, current npm registry versions and peer-dependency ranges were checked directly (not via
Context7, since this is a dependency-compatibility question rather than a usage-API question) to confirm
every new package is compatible with the already-installed `vite@8.3.5`:

| Package              | Resolved version | Compatibility note                                                                                                                                                                  |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tailwindcss/vite`  | latest           | peer `vite: ^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8` — compatible                                                                                                                            |
| `tailwindcss`        | `4.3.5`          | v4 line, matches the spec's "v4 via Vite plugin" decision                                                                                                                           |
| `vitest`             | latest           | peer `vite: ^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0` — compatible; `jsdom`/`happy-dom`/`@vitest/ui` etc. are peer-optional and not installed, since no DOM-testing environment is needed yet |
| `pathfinding`        | `0.4.18`         | ships no bundled types                                                                                                                                                              |
| `@types/pathfinding` | `0.1.0`          | exists on the registry, resolves the spec's edge case 1                                                                                                                             |
| `sql.js`             | `1.16.0`         | —                                                                                                                                                                                   |
| `@types/sql.js`      | `1.4.11`         | exists on the registry                                                                                                                                                              |
| `eslint`             | `10.x`           | flat config only (no `.eslintrc`)                                                                                                                                                   |
| `eslint-plugin-vue`  | `10.x`           | flat config via `configs['flat/recommended']`                                                                                                                                       |
| `typescript-eslint`  | `8.x`            | provides the `ts.config(...)` flat-config helper                                                                                                                                    |

## 3. Architecture fit

This plan does not add a feature to the layered architecture (Pinia ↔ composables ↔ Pixi renderer /
HUD) — it builds the directories that architecture will live in, and registers the one piece of runtime
wiring a later feature needs to find already in place: Pinia attached to the Vue app instance.

The folder structure keeps the HLD's separation visible before any code tests it:

- `src/utils/` — pure TypeScript, framework-agnostic. Must not import Vue, Pinia, PixiJS or GSAP.
- `src/composables/` — the reactive layer; consumes `utils/`, calls `stores/` actions. Owns the Pixi
  `Application` lifecycle (future `usePixiApp`) and combat logic (future `useCombat`), per the HLD.
- `src/stores/` — Pinia stores; state only, mutated through actions (future `battle` store, and the
  small app-level store that will hold which scene is active).
- `src/components/` — the Vue + Tailwind HUD, DOM-only, layered over the canvas.
- `src/scenes/` — the two "pages" of this prototype (title screen, battle), created empty.
- `src/assets/{spritesheets,tilemaps}` — graphic assets, created empty; populating them is the
  `graphic-designer` skill's job, not this plan's.

No deviation from the HLD is introduced. The one architectural decision this plan adds beyond the HLD is
already spec-approved: scene switching is state on a Pinia store, not `vue-router` — this plan does not
create that store (it is gameplay-adjacent, not infrastructure), it only confirms `src/stores/` is ready
to hold it.

## 4. Affected surface

### New files/modules

| Path                               | Purpose                                                                                                                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/assets/spritesheets/.gitkeep` | Keeps the empty directory in git until the first spritesheet lands                                                                                                                                                                              |
| `src/assets/tilemaps/.gitkeep`     | Keeps the empty directory in git until the first tilemap lands                                                                                                                                                                                  |
| `src/composables/.gitkeep`         | Keeps the empty directory in git until the first composable lands                                                                                                                                                                               |
| `src/scenes/.gitkeep`              | Keeps the empty directory in git until the first scene lands                                                                                                                                                                                    |
| `src/stores/.gitkeep`              | Keeps the empty directory in git until the first store lands                                                                                                                                                                                    |
| `src/utils/.gitkeep`               | Keeps the empty directory in git until the first util lands                                                                                                                                                                                     |
| `eslint.config.ts`                 | Flat ESLint config: `eslint-plugin-vue` `flat/recommended` + `typescript-eslint` recommended + `eslint-config-prettier` last, with `vue-eslint-parser` handling `.vue` files and `typescript-eslint.parser` nested under `parserOptions.parser` |
| `.prettierrc.json`                 | Prettier formatting rules (defaults, no project-specific overrides identified)                                                                                                                                                                  |
| `.prettierignore`                  | Excludes `dist/`, `node_modules/`, `package-lock.json` from formatting                                                                                                                                                                          |

### Modified files/modules

| Path                                                | Change                                                                                                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                      | Add the dependencies and devDependencies listed in spec §4; add `lint`, `format`, `test` scripts alongside the existing `dev`/`build`/`preview`                                                                                                                     |
| `vite.config.ts`                                    | Add the `@tailwindcss/vite` plugin; add the `@` → `src/` resolve alias; merge a `test: { environment: 'node' }` block for Vitest (no separate `vitest.config.ts`)                                                                                                   |
| `tsconfig.app.json`                                 | Add `"paths": { "@/*": ["./src/*"] }` and the matching `"baseUrl": "."` under `compilerOptions`, so `vue-tsc` resolves the alias the same way Vite does                                                                                                             |
| `src/main.ts`                                       | Import and register `createPinia()` on the app instance before `.mount('#app')`                                                                                                                                                                                     |
| `src/App.vue`                                       | Replace the `HelloWorld` import and usage with a minimal valid empty shell (`<template><div /></template>` + empty `<script setup lang="ts">`)                                                                                                                      |
| `src/style.css`                                     | Replace scaffold demo styling with `@import "tailwindcss";` plus a minimal reset (`html, body, #app { height: 100%; margin: 0; }`) so a full-viewport canvas has room later                                                                                         |
| `README.md`                                         | Replace the Vite template text with a description of this prototype: what it is (a time-boxed gameplay spike, per CLAUDE.md), the agreed stack, and how to run it (`npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm run format`, `npm run test`) |
| `CLAUDE.md`                                         | Correct the "No automated test runner" statement to reflect the decision made in spec §9/§12: Vitest is used, scoped to the pure combat formulas under `src/utils/`                                                                                                 |
| `docs/adr/0004-sqlite-wasm-for-static-game-data.md` | Amend: mark action item 1 as resolved, record `sql.js` as the chosen driver with the rationale (synchronous API, maturity, sufficient for read-only static data), per spec §9                                                                                       |

### Deleted files

| Path                            | Reason                                                     |
| ------------------------------- | ---------------------------------------------------------- |
| `src/components/HelloWorld.vue` | Scaffold demo component, spec §4                           |
| `src/assets/hero.png`           | Scaffold demo asset, used only by `HelloWorld.vue`         |
| `src/assets/vite.svg`           | Scaffold demo asset, used only by `HelloWorld.vue`         |
| `src/assets/vue.svg`            | Scaffold demo asset, used only by `HelloWorld.vue`         |
| `public/icons.svg`              | Referenced only by `HelloWorld.vue`; no other file uses it |

### Out of scope for this plan

- `index.html` is left untouched: its `<title>` is already `isometric-battle-prototype` and its favicon
  reference (`/favicon.svg`) is not part of the spec's deletion list — the Vite favicon itself stays, per
  spec §4/§12 (a prototype icon is deferred to the `graphic-designer` skill).
- No Pinia store is created (a `battle` store and a scene-selection store are future gameplay work).
- No composable, scene component, or HUD component is created beyond the `App.vue` shell.
- No SQL schema, seed data, or query against `sql.js` is written — only the dependency is installed.
- `vitest.config.ts` as a standalone file is intentionally not created; the `test` block lives inside
  `vite.config.ts` to avoid duplicating the alias and plugin list across two config files.

## 5. State design (Pinia)

Not applicable. This plan registers Pinia on the app instance so a later feature's store works without
further wiring, but defines no store and no state shape itself.

## 6. Logic design (composables)

Not applicable. No composable is created by this plan; `src/composables/` is created empty.

## 7. Rendering / HUD impact

Not applicable. No Pixi canvas, no sprite, and no HUD component is created or modified. `src/App.vue`
becomes an empty shell with no visual output beyond a blank page, which is the explicit, minimal
Definition of Done the human chose (spec §12 preview option).

## 8. Data layer impact

The `sql.js` and `@types/sql.js` packages are installed as dependencies. No schema is defined, no
database file is seeded, and no query is written — building the Static Data Layer itself is explicitly
out of scope (spec §4) and remains a future user story, along with the HLD's prescribed isolation
validation and the documented static-JSON fallback (ADR-0004 action items 3–4).

## 9. External dependencies

| Library                                    | Confirmed via                                                                                                                                                                                                                                                                                                                                                                              | Why it's needed / how it's used here                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwindcss` + `@tailwindcss/vite`        | Context7 (`/tailwindlabs/tailwindcss.com`) — confirmed the v4 setup is `npm install tailwindcss @tailwindcss/vite`, add `tailwindcss()` to the Vite `plugins` array, and `@import "tailwindcss";` as the CSS entry point. No `tailwind.config.js` content-globs file and no PostCSS plugin are used in v4's Vite-plugin path.                                                              | HUD styling layer, per CLAUDE.md/HLD. Installed and wired now so any later component can use utility classes immediately.                               |
| `eslint-plugin-vue` (flat config)          | Context7 (`/vuejs/eslint-plugin-vue`) — confirmed the flat-config pattern: `vue-eslint-parser` must stay the parser for `.vue` files, with `typescript-eslint`'s parser nested under `languageOptions.parserOptions.parser`, and `eslint-plugin-vue`'s `configs['flat/recommended']` combined with `typescript-eslint.configs.recommended` and `eslint-config-prettier` last in the array. | Linting for `.vue` and `.ts` files, per CLAUDE.md.                                                                                                      |
| `pinia`                                    | Not looked up (no API usage beyond `createPinia()` + `app.use(...)`, which is the standard, well-known entry point; no Context7 lookup needed for this plan's scope).                                                                                                                                                                                                                      | Single source of truth for battle state, per HLD — only the app-level registration happens in this plan.                                                |
| `pixi.js`, `gsap`, `pathfinding`, `sql.js` | Installed as dependencies only; no API is called by this plan, so no Context7 lookup was needed. Compatibility with `vite@8.3.5` and TypeScript was confirmed directly against the npm registry (§2 table) rather than via Context7, since the question was peer-dependency compatibility, not library usage.                                                                              | Renderer, animation, grid traversal, and static-data driver, per HLD/ADRs — all deferred to later features.                                             |
| `vitest`                                   | Context7 was not queried; the peer-dependency range was checked directly against the npm registry (§2 table) to confirm compatibility with the installed `vite@8.3.5`.                                                                                                                                                                                                                     | Unit-test runner for the pure combat formulas that will live in `src/utils/`, per the HLD and the spec's resolution of the HLD/CLAUDE.md contradiction. |

## 10. Implementation sequencing

1. **Dependencies and build/lint/test configuration** (first commit)
   - Add all packages from spec §4 to `package.json` (`dependencies` vs `devDependencies` split as
     specified); run `npm install` and commit the updated `package-lock.json`.
   - Add the `@tailwindcss/vite` plugin and the `@` alias to `vite.config.ts`; add the matching
     `"paths"`/`"baseUrl"` to `tsconfig.app.json`.
   - Merge the Vitest `test` block into `vite.config.ts` with `environment: 'node'`.
   - Add `eslint.config.ts` (flat config, `.vue` + `.ts`, per §9's confirmed pattern) and
     `.prettierrc.json`/`.prettierignore`.
   - Add `lint`, `format`, `test` scripts to `package.json`.
   - **Verify before continuing:** `npm run lint`, `npm run format` (should report nothing to change,
     since no source file has been touched yet), and `npm run test` (zero test files, successful exit)
     all pass. `npm run build` should still succeed — the scaffold is still intact at this point.

2. **Boilerplate removal and folder structure** (second commit)
   - Delete the five files listed in §4 ("Deleted files").
   - Replace `src/App.vue` with the empty shell; replace `src/style.css` with the Tailwind entry point
     and minimal reset; register `createPinia()` in `src/main.ts`.
   - Create `src/components/` (already exists, now empty — no `.gitkeep` needed since it is not left
     empty forever, but add one now since it is empty at the end of this US), `src/assets/spritesheets/`,
     `src/assets/tilemaps/`, `src/composables/`, `src/scenes/`, `src/stores/`, `src/utils/`, each with
     `.gitkeep`.
   - **Verify before continuing:** `npm run build` succeeds with no TypeScript/Vite error and no leftover
     reference to a deleted file; `npm run dev` serves a blank page with an empty browser console;
     temporarily confirm the `@/` alias resolves (throwaway file per spec's manual verification plan,
     removed immediately after); temporarily confirm a Tailwind class renders (same pattern), removed
     immediately after.

3. **Documentation** (third commit)
   - Rewrite `README.md` per §4.
   - Correct `CLAUDE.md`'s test-runner statement per §4.
   - Amend `docs/adr/0004-sqlite-wasm-for-static-game-data.md`: mark action item 1 resolved, record
     `sql.js` as the chosen driver.
   - **Verify before continuing:** re-run `npm run lint`, `npm run build`, `npm run test`, `npm run dev`
     once more as a final confirmation that nothing in step 3 broke anything (it shouldn't — this step
     touches only Markdown).

All three commits land on the existing branch `infra/01-project-initial-setup` and ship as a single pull
request, per the human's sequencing decision.

## 11. Technical risks and mitigations

| Risk                                                                                                                                                                                                                          | Likelihood/Impact | Mitigation                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In `eslint-plugin-vue`'s flat config, overriding the top-level `parser` instead of nesting `typescript-eslint`'s parser under `parserOptions.parser` silently stops `.vue` files from being linted (no error, just no effect) | Medium/Medium     | Follow the exact pattern confirmed via Context7 in §9: `vue-eslint-parser` stays the implicit parser from `flat/recommended`; only `parserOptions.parser` is set to `typescript-eslint`'s parser. Verified by step 1's `npm run lint` check running across both `.ts` and `.vue` files. |
| Vitest's peer dependencies list several optional packages (`jsdom`, `happy-dom`, `@vitest/ui`, coverage providers) that are not being installed                                                                               | Low/Low           | None of them are required for a `node`-environment run with zero test files. If a future test needs DOM (e.g. testing a composable's reactivity), that future story installs `jsdom` then — not a regression risk for this plan's Definition of Done.                                   |
| Merging Vitest's `test` config into `vite.config.ts` instead of a standalone `vitest.config.ts` could, in principle, pull Vite-only plugin behavior (e.g. `@tailwindcss/vite`) into the test run unnecessarily                | Low/Low           | With zero test files this has no observable effect now. If it causes friction once real tests exist, splitting into a dedicated `vitest.config.ts` that shares config via `mergeConfig` is a small, isolated follow-up — not a blocker here.                                            |
| `pathfinding`'s own published types (`pathfinding@0.4.18` ships none) might not perfectly match `@types/pathfinding@0.1.0`, which could be a thin/incomplete community typing                                                 | Low/Low           | No code imports `pathfinding` in this plan, so any mismatch has zero effect now. Spec edge case 1 already plans a local `.d.ts` fallback for whichever future story is the first to actually import it.                                                                                 |
| The stack is installed but nothing exercises it at runtime beyond a blank page — any integration failure between Pixi, GSAP, `sql.js`, and `pathfinding` surfaces only in the first gameplay story                            | High/Medium       | Already accepted at the spec level (spec §8) as a deliberate consequence of the chosen minimal Definition of Done; not mitigated by this plan. Flagged again here so the next story's estimate accounts for first-run integration risk.                                                 |

## 12. Manual verification plan

1. **After commit 1** (dependencies and configs): run `npm install`, then `npm run lint` — expect a clean
   exit even though no source file changed yet (the new config should simply find nothing to flag beyond
   whatever the scaffold already satisfies). Run `npm run format` and confirm `git status` is clean
   (nothing needed reformatting). Run `npm run test` and confirm Vitest exits successfully reporting zero
   test files. Run `npm run build` and confirm it still succeeds (the scaffold is still present).
2. **After commit 2** (boilerplate removal and folder structure): run `npm run dev`, open the served URL,
   and confirm the page is blank with an empty browser console — no 404 for any deleted asset. Inspect
   `src/` and confirm the six folders exist with `.gitkeep` files tracked by `git ls-files src/`.
   Temporarily add `<div class="text-red-500">test</div>` to `App.vue`, confirm it renders red in the
   browser (Tailwind compiles), then revert. Temporarily create `src/utils/alias-check.ts` exporting a
   constant, import it from `App.vue` via `@/utils/alias-check`, run `npm run build` to confirm it
   type-checks, then delete both the file and the import.
3. **After commit 3** (documentation): read `README.md` and confirm it describes this prototype (not the
   Vite template) and that its run instructions match the actual `package.json` scripts. Read
   `CLAUDE.md`'s test-runner statement and confirm it now matches reality. Read the amended
   `docs/adr/0004-sqlite-wasm-for-static-game-data.md` and confirm action item 1 is marked resolved with
   `sql.js` recorded as the choice. Re-run `npm run lint && npm run build && npm run test` once more as a
   final sanity check.
4. Search the repository for `HelloWorld`, `hero.png`, `vite.svg`, `vue.svg`, and `icons.svg` and confirm
   no match remains outside the spec, this plan, and the dev report.

## 13. Open technical questions

1. **ADR-0004 amendment vs. a new ADR.** This plan amends ADR-0004 in place (mark action item 1 resolved,
   record `sql.js`), per the human's decision during this plan's interview. If a future reviewer prefers
   a formal superseding ADR instead of an in-place amendment, that is a one-paragraph change to make
   later — flagging it so it isn't mistaken for an oversight.
2. **SQLite/WASM isolation validation.** Still unscheduled, as noted in the spec. This plan installs
   `sql.js` but performs no validation of it — the HLD's prescribed mitigation (validate in isolation
   before populating data) and the static-JSON fallback (ADR-0004 action items 3–4) remain open and
   should become their own user story before any data-layer work begins. Recommend the human invoke the
   `architecture` skill if a dedicated ADR is wanted for the validation approach itself.
3. **Prototype favicon and Netlify deployment.** Both remain out of scope and unscheduled, as recorded in
   the spec. No action needed from this plan.

## 14. Interview notes

| #   | Question                                                                                                                                                                                                             | Answer                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The spec left open whether choosing `sql.js` should be formalized as an amendment to ADR-0004 within this US, or deferred to a separate `architecture`-skill invocation. Should this plan include amending ADR-0004? | Yes — amend ADR-0004 as part of this plan's implementation sequence.                                                                                  |
| 2   | Vitest needs a test environment configured even though zero tests exist yet. Since future combat-formula tests under `src/utils/` are plain TypeScript with no DOM, what should be planned?                          | `environment: 'node'`, merged into `vite.config.ts` rather than a separate `vitest.config.ts`.                                                        |
| 3   | Should the full implementation (dependencies, cleanup, configs, folder structure, README, CLAUDE.md, ADR amendment) land as one commit, or as incremental, independently verifiable steps within the same PR?        | One PR with a few logical commits, each independently verifiable (build/lint/test run clean after each), rather than a single commit or multiple PRs. |

## 15. Token usage and estimated cost

| Metric               | Value                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Model                | `claude-sonnet-5`                                                                                                                               |
| Input tokens         | ~95,000 (estimated, cumulative across this planning session; dominated by prompt-cache reads of the spec, HLD, and ADR-0004 already in context) |
| Output tokens        | ~7,500 (estimated)                                                                                                                              |
| Estimated cost (USD) | ~$0.27                                                                                                                                          |
| Estimated cost (BRL) | ~R$1.46                                                                                                                                         |

- **These figures are estimates, not measurements.** The agent has no access to the session's billing
  counters; they approximate this planning session's cumulative total, not this document alone.
- Pricing applied: `claude-sonnet-5` at **$2.00 / 1M input tokens** and **$10.00 / 1M output tokens**
  (Anthropic first-party API rates).
- BRL conversion uses an assumed rate of **R$5.40 per US$1.00**; the actual rate on the invoicing date
  will differ.
- Cost drivers in this session: re-reading the spec, HLD, and ADR-0004 (already cached from the spec
  session); direct npm-registry lookups for version/peer-dependency confirmation (no Context7 query was
  needed for this step, since it was a compatibility check, not a usage-API question); and three
  interview rounds.
