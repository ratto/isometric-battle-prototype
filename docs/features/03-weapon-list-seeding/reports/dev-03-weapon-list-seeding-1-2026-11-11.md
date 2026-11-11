# Dev Report: Weapon List Seeding

**Slug:** `03-weapon-list-seeding`
**Plan:** [plan-03-weapon-list-seeding.md](../plan-03-weapon-list-seeding.md)
**Branch:** `feature/03-weapon-list-seeding`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-11

## 1. Summary

Implements the first slice of the static data layer promised by ADR-0004: a `WEAPONRY` table in a
SQLite database (`sql.js`), seeded from a curated JSON dataset of 80 medieval melee/ranged weapons, with
three CLI scripts (`db:reset`, `db:seed`, `db:inspect`) run via `tsx`. The committed `.sqlite` file is
produced by these scripts and ships as a regular repository file. No application code reads this data
yet — the deliverable is the schema, the data, and the tooling, exactly as scoped by the spec and plan.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-03-weapon-list-seeding.md` | Primary source of truth for file layout, the `WEAPONRY` DDL, the upsert-by-slug seeding mechanism, the `WeaponSkillGroup` enum, and the implementation sequencing followed step by step. |
| `docs/HLD-isometric-battle-prototype.json`/`.md` | Confirmed the Static Data Layer is a leaf data source with no store/composable/HUD dependency — no deviation needed. |
| `docs/adr/0004-sqlite-wasm-for-static-game-data.md` | Confirmed `sql.js` as the chosen driver; this implementation closes two of its open action items (schema definition, SQLite+WASM validated in isolation) for the `WEAPONRY` table specifically. |
| `spec-03-weapon-list-seeding.md` | Confirmed scope boundaries (no shields, no firearms, no consumer code) already baked into the plan. |
| Existing codebase | No prior database code existed; `sql.js`/`@types/sql.js` were already installed but unused at runtime. `tsconfig.app.json` had `erasableSyntaxOnly: true`, which the plan already flagged as needing removal for the `enum` to compile. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/03-weapon-list-seeding` |
| Branch used for this task | `feature/03-weapon-list-seeding` (already existed, confirmed by the human before implementation started) |
| Trello card | https://trello.com/c/Ogs5ALLr/3-03-weapon-list-seeding |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to repo root) | Purpose |
| --- | --- |
| `src/utils/weaponSkillGroup.ts` | The `WeaponSkillGroup` TypeScript enum (14 members) plus `WEAPON_SKILL_GROUP_DESCRIPTIONS`, a `Record` mapping each enum value to its human-readable description. |
| `src/utils/weapon.ts` | The `Weapon` interface mirroring the `WEAPONRY` row shape, for future reuse by any composable that queries this table. |
| `scripts/db/schema.ts` | `WEAPONRY` table DDL (`CREATE TABLE IF NOT EXISTS` / `DROP TABLE IF EXISTS`) and the `ensureWeaponrySchema(db)` helper. |
| `scripts/db/types.ts` | `SqlJsStatic`/`Database` type aliases derived from `initSqlJs`'s return type, since `sql.js`'s `@types` package exports only the default `initSqlJs` function (`export =`), not these types by name. |
| `scripts/db/sqliteFile.ts` | Shared helper: initializes `sql.js` in Node with an explicit `locateFile` pointing at `node_modules/sql.js/dist/`, opens/creates `src/data/game-data.sqlite`, exposes `saveDatabase()` and `listTableNames()`. |
| `scripts/db/reset.ts` | `db:reset` entry point — drops and recreates the `WEAPONRY` table. |
| `scripts/db/seed.ts` | `db:seed` entry point — reads `scripts/db/data/weapons.json` and runs an `INSERT ... ON CONFLICT(slug) DO UPDATE` per weapon. |
| `scripts/db/inspect.ts` | `db:inspect` entry point — enumerates all tables via `sqlite_master` and prints every row of each as JSON. |
| `scripts/db/data/weapons.json` | The seed script's canonical input: the 80-weapon dataset from `docs/features/03-weapon-list-seeding/weapons-seed-data.json`, with field names converted to the DB's `snake_case` columns. |
| `src/data/game-data.sqlite` | The committed, binary SQLite file produced by `db:reset` + `db:seed`. Not imported by any code yet. |
| `tsconfig.scripts.json` | New tsconfig covering `scripts/**/*.ts`, referenced from the root `tsconfig.json`, without `erasableSyntaxOnly`. |

### Modified files/modules

| Path (relative to repo root) | Change |
| --- | --- |
| `tsconfig.app.json` | Removed `"erasableSyntaxOnly": true`, so `src/utils/weaponSkillGroup.ts`'s `enum` declaration compiles. |
| `tsconfig.json` | Added `tsconfig.scripts.json` to `"references"`, so `npm run build`'s `vue-tsc -b` also type-checks `scripts/`. |
| `package.json` | Added devDependency `tsx`; added `db:reset`, `db:seed`, `db:inspect` npm scripts. |
| `README.md` | "Getting started" section lists the three new commands; "Project structure" now mentions `src/data/` and `scripts/db/`. |

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `368b779` | Add spec and curated weapon data for 03-weapon-list-seeding *(from the spec phase, not this task)* |
| `3db25c3` | Add technical plan for 03-weapon-list-seeding *(from the plan phase, not this task)* |
| `1cda218` | Implement WEAPONRY static data seeding |

## 5. Deviations from the plan

None — implemented exactly as planned, including the sequencing order (spike → tsconfig changes →
`src/utils` types → schema/file helpers → reset → data copy → seed → idempotency check → inspect →
README → commit).

One detail resolved during implementation that the plan left open: `@types/sql.js` declares `Database`
and `SqlJsStatic` as ambient, non-exported identifiers (the module uses `export = initSqlJs`), so they
cannot be imported by name. Resolved by deriving them locally in `scripts/db/types.ts` via
`Awaited<ReturnType<typeof initSqlJs>>` and `InstanceType<SqlJsStatic['Database']>`, rather than
importing them directly as the plan's prose implied.

## 6. External dependencies / Context7 lookups

None. `sql.js`'s Node-side initialization (`locateFile` override) was verified empirically via the
plan's sequencing-step-1 spike rather than via a Context7 documentation lookup, as the plan anticipated.

## 7. Manual verification performed

| # | Step taken | Expected result | Actual result |
| - | --- | --- | --- |
| 1 | Ran a throwaway Node script calling `initSqlJs` with an explicit `locateFile`, creating a table, inserting a row, exporting to a `Buffer`, and re-importing it | A successful round-trip with no WASM-loading error | Passed — printed `SPIKE OK`; script deleted afterward |
| 2 | `npm run db:reset` | Creates `src/data/game-data.sqlite` with an empty `WEAPONRY` table | Passed — file created, log confirmed |
| 3 | `npm run db:seed` | Reports inserting 80 weapons (the dataset's length) | Passed — "Seeded 80 weapons into WEAPONRY" |
| 4 | `npm run db:seed` again, no reset in between | Row count unchanged (upsert, not duplicate insert) | Passed — `db:inspect` confirmed exactly 80 rows both times |
| 5 | `npm run db:inspect` | Prints every `WEAPONRY` row; spot-checked `longsword`, `short-bow`, and `staff` (the GDD's "Cajado") against the seed JSON | Passed — all three rows matched expected values |
| 6 | `npm run build` (`vue-tsc -b` across all three tsconfig projects + `vite build`) | Passes with the `erasableSyntaxOnly` removal and the new `tsconfig.scripts.json` | Passed |
| 7 | `npm run lint` | No errors | Passed, zero output |
| 8 | `npm run format` | No unintended changes to unrelated files committed (prettier touched several pre-existing files with no real content diff, due to CRLF normalization noise; reverted via `git checkout` before committing) | Verified via `git diff` showing empty diffs on those files; reverted cleanly |
| 9 | Repo check | `src/data/game-data.sqlite` committed; `README.md` lists the three commands | Passed |

## 8. Known issues / follow-ups

- **Outside this task's scope, flagged by the plan:** `docs/GDD-isometric-battle-prototype.md` still
  describes a "Gunslinger" class and its "Pistola" weapon; the human decided this class should be removed
  from the GDD entirely. Not done here — tracked as a follow-up.
- **Dataset sync:** `scripts/db/data/weapons.json` (code-facing) and
  `docs/features/03-weapon-list-seeding/weapons-seed-data.json` (spec-facing) must be kept in sync
  manually if either is edited later — no tooling enforces this, per the plan's accepted trade-off.
- Re-running `db:reset` + `db:seed` during manual verification produced a byte-different but
  logically-identical `.sqlite` file each time (same row count/content, different binary layout) —
  expected `sql.js` export non-determinism, not a bug; the committed file was left at its first verified
  state rather than re-committing a no-op binary diff repeatedly.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No (pending PR) |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens (approx.) | Not precisely measurable from within this session — no Admin Usage API access was available. |
| Output tokens (approx.) | Not precisely measurable from within this session, for the same reason. |
| Estimated cost (USD) | Not computed, since no reliable token counts were available. |
| Estimated cost (BRL) | Not computed, for the same reason. |

- Confirmed pricing (carried over from the spec/plan's own research): Claude Sonnet 5 — **US$ 2.00 / 1M
  input tokens**, **US$ 10.00 / 1M output tokens**.
- This implementation session's main cost drivers were: reading the plan and prior spec; running the
  `sql.js`-in-Node spike and several `npm run` verification commands (each with moderate terminal
  output); writing ~10 new TypeScript/config files; and investigating/discarding the prettier-induced
  CRLF noise across unrelated files before committing.
