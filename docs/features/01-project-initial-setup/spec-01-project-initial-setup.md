# Spec: Project Initial Setup

**Slug:** `01-project-initial-setup`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

The repository currently holds nothing but the default Vite + Vue 3 + TypeScript scaffold: `src/App.vue`
renders the stock `HelloWorld` component, and none of the libraries the project agreed on (PixiJS, Pinia,
GSAP, `pathfinding`, Tailwind CSS, SQLite via WASM) are installed. Every gameplay user story that follows
is blocked on that groundwork.

This user story is infrastructure, not gameplay. It installs the full agreed stack, removes the scaffold
artifacts that have no place in the prototype, fixes the folder structure the rest of the project will be
written into (`assets`, `components`, `composables`, `scenes`, `stores`, `utils`), and configures linting,
formatting, the unit-test runner, the Tailwind entry point and the `@/` import alias. It deliberately
implements no combat rule, no rendering and no state: the goal is a clean, correctly-wired starting point,
not a playable scene.

## 2. Daemon System grounding

**No Sistema Daemon mechanic is implemented by this user story.** It touches no attribute, no roll, no
combat resolution and no derived statistic — there is nothing in
[docs/daemon-system-rules-reference.md](../../daemon-system-rules-reference.md) for it to mirror or to
deviate from.

The rules reference is nonetheless what justifies _which_ dependencies enter the project now, so the
traceability is recorded here:

| Mechanic                                                                                     | Rules reference section                               | Notes on how it's used here                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Movement allowances (`AGI` metres defending, `CON × 3` running)                              | §6 Combat → "What one action can be"; §15.7           | Motivates installing the `pathfinding` package in this US; the two movement ranges will become two range queries on the isometric grid. No movement logic is written now. |
| Percentile resolution (`1d100`), initiative (`1d10 + AGI`), damage dice (`1d3`/`1d6`/`1d10`) | §1 Core resolution mechanic; §6 Initiative; §6 Damage | Motivates installing a unit-test runner (Vitest) so these pure formulas can be verified in `src/utils/` once written. No dice or formula code is written now.             |
| Static combat data (weapon `attack/defense`, damage dice, initiative modifier, armour IP)    | §6 Melee weapons table; §4 Protection Index           | Motivates installing the SQLite/WASM driver that the Static Data Layer will query. No schema and no data are authored now.                                                |

No rule is being simplified or deviated from, because no rule is being implemented. The Golden Rule (§14)
is not invoked.

## 3. Goal and value

- **Goal:** establish a working, fully-wired project foundation so that the first gameplay user story can
  begin writing combat logic, rendering and state without stopping to install or configure anything. It
  validates nothing about gameplay; it removes the setup cost from every story that follows.
- **Value:** the spike is time-boxed, and one of its explicit outputs is a time/cost measurement for a
  future full product. Doing the setup once, deliberately, and recording it as its own user story keeps
  that measurement honest — setup effort is attributed here rather than smeared across the first feature.
  It also forces three decisions that were sitting open in the HLD and ADR-0004 (SQLite driver, test
  runner, scene navigation) to be made explicitly rather than by accident.

## 4. Scope

### In scope

- Install the agreed runtime dependencies: `pinia`, `pixi.js`, `gsap`, `pathfinding` (plus
  `@types/pathfinding`), `sql.js` (plus `@types/sql.js`), `tailwindcss`.
- Install the agreed development dependencies: `@tailwindcss/vite`, `vitest`, `eslint`, `@eslint/js`,
  `typescript-eslint`, `eslint-plugin-vue`, `globals`, `eslint-config-prettier`, `prettier`.
- Configure Tailwind CSS v4 through the first-party Vite plugin (`@tailwindcss/vite`) with
  `@import "tailwindcss"` as the CSS entry point — not through PostCSS.
- Configure ESLint as a flat config using `eslint-plugin-vue`'s `flat/recommended`, `typescript-eslint`
  and `eslint-config-prettier`, with `vue-eslint-parser` handling `.vue` files.
- Configure Prettier, and add `lint`, `format` and `test` scripts to `package.json`.
- Configure the `@/` path alias to resolve to `src/` in both `vite.config.ts` and `tsconfig.app.json`.
- Create and commit the folder structure: `src/assets` (with `spritesheets/` and `tilemaps/`),
  `src/components`, `src/composables`, `src/scenes`, `src/stores`, `src/utils` — empty folders held by
  `.gitkeep`.
- Register Pinia on the Vue application in `src/main.ts`.
- Delete the scaffold artifacts: `src/components/HelloWorld.vue`, `src/assets/hero.png`,
  `src/assets/vite.svg`, `src/assets/vue.svg`, `public/icons.svg`.
- Replace `src/style.css` with the Tailwind entry point plus the minimum reset needed for a full-viewport
  canvas later on.
- Reduce `src/App.vue` to an empty shell with no scaffold markup.
- Rewrite `README.md` to describe this prototype (purpose of the spike, stack, how to run it) in English.

### Out of scope

- Any combat rule, formula, dice roll or initiative logic.
- Any PixiJS scene, tile, sprite or canvas rendering.
- Any GSAP animation or timeline.
- Any pathfinding query, grid model or isometric projection math.
- The SQL schema, the seeded SQLite database, the build-time seeding step, and the documented static-JSON
  fallback required by ADR-0004 — the driver is installed, the data layer is not built.
- Validating the SQLite/WASM integration in isolation (the HLD's stated mitigation) — this remains a
  separate user story.
- The title screen and the battle scene as actual screens; `src/scenes/` is created empty.
- Any HUD component, action panel or HP bar.
- Graphic assets of any kind; `src/assets/spritesheets` and `src/assets/tilemaps` are created empty, and
  a prototype favicon is not drawn (the Vite favicon stays for now).
- Netlify deployment configuration.
- `vue-router` — scene switching will be driven by Pinia state instead.

## 5. Functional requirements

1. `npm install` completes with every dependency listed in §4 present in `package.json`, split correctly
   between `dependencies` and `devDependencies`.
2. `npm run build` completes with no TypeScript error and no Vite error.
3. `npm run lint` runs ESLint over `.ts` and `.vue` files and reports no error on the resulting codebase.
4. `npm run format` runs Prettier over the project and leaves the committed files unchanged (the committed
   state is already formatted).
5. `npm run test` invokes Vitest and exits successfully with zero test files found (no test is authored by
   this user story).
6. `npm run dev` starts the dev server and serves a page that renders without any console error. The page
   is intentionally blank.
7. `src/` contains exactly the folders `assets`, `components`, `composables`, `scenes`, `stores` and
   `utils`; each empty folder carries a `.gitkeep` so it survives a clone.
8. An import written as `@/utils/<file>` resolves correctly at build time and is accepted by `vue-tsc`.
9. Pinia is installed on the Vue app instance in `src/main.ts`, so that a store defined by a later user
   story works without further wiring.
10. Tailwind utility classes are available to any component: a class applied in a `.vue` file produces the
    corresponding CSS in the dev server and in the production build.
11. None of the files listed for deletion in §4 remain in the repository, and nothing in `src/` or
    `index.html` still references them.
12. `README.md` describes this prototype, not the Vite template, and is written in English.

## 6. Non-functional requirements

- Every file authored or rewritten by this user story — code, comments, identifiers, configuration and the
  README — must be in English, per the language policy in [CLAUDE.md](../../../CLAUDE.md). Commit messages
  and the pull request description must also be in English.
- The folder structure must keep the HLD's layering visible and enforceable: `utils/` holds pure
  TypeScript with no Vue, Pixi, GSAP or Pinia import; `composables/` holds the reactive layer and is what
  consumes `utils/`; `stores/` holds Pinia state only; `components/` and `scenes/` hold presentation.
- Tailwind must be wired through `@tailwindcss/vite`. The v3-era PostCSS pipeline and a
  `tailwind.config.js` content-globs file are not to be introduced.
- No dependency may be added beyond those listed in §4 — in particular no UI component library, no icon
  pack and no state-persistence plugin.
- The work happens on the existing branch `infra/01-project-initial-setup`; `main` is not committed to
  directly.

## 7. Edge cases

| Edge case                                                                        | Expected behavior                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pathfinding` ships no bundled type declarations                                 | `@types/pathfinding` is installed so `vue-tsc` resolves the module; if the published types turn out to be absent or broken, a minimal local `.d.ts` declaration is added under `src/` and the deviation is noted in the dev report.   |
| `sql.js` requires its `.wasm` binary to be reachable at runtime                  | Only the package is installed in this US; no runtime load is attempted, so no asset-serving configuration is needed yet. Locating the `.wasm` file is explicitly deferred to the data-layer user story.                               |
| Git does not track empty directories                                             | Every empty folder gets a `.gitkeep`, so the structure survives a fresh clone rather than silently collapsing.                                                                                                                        |
| ESLint flat config and the `.vue` parser conflict                                | `vue-eslint-parser` must remain the parser for `.vue` files with `typescript-eslint`'s parser nested under `parserOptions.parser`; overriding the top-level `parser` instead breaks `.vue` linting silently (files lint as if empty). |
| Prettier and ESLint disagree on formatting                                       | `eslint-config-prettier` is placed last in the flat config array so it wins, preventing a lint/format loop where each tool undoes the other.                                                                                          |
| `src/App.vue` left with no content at all                                        | Vue requires a valid single-file component; the shell keeps a minimal valid `<template>` and `<script setup lang="ts">` rather than being an empty file.                                                                              |
| `noUnusedLocals`/`noUnusedParameters` are already enabled in `tsconfig.app.json` | The empty shell must not leave an unused import behind (e.g. a removed `HelloWorld` import), or `npm run build` fails.                                                                                                                |
| Vitest with zero test files                                                      | The `test` script must be configured so an empty run is a success, not a non-zero exit — otherwise the Definition of Done cannot be met until the first test exists.                                                                  |

## 8. Risks and mitigations

| Risk                                                                                                                                                                                       | Likelihood/Impact | Mitigation                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The stack is installed but never exercised, so integration failures (Pixi, GSAP, `sql.js`, `pathfinding`) only surface during the first gameplay story, where they are harder to attribute | High/Medium       | Accepted deliberately: the human chose the minimal Definition of Done to keep this US small. Recorded here as a known consequence; the first gameplay user story should budget time for first-run integration problems. |
| `sql.js` is chosen here without the isolation test the HLD prescribes as the mitigation for the SQLite/WASM risk                                                                           | Medium/Medium     | The choice is cheap to reverse while nothing consumes it. The isolation validation and the static-JSON fallback stay as ADR-0004 action items, scheduled as their own user story before any data work.                  |
| Installing Vitest contradicts [CLAUDE.md](../../../CLAUDE.md), which states the project has no automated test runner                                                                       | High/Low          | Deliberate: the HLD was taken as authoritative. CLAUDE.md must be updated in the same pull request, or the two documents will keep contradicting each other. Tracked in §12.                                            |
| Tailwind v4 configuration is applied from v3-era memory (PostCSS plugin, `tailwind.config.js` content globs), producing a build that silently emits no utilities                           | Medium/Medium     | The v4 Vite-plugin setup was confirmed against current Tailwind documentation. Requirement 10 makes "a utility class actually produces CSS" part of the Definition of Done rather than assumed.                         |
| Deleting scaffold files breaks a reference left behind in `index.html` or `src/`                                                                                                           | Low/Low           | Requirement 11 makes absence of dangling references explicit, and `npm run build` plus a console-clean `npm run dev` would surface a broken asset path.                                                                 |
| Scope creep: adding a scene, a store or a sprite "while we're in there"                                                                                                                    | Medium/Medium     | §4's out-of-scope list is explicit, and the Definition of Done contains no runtime behavior to tempt it.                                                                                                                |

## 9. Dependencies

- **Depends on:** nothing. This is the first user story in the project and has no upstream work.
- **Blocks:** every subsequent user story. No gameplay, rendering, state or data work can start until the
  stack is installed and the folder structure exists.
- **Decisions it consumes:** ADR-0001 (PixiJS as renderer), ADR-0002 (`pathfinding` package), ADR-0003
  (GSAP for all animation), ADR-0004 (SQLite via WASM for static data).
- **Decisions it makes that are not yet recorded in an ADR:** `sql.js` as the SQLite/WASM driver (closes
  ADR-0004's first action item, and should be recorded as an amendment to it); Vitest as the test runner
  (resolving the HLD/CLAUDE.md contradiction in the HLD's favour); Pinia-driven scene switching instead of
  `vue-router`.

## 10. Definition of Done

- [ ] All dependencies from §4 are present in `package.json`, correctly split between `dependencies` and
      `devDependencies`, with a committed `package-lock.json`.
- [ ] `npm run build` exits successfully with no TypeScript or Vite error.
- [ ] `npm run lint` exits successfully with no ESLint error.
- [ ] `npm run format` leaves the committed files unchanged.
- [ ] `npm run test` exits successfully (zero test files is a pass).
- [ ] `npm run dev` serves a blank page with no error in the browser console.
- [ ] `src/` contains `assets`, `components`, `composables`, `scenes`, `stores` and `utils`, with
      `.gitkeep` in each otherwise-empty folder, and `assets/spritesheets` plus `assets/tilemaps` present.
- [ ] A throwaway import using the `@/` alias type-checks, confirming the alias works in both Vite and
      `vue-tsc` (the throwaway is removed before the final commit).
- [ ] Pinia is registered on the app instance in `src/main.ts`.
- [ ] A Tailwind utility class applied in a component produces the expected CSS in both `npm run dev` and
      `npm run build`.
- [ ] `HelloWorld.vue`, `hero.png`, `vite.svg`, `vue.svg` and `public/icons.svg` are gone, with no
      remaining reference to any of them.
- [ ] `src/style.css` is the Tailwind entry point and contains no scaffold demo styling.
- [ ] `README.md` describes this prototype's purpose, stack and how to run it, in English.
- [ ] [CLAUDE.md](../../../CLAUDE.md) is updated so its statement about the test runner matches the
      decision recorded in §9.
- [ ] All work is committed on `infra/01-project-initial-setup`, with nothing committed directly to `main`.

## 11. Manual verification plan

1. From a clean checkout of `infra/01-project-initial-setup`, run `npm install` and confirm it completes
   without an unmet-peer-dependency error.
2. Run `npm run lint` and confirm a zero exit code with no reported error.
3. Run `npm run format` followed by `git status` and confirm the working tree is clean — Prettier found
   nothing to change.
4. Run `npm run test` and confirm Vitest exits successfully, reporting no test files.
5. Run `npm run build` and confirm `vue-tsc` and Vite both succeed and `dist/` is produced.
6. Run `npm run dev`, open the served URL, and confirm the page renders blank with an empty browser
   console (no 404 for a deleted asset, no Vue warning).
7. Temporarily add a `<div class="text-red-500">test</div>` to `src/App.vue`; confirm in the browser that
   the text is actually red (proving Tailwind compiles), then revert the change.
8. Temporarily create `src/utils/alias-check.ts` exporting a constant, import it in `src/App.vue` as
   `@/utils/alias-check`, run `npm run build`, confirm it type-checks, then delete both the file and the
   import.
9. Inspect `src/` in the file explorer and confirm the six folders exist and that `.gitkeep` files are
   tracked by git (`git ls-files src/`).
10. Search the repository for `HelloWorld`, `hero.png`, `vite.svg`, `vue.svg` and `icons.svg` and confirm
    there are no matches outside this spec and the dev report.
11. Read `README.md` and confirm it describes the prototype in English and that its run instructions match
    the actual scripts in `package.json`.

## 12. Open questions

1. **Vitest vs. CLAUDE.md.** The HLD lists Vitest as a main technology; CLAUDE.md states the project has
   no automated test runner. The human resolved this in the HLD's favour for implementation purposes, so
   CLAUDE.md must be corrected — otherwise the next contributor (human or agent) will read a false
   statement. Decided: correct CLAUDE.md. Still open: whether the HLD's narrower framing ("unit tests for
   combat formulas" only, i.e. `src/utils/`) should be written into CLAUDE.md as the boundary.
2. **`sql.js` and ADR-0004.** Choosing `sql.js` closes action item 1 of ADR-0004, but ADR-0004 was written
   without that choice. Should this be an amendment to ADR-0004 or a new ADR? The `architecture` skill is
   the right tool for either.
3. **SQLite/WASM isolation test.** The HLD prescribes validating the integration in isolation _before_
   populating data, and ADR-0004 repeats it as action item 4. This user story installs the driver but
   performs no validation, so that mitigation is currently unscheduled and needs its own user story.
4. **Prototype favicon.** `public/favicon.svg` remains the Vite default. A prototype icon is a task for
   the `graphic-designer` skill and is unscheduled.
5. **Netlify deployment.** The HLD names Netlify free tier as the deployment target, but no deployment
   configuration is created by this user story and no deployment user story exists yet.

## 13. Interview notes

| #   | Question                                                                                                                                                                                              | Answer                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The proposed structure (`assets`, `composables`, `utils`, `scenes`) omits where Pinia stores and HUD components live, though the HLD treats both as distinct components. How should this be resolved? | Add `src/stores` for Pinia stores and keep `src/components` for the Vue + Tailwind HUD, so the state/logic/presentation split is visible in the folder tree.                                                    |
| 2   | The HLD lists Vitest among the main technologies, but CLAUDE.md says there is no automated test runner. Should the setup install Vitest?                                                              | Install Vitest — the HLD prevails. CLAUDE.md is to be updated accordingly.                                                                                                                                      |
| 3   | ADR-0004 leaves "choose the driver (sql.js vs wa-sqlite)" as an open action item. Should the setup resolve it and install the driver?                                                                 | Install `sql.js` now. The isolation validation that the HLD prescribes stays a separate user story.                                                                                                             |
| 4   | With only two scenes (title screen and battle), how should the application switch between them?                                                                                                       | Via state held in a Pinia store, with no `vue-router`.                                                                                                                                                          |
| 5   | How should the setup prove it worked, given that installing dependencies produces nothing observable? How much of a "living skeleton" should this US build?                                           | Minimum scope only: `npm run lint`, `npm run build` and `npm run dev` pass, folders created with `.gitkeep`, boilerplate removed. No Pixi/GSAP smoke test.                                                      |
| 6   | Which scaffold files should be removed?                                                                                                                                                               | `HelloWorld.vue` plus the demo assets (`hero.png`, `vite.svg`, `vue.svg`, `public/icons.svg`); `src/style.css` replaced by the Tailwind entry point; `README.md` rewritten. `public/favicon.svg` stays for now. |
| 7   | Should the `@/` alias pointing at `src/` be configured in `vite.config.ts` and `tsconfig.app.json`?                                                                                                   | Yes — configure it now to avoid refactoring imports later.                                                                                                                                                      |

## 14. Token usage and estimated cost

| Metric               | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Model                | `claude-opus-5` (spec authoring); the first few turns of the session ran on `claude-sonnet-5` |
| Input tokens         | ~255,000 (estimated, cumulative across the session; dominated by prompt-cache reads)          |
| Output tokens        | ~16,000 (estimated)                                                                           |
| Estimated cost (USD) | ~$1.68                                                                                        |
| Estimated cost (BRL) | ~R$9.10                                                                                       |

- **These figures are estimates, not measurements.** The agent has no access to the session's billing
  counters, so input and output token counts are approximations of the cumulative session total, not of
  this document alone.
- Pricing applied: `claude-opus-5` at **$5.00 / 1M input tokens** and **$25.00 / 1M output tokens**
  (Anthropic first-party API rates).
- BRL conversion uses an assumed rate of **R$5.40 per US$1.00**; the actual rate on the invoicing date will
  differ.
- Cost drivers in this session: reading the Daemon rules reference (578 lines), the HLD, ADR-0004 and the
  spec template; two Context7 documentation queries (Tailwind v4 Vite setup, `eslint-plugin-vue` flat
  config); and seven interview rounds.
