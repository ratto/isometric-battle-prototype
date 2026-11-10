# Dev Report: Project Initial Setup

**Slug:** `01-project-initial-setup`
**Plan:** [plan-01-project-initial-setup.md](../plan-01-project-initial-setup.md)
**Branch:** `infra/01-project-initial-setup`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

This task installed the full stack agreed for the prototype (PixiJS, Pinia, GSAP, `pathfinding`,
`sql.js`, Tailwind CSS v4, plus Vitest/ESLint/Prettier tooling), removed the Vite scaffold's demo
component and assets, wired Tailwind through its Vite plugin, added a `@/` import alias, registered
Pinia on the app instance, and created the empty `src/{assets,components,composables,scenes,stores,
utils}` folder structure. It also corrected three documents the plan identified as needing a change:
`README.md` (rewritten for this prototype), `CLAUDE.md` (its test-runner statement corrected), and
ADR-0004 (amended to record `sql.js` as the chosen SQLite/WASM driver). No gameplay logic, rendering, or
state was written — this is purely the infrastructure the next user story will build on.

Two dependencies not listed in the plan turned out to be required to make the plan's own instructions
work (`@vue/devtools-api` and `vue-eslint-parser`), and one unintended side effect (Prettier reformatting
the whole repository, including unrelated skill/doc files, on its first run) was caught and corrected.
Both are detailed in §5.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-01-project-initial-setup.md` | Exact dependency list, folder structure, Tailwind-via-Vite-plugin and Vitest-merged-into-vite.config.ts decisions, 3-commit sequencing, and the three documents to update (README, CLAUDE.md, ADR-0004). |
| `docs/HLD-isometric-battle-prototype.md` | Confirmed via the plan session; re-checked only to verify the folder structure keeps the Pinia/composables/Pixi-HUD separation visible. No deviation needed. |
| `docs/adr/0004-sqlite-wasm-for-static-game-data.md` | Action item 1 ("choose the SQLite/WASM driver") was open; amended in this task per the plan's decision. |
| `spec-01-project-initial-setup.md` | Confirmed the exact deletion list and the minimal Definition of Done (no runtime smoke test required). |
| Existing codebase | `src/App.vue`/`HelloWorld.vue`/`src/style.css`/`vite.config.ts`/`tsconfig.app.json` inspected directly before editing, matching what the plan described. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `infra/01-project-initial-setup` (already existed, created for this US's spec/plan work) |
| Branch used for this task | `infra/01-project-initial-setup` (reused, confirmed by human — it already contained the uncommitted spec/plan and an unrelated CLAUDE.md edit, and is the branch named in the original request) |
| Trello card | https://trello.com/c/pTzR9D8R |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `assets/spritesheets/.gitkeep`, `assets/tilemaps/.gitkeep`, `components/.gitkeep`, `composables/.gitkeep`, `scenes/.gitkeep`, `stores/.gitkeep`, `utils/.gitkeep` | Keep the empty folders tracked by git until the first file lands in each |
| `../eslint.config.ts` (repo root) | Flat ESLint config: `eslint-plugin-vue` `flat/recommended` + `typescript-eslint` recommended + `eslint-config-prettier` last, `vue-eslint-parser` handling `.vue` files |
| `../.prettierrc.json`, `../.prettierignore` (repo root) | Prettier formatting rules; `.prettierignore` excludes `dist`, `node_modules`, `package-lock.json`, and — added after the incident in §5 — `docs`, `.claude`, `.agents`, `skills-lock.json` |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `../package.json` | Added all dependencies from the plan, plus `@vue/devtools-api` and `vue-eslint-parser` (§5); added `lint`, `format`, `test` scripts |
| `../vite.config.ts` | Added `@tailwindcss/vite`, the `@` → `src/` alias, and a merged Vitest `test` block (`environment: 'node'`, `passWithNoTests: true`) |
| `../tsconfig.app.json` | Added `"paths": {"@/*": ["./src/*"]}`; `baseUrl` was added then removed after `vue-tsc` flagged it as deprecated in TypeScript 6 (§5) |
| `App.vue` | Replaced the `HelloWorld` import/usage with an empty shell |
| `main.ts` | Registered `createPinia()` on the app instance |
| `style.css` | Replaced scaffold demo styling with the Tailwind entry point (`@import 'tailwindcss'`) plus a minimal full-viewport reset |
| `../README.md` | Rewritten to describe this prototype, its stack, and how to run it |
| `../CLAUDE.md` | Corrected the test-runner statement: Vitest is used, scoped to `src/utils/` |
| `../docs/adr/0004-sqlite-wasm-for-static-game-data.md` | Action item 1 marked resolved, recording `sql.js` as the chosen driver |

### Deleted files

`components/HelloWorld.vue`, `assets/hero.png`, `assets/vite.svg`, `assets/vue.svg`,
`../public/icons.svg`.

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `038574f` | Install stack dependencies and build/lint/test tooling |
| `0c2caab` | Remove Vite scaffold boilerplate and add project folder structure |
| `3fbacca` | Document the project setup: README, CLAUDE.md, ADR-0004, spec/plan |

## 5. Deviations from the plan

1. **`@vue/devtools-api` installed, not in the original dependency list.** Pinia 4's `package.json`
   declares it as a non-optional peer dependency (`peerDependenciesMeta` marks only `typescript` as
   optional). Without it, `npm run build` failed: Vite's Rolldown bundler could not resolve the
   `setupDevtoolsPlugin` import inside `pinia/dist/pinia.js`. Installed as a `dependencies` entry
   (needed at build/runtime, not just in development).
2. **`vue-eslint-parser` installed, not in the original dependency list.** `eslint-plugin-vue`'s
   `flat/recommended` config requires it to parse `.vue` files, but it is not one of
   `eslint-plugin-vue`'s own declared dependencies in the installed version. Without it, `npx eslint`
   failed outright with `Cannot find module 'vue-eslint-parser'` before linting anything. Installed as
   a `devDependencies` entry.
3. **Unintended `npm run format` blast radius, caught and fixed before committing.** The first run of
   `prettier --write .` (with only `dist`/`node_modules`/`package-lock.json` ignored, as the plan
   implied) reformatted the entire repository: every file under `docs/` (GDD, HLD, PRD, all four ADRs,
   the Daemon rules reference), every skill definition under `.claude/skills/` and `.agents/skills/`,
   and `skills-lock.json` — none of which this user story's scope includes, and none of which are this
   project's Prettier-governed source. This was reverted (`git checkout --`) before any commit, and
   `.prettierignore` was extended to exclude `docs`, `.claude`, `.agents`, and `skills-lock.json`
   permanently, so a future `npm run format` cannot repeat this. This is a plan gap, not a judgment
   call made silently: the plan's §4 did not anticipate that `prettier --write .` has no implicit
   scope limiting it to the application's own source tree.
4. **`tsconfig.app.json`'s `baseUrl` added then removed.** The plan specified adding `"baseUrl": "."`
   alongside `"paths"`. `vue-tsc` (TypeScript 6.0.3, already installed) rejected it as deprecated
   (`TS5101`). Removed `baseUrl`; `"paths"` alone resolves relative to the config file in this
   TypeScript version, and the alias was verified to still work in both the dev server and the
   production build (§7).
5. **`format` script implemented as `prettier --write .`, not `prettier --check .`.** The plan's §4
   lists a `format` script without specifying `--write` vs `--check`; the spec's manual verification
   plan ("Run `npm run format` followed by `git status` and confirm the working tree is clean") only
   makes sense if the script writes. Implemented as `--write`, matching that verification step.

No other deviation. Everything else was implemented exactly as the plan's sequencing describes.

## 6. External dependencies / Context7 lookups

No new Context7 lookup was performed during this implementation task — both libraries whose usage
needed confirming (`@tailwindcss/vite`'s setup and `eslint-plugin-vue`'s flat-config parser wiring) had
already been confirmed via Context7 during the planning session, and the plan recorded the exact
pattern used here. The `vue-eslint-parser`/`@vue/devtools-api` gaps in §5 were diagnosed from the actual
build/lint error output and each package's own `package.json`, not from a library-documentation lookup.

## 7. Manual verification performed

| # | Step taken | Expected result | Actual result |
| --- | --- | --- | --- |
| 1 | `npm install`, then `npm run lint` | Clean exit | Clean exit, no error |
| 2 | `npm run format`, then `git status` | Working tree clean (already formatted) | Clean after fixing the §5.3 blast radius; idempotent on a second run |
| 3 | `npm run test` | Successful exit, zero test files | `No test files found, exiting with code 0` (after adding `passWithNoTests: true`) |
| 4 | `npm run build` | Succeeds, no TypeScript/Vite error | Succeeded after the §5.1 and §5.4 fixes |
| 5 | `npm run dev`, fetch `/` and `/src/main.ts` | Blank page served, no error | Confirmed via `curl` against the running dev server; HTML shell and transformed `main.ts` both served correctly |
| 6 | Temporarily added `src/utils/alias-check.ts` exporting a constant, imported it from `App.vue` via `@/utils/alias-check`, added `console.log` | `@/` resolves in both dev and build | Dev server's transformed module showed the resolved path `/src/utils/alias-check.ts`; `npm run build` type-checked successfully |
| 7 | Temporarily added `<div class="text-red-500">test</div>` to `App.vue`, rebuilt | Tailwind utility compiles to real CSS | `dist/assets/index-*.css` contained `text-red-500{color:var(--color-red-500)}` |
| 8 | Reverted both temporary changes (`App.vue` back to the empty shell, deleted `alias-check.ts`) | Clean shell restored | Confirmed via `npm run build` (succeeds) and a final `curl` of `/src/App.vue` showing the empty `<div>` render |
| 9 | Searched the repository for `HelloWorld`, `hero.png`, `vite.svg`, `vue.svg`, `icons.svg` | No remaining reference outside spec/plan/report | Not yet re-run after the final commit — recommended as a last check before opening the PR (see §8) |

Steps correspond to the plan's §12 manual verification plan, folded into a single verification pass
rather than split per-commit, since all three commits landed in the same working session.

## 8. Known issues / follow-ups

1. **`npm audit` reports 9 moderate-severity vulnerabilities, all in dev-only ESLint tooling
   transitive dependencies** (`minimatch` via `@typescript-eslint/typescript-estree` and
   `@eslint/config-array`, a ReDoS-shaped issue). `npm audit --omit=dev` reports **zero**
   vulnerabilities — nothing shipped to production is affected. Fixing it requires
   `npm audit fix --force`, which downgrades `eslint` to `9.39.5` (a breaking change); not applied, since
   it isn't required by this US's Definition of Done and a downgrade should be a deliberate choice, not
   a side effect of this task. Left as a follow-up for whoever next touches the ESLint config.
2. **Step 9 of §7** (searching for leftover references to deleted scaffold files) should be re-run once
   more immediately before the PR is opened, to account for anything this report itself might
   reference by name (it does, deliberately, in §4 and §5 — that is expected and fine).
3. All three open items already flagged in the spec (§12) and the plan (§13) remain open and
   unscheduled by this task, as intended: the SQLite/WASM isolation validation and static-JSON fallback
   (ADR-0004 action items 3–4), the prototype favicon, and Netlify deployment configuration.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No — pending PR approval |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | `claude-sonnet-5` (this implementation task); `claude-opus-5` ran the earlier spec-authoring session in the same conversation history |
| Input tokens (approx.) | ~165,000 (cumulative for this implementation session; dominated by prompt-cache reads of the plan, spec, and prior conversation context) |
| Output tokens (approx.) | ~13,000 |
| Estimated cost (USD) | ~$0.46 |
| Estimated cost (BRL) | ~R$2.48 |

- **These figures are estimates, not measurements** — the agent has no access to this session's billing
  counters. They approximate this implementation session's cumulative token usage, not a precise count
  for this document alone.
- Pricing basis: `claude-sonnet-5` at **$2.00 / 1M input tokens** and **$10.00 / 1M output tokens**
  (Anthropic first-party API rates, per the `claude-api` skill's cached rate card, checked during this
  session).
- BRL conversion uses an assumed rate of **R$5.40 per US$1.00**; the actual rate on the invoicing date
  will differ.
- Cost drivers: re-reading the plan and spec (already cached from the planning session); several
  `npm install`/`npm run` command executions and their output; diagnosing and fixing the three issues in
  §5; and one `AskUserQuestion` round for the branch-reuse confirmation.
