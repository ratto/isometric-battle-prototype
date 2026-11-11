# Technical Plan: Weapon List Seeding

**Slug:** `03-weapon-list-seeding`
**Spec:** [spec-03-weapon-list-seeding.md](spec-03-weapon-list-seeding.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-11

## 1. Summary

This plan stands up the first slice of the static data layer promised by
[ADR-0004](../../adr/0004-sqlite-wasm-for-static-game-data.md): a `WEAPONRY` table in a SQLite database
(`sql.js`), populated from a curated JSON dataset of medieval melee/ranged weapons, with CLI scripts to
reset the schema, (re)seed it idempotently, and inspect its contents. No application code (Pinia store,
composable, Pixi/HUD component) consumes this data yet — the deliverable is the schema, the data, and
the tooling to produce the versioned `.sqlite` file that ships with the Netlify build.

Two project-level technical constraints, found while reviewing the codebase rather than the spec, shape
this plan: `tsconfig.app.json` sets `erasableSyntaxOnly: true`, which rejects the `enum` keyword outright
(the human explicitly chose to keep `enum` and relax this constraint rather than switch to a
union-of-string-literals design); and there is currently no tooling in the project for running
TypeScript files outside Vite/Vitest, so a new script runner (`tsx`) and a new `tsconfig` project are
introduced.

## 2. Source documents reviewed

| Document | Key takeaways for this plan |
| --- | --- |
| `spec-03-weapon-list-seeding.md` | Defines the `WEAPONRY` columns, the `WeaponSkillGroup` groups, the `db:reset`/`db:seed`/`db:inspect` behavior (idempotent upsert by `slug`), and that the `.sqlite` file must be committed to the repo. No consumer code in scope. |
| Trello card (`03-weapon-list-seeding`, list: Backlog) | No additional context beyond the spec — description and checklist mirror the spec's Definition of Done. |
| `docs/GDD-isometric-battle-prototype.md` | Found two gaps the spec's dataset didn't cover: the Mage class and Goblin Shaman monster use a "Cajado" (Staff, `1d6`) not present in the original dataset — added during this planning phase (see §14). The Gunslinger class's "Pistola" is explicitly a non-Daemon firearm; the human decided to **drop the Gunslinger class from the GDD entirely** rather than add it to `WEAPONRY` — that GDD edit is a follow-up outside this plan's scope (§13). |
| `docs/HLD-isometric-battle-prototype.json`/`.md` | Confirms the Static Data Layer is a leaf data source (no dependencies), seeded at build time, queried client-side; schema format was still an explicit open decision — this plan resolves it for `WEAPONRY` only. |
| `docs/adr/0004-sqlite-wasm-for-static-game-data.md` | `sql.js` was already chosen as the driver (resolved in `01-project-initial-setup`); its action items explicitly still list "define the SQL schema" and "validate the SQLite + WASM integration in isolation" as open — this plan is the first to close them, for one table. |
| Current codebase | No `src/data`, `scripts/`, or database-related code exists yet — this is a clean slate. `package.json` has no `tsx`/`ts-node`/`better-sqlite3`; only `sql.js` (+ `@types/sql.js`) is installed. `tsconfig.app.json` has `erasableSyntaxOnly: true` (blocks `enum`); `tsconfig.node.json` only covers `vite.config.ts`; the root `tsconfig.json` references both via `"references"`. `vite.config.ts` aliases `@` to `src/`. |

## 3. Architecture fit

This feature lives entirely in the "Static Data Layer" box of the HLD — a leaf, read-only data source
with no dependency on Pinia, composables, or the Pixi/HUD layers. It does not touch the
store ↔ composable ↔ renderer pipeline at all: there is no store to update and no UI to render, per the
spec's explicit scope cut. The one architectural extension this plan makes beyond what CLAUDE.md
documents is introducing a build-time/dev-time tooling layer (`scripts/db/`) that runs under Node via
`tsx`, parallel to (not inside) the Vite-built `src/` application — this mirrors how the HLD already
describes the data as "seeded at build time," which implies tooling that runs outside the browser
runtime.

## 4. Affected surface

### New files/modules

| Path (relative to repo root) | Purpose |
| --- | --- |
| `src/utils/weaponSkillGroup.ts` | The `WeaponSkillGroup` enum (13 members: dagger, sword, axe, mace, staff, hammer, flail, whip, spear, polearm, bow, crossbow, thrown, exotic) plus a `WEAPON_SKILL_GROUP_DESCRIPTIONS: Record<WeaponSkillGroup, string>` lookup, so the id and its description live next to each other without requiring a DB table. |
| `src/utils/weapon.ts` | The `Weapon` TypeScript interface mirroring the `WEAPONRY` row shape (see §8), shared between the seed script's type-checking and any future composable that reads this table. |
| `scripts/db/schema.ts` | The `WEAPONRY` table DDL (`CREATE TABLE` statement) as a plain exported string/function, plus a small `ensureSchema(db)` helper used by both `reset.ts` and (defensively) `seed.ts`. |
| `scripts/db/sqliteFile.ts` | Shared helper: initializes `sql.js` in a Node context (explicit `locateFile` pointing at `node_modules/sql.js/dist/sql-wasm.wasm`), opens `src/data/game-data.sqlite` if it exists (else starts a fresh in-memory DB), and exposes a `save(db)` that exports the DB to a `Buffer` and writes it back to that path. |
| `scripts/db/reset.ts` | CLI entry point for `db:reset` — opens/creates the file via `sqliteFile.ts`, drops `WEAPONRY` if it exists, recreates it via `schema.ts`, saves. |
| `scripts/db/seed.ts` | CLI entry point for `db:seed` — opens the file, ensures the schema exists, reads `scripts/db/data/weapons.json`, runs one `INSERT INTO WEAPONRY (...) VALUES (...) ON CONFLICT(slug) DO UPDATE SET ...` per weapon, logs how many rows were inserted/updated, saves. |
| `scripts/db/inspect.ts` | CLI entry point for `db:inspect` — opens the file, queries `sqlite_master` for all user tables, then `SELECT *` on each and pretty-prints the rows. |
| `scripts/db/data/weapons.json` | The canonical seed input consumed by `seed.ts` — a copy of the `weapons` array curated in [weapons-seed-data.json](weapons-seed-data.json) (that file stays in `docs/features/03-weapon-list-seeding/` as the spec's research record; this is its "production" counterpart, versioned alongside the code that reads it). |
| `src/data/game-data.sqlite` | The committed, binary SQLite database file. Named generically (not `weaponry.sqlite`) because ADR-0004 intends to reuse one file for `ITEMS`/`UPGRADES`/`SPELLS` later. Not imported by any code yet — just present on disk for a future composable to `import weaponsDbUrl from '@/data/game-data.sqlite?url'`. |
| `tsconfig.scripts.json` | New root-level tsconfig covering `scripts/**/*.ts`, `types: ["node"]`, `noEmit: true`, **without** `erasableSyntaxOnly`, so `scripts/db/*.ts` (and anything they import from `src/utils/`) type-check correctly with `enum` in the program. |

### Modified files/modules

| Path (relative to repo root) | Change |
| --- | --- |
| `tsconfig.app.json` | Remove `"erasableSyntaxOnly": true` so `src/utils/weaponSkillGroup.ts`'s `enum` declaration type-checks under the app's own program (the file is `src/`-local and reachable from any future composable/component import). |
| `tsconfig.json` | Add a third entry to `"references"` pointing at `./tsconfig.scripts.json`, so `npm run build`'s `vue-tsc -b` also type-checks `scripts/`. |
| `package.json` | Add devDependency `tsx`; add `"db:reset": "tsx scripts/db/reset.ts"`, `"db:seed": "tsx scripts/db/seed.ts"`, `"db:inspect": "tsx scripts/db/inspect.ts"`. |
| `README.md` | "Getting started" section gains the three new `npm run` commands, per the spec's Definition of Done. |
| `docs/features/03-weapon-list-seeding/weapons-seed-data.json` | Already amended during planning to add the `staff` skill group and the "Staff" weapon (covering the GDD's "Cajado") — no further change expected, but `scripts/db/data/weapons.json` must be kept in sync with it manually if either is edited later (see Open Questions). |

### Out of scope for this plan

- `docs/GDD-isometric-battle-prototype.md` — the Gunslinger class/Pistola removal the human requested is
  a game-design document edit, not a `WEAPONRY` data-layer change. Flagged as a follow-up, not performed
  here.
- Any Pinia store, composable, or component. No `useWeapons`-style composable, no store field, no HUD
  element.
- The `ITEMS`, `UPGRADES`, `SPELLS` tables — this plan only builds `WEAPONRY`, though `schema.ts` and
  `sqliteFile.ts` are written generically enough (table-name-agnostic save/inspect logic) that they
  should need little rework when those tables arrive.

## 5. State design (Pinia)

Not applicable — this feature adds no Pinia store and changes no existing one. `WEAPONRY` is static,
read-only data with no runtime mutation path; nothing here is "state" in the Pinia sense.

## 6. Logic design (composables)

Not applicable — per the spec's explicit scope cut, no composable reads or computes against `WEAPONRY`
in this user story. `src/utils/weapon.ts` and `src/utils/weaponSkillGroup.ts` are plain types/constants,
not composables (no reactivity, no store interaction).

## 7. Rendering / HUD impact

Not applicable — no Pixi scene, sprite, or Vue/Tailwind HUD element reads from this data yet.

## 8. Data layer impact

**New table `WEAPONRY`:**

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | `TEXT PRIMARY KEY` | Unique key; upsert target for `db:seed`. |
| `name` | `TEXT NOT NULL` | English. |
| `description` | `TEXT NOT NULL` | English; authored by the project when the source lacked one. |
| `category` | `TEXT NOT NULL` | `'melee'` or `'ranged'`. |
| `damage_dice` | `TEXT NOT NULL` | E.g. `'1d6+2'`. |
| `initiative_modifier` | `TEXT NOT NULL` | E.g. `'-6'` or `'-10/-1'` (stored verbatim, not parsed/split — see spec Edge Cases). |
| `range_short` | `INTEGER` | Nullable; metres. `NULL` for melee-only weapons. |
| `range_long` | `INTEGER` | Nullable; metres. `NULL` for melee-only weapons. |
| `skill_group` | `TEXT NOT NULL` | One of the `WeaponSkillGroup` enum's string values (TypeScript enums with string members serialize to their string, which is what gets written to SQLite — see §11 risk on this). |
| `two_handed` | `INTEGER NOT NULL` | SQLite has no native boolean; stored as `0`/`1`, read back as boolean by any future consumer. |
| `source` | `TEXT NOT NULL` | E.g. `'official - Sistema Daemon, Módulo Básico v1.04, page 17'` or `'community - <URL>'`. |

**Seeding:** `scripts/db/seed.ts` reads `scripts/db/data/weapons.json` (70 entries after the Staff
addition) and runs, per row:

```sql
INSERT INTO WEAPONRY (slug, name, description, category, damage_dice, initiative_modifier,
                       range_short, range_long, skill_group, two_handed, source)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, description = excluded.description, category = excluded.category,
  damage_dice = excluded.damage_dice, initiative_modifier = excluded.initiative_modifier,
  range_short = excluded.range_short, range_long = excluded.range_long,
  skill_group = excluded.skill_group, two_handed = excluded.two_handed, source = excluded.source;
```

This is the mechanism behind the spec's "idempotent, never duplicates" requirement — re-running `seed`
with the same `slug` updates the row in place rather than inserting a second one. SQLite's `UPSERT`
clause (`ON CONFLICT ... DO UPDATE`) is available in the SQLite version bundled with `sql.js`'s current
major version (SQLite ≥ 3.24), so no version-pinning concern here.

**Reset:** `scripts/db/schema.ts`'s DDL is `DROP TABLE IF EXISTS WEAPONRY;` followed by the `CREATE
TABLE` above — run unconditionally by `db:reset`, and defensively (schema-exists check only, no drop) by
`db:seed`, so `db:seed` also works stand-alone on a brand-new/missing file.

**Inspect:** `SELECT name FROM sqlite_master WHERE type='table'` enumerates tables generically (so this
script keeps working once `ITEMS`/`UPGRADES`/`SPELLS` exist), then `SELECT * FROM <table>` per table,
printed as one row per line.

## 9. External dependencies

- **`tsx`** (new devDependency): runs the TypeScript CLI scripts directly (`tsx scripts/db/reset.ts`)
  without a separate build step. Chosen over Node's native `--experimental-strip-types` because it
  doesn't depend on pinning a minimum Node version the project hasn't declared yet (no `engines` field,
  no `.nvmrc`).
- **`sql.js` in a Node/CLI context** (already installed, previously only exercised in a browser context
  per ADR-0004): `initSqlJs()` must be called with an explicit `locateFile` pointing at
  `node_modules/sql.js/dist/sql-wasm.wasm`, since Node has no bundler to resolve the WASM asset the way
  Vite would in the browser build. This is a real difference from how the eventual browser-side consumer
  will initialize `sql.js` (via its Vite-resolved URL) — both paths are legitimate uses of the same
  library, not a conflict, but worth stating explicitly since ADR-0004 only exercised the dependency
  installation, not actual usage, before now.

No Context7 lookup was performed for `sql.js` specifically, since its Node-side initialization
(`locateFile` override) is a well-known, narrow pattern rather than an evolving API surface; it will be
verified empirically during implementation (see §12, step 1).

## 10. Implementation sequencing

1. **Spike: confirm `sql.js` works standalone in a Node script.** Write a throwaway script that calls
   `initSqlJs({ locateFile: (file) => path.join(require.resolve('sql.js'), '..', file) })` (exact path
   resolution to be worked out here), creates an in-memory DB, and exports it to a `Buffer`. This directly
   addresses ADR-0004's open action item "validate the SQLite + WASM integration in isolation before
   populating all data." Delete the throwaway script once `sqliteFile.ts` is written for real.
2. Add `tsx` as a devDependency.
3. Remove `erasableSyntaxOnly` from `tsconfig.app.json`; add `tsconfig.scripts.json` (without that flag)
   and reference it from the root `tsconfig.json`.
4. Create `src/utils/weaponSkillGroup.ts` (the `enum` + description lookup) and `src/utils/weapon.ts`
   (the `Weapon` interface).
5. Create `scripts/db/schema.ts` and `scripts/db/sqliteFile.ts`, building on step 1's spike.
6. Create `scripts/db/reset.ts`; wire up the `db:reset` npm script; run it once manually to confirm
   `src/data/game-data.sqlite` is created with an empty `WEAPONRY` table.
7. Copy the `weapons` array from `docs/features/03-weapon-list-seeding/weapons-seed-data.json` into
   `scripts/db/data/weapons.json` (converting field names to the DB's `snake_case` column names where
   they differ, e.g. `damageDice` → `damage_dice`).
8. Create `scripts/db/seed.ts`; wire up `db:seed`; run it and confirm the reported insert count matches
   the dataset's length.
9. Re-run `db:seed` without a `db:reset` in between; confirm the count is unchanged (manual idempotency
   check, per spec §11).
10. Create `scripts/db/inspect.ts`; wire up `db:inspect`; run it and visually spot-check a sample of rows
    against `scripts/db/data/weapons.json`.
11. Update `README.md`'s "Getting started" section.
12. Commit `src/data/game-data.sqlite` (the file produced by steps 6–8) to the repository.

## 11. Technical risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| `sql.js`'s WASM asset resolution fails or behaves differently under Node vs. the browser (ADR-0004 flagged SQLite/WASM integration as a medium risk generally) | Medium / Medium | Sequencing step 1 isolates this exact question before any other code is written, matching the HLD's own mitigation plan; if it proves infeasible within a reasonable time, fall back to a plain Node SQLite driver for the **scripts only** (the committed `.sqlite` file's on-disk format is unaffected, since it's just a SQLite file) and keep `sql.js` for the eventual browser-side read. |
| Removing `erasableSyntaxOnly` from `tsconfig.app.json` silently legalizes other non-erasable syntax project-wide (constructor parameter properties, non-const namespaces), not just `enum` | Low / Low | Documented explicitly here and in the commit touching `tsconfig.app.json`, so a future reviewer understands why the flag changed; no code in this plan uses parameter properties or namespaces, so the immediate blast radius is limited to enabling `enum`. |
| `scripts/db/data/weapons.json` (the seed script's real input) and `docs/features/03-weapon-list-seeding/weapons-seed-data.json` (the spec's research record) drift apart after this plan, since nothing enforces they stay identical | Medium / Low | Accepted for this spike (see Open Questions) — the docs copy is explicitly framed as historical/research material, not a second source of truth that must track the code forever. |
| TypeScript string enum values (`WeaponSkillGroup.Sword === "sword"` style) stored as plain `TEXT` in SQLite have no foreign-key enforcement — a typo'd `skill_group` value is a silent data-quality bug, not a load-time error | Low / Low | Acceptable for a spike with ~70 hand-written rows; `db:inspect`'s manual review step is the catch mechanism, not a DB constraint. |

## 12. Manual verification plan

1. **Setup:** `npm install` (picks up `tsx`).
2. **Step 1 spike (throwaway, not committed):** run the standalone `sql.js`-in-Node script from
   sequencing step 1; confirm it prints a successful round-trip (create table, insert, export to Buffer,
   re-import the Buffer, query it back) with no WASM-loading error.
3. **Reset:** `npm run db:reset`; confirm `src/data/game-data.sqlite` now exists and `db:inspect` (once
   built) shows an empty `WEAPONRY` table with the right columns.
4. **Seed:** `npm run db:seed`; confirm the terminal reports the number of weapons inserted, matching the
   length of `scripts/db/data/weapons.json`.
5. **Idempotency:** run `npm run db:seed` again with no reset in between; confirm the reported/observed
   row count is unchanged.
6. **Inspect:** `npm run db:inspect`; manually compare a handful of printed rows (e.g. `longsword`,
   `short-bow`, `staff`) against `scripts/db/data/weapons.json` for correctness.
7. **Build check:** `npm run build` (runs `vue-tsc -b`); confirm it still passes with the
   `tsconfig.scripts.json` addition and the `erasableSyntaxOnly` removal from `tsconfig.app.json`.
8. **Repo check:** confirm `src/data/game-data.sqlite` is staged/committed and `README.md` lists the
   three new commands.

## 13. Open technical questions

- **Follow-up outside this plan:** `docs/GDD-isometric-battle-prototype.md` still describes a
  "Gunslinger" class and its "Pistola" weapon; the human decided this class should be removed from the
  GDD entirely. That edit is not part of this data-seeding plan and should be tracked separately (a small
  GDD edit, likely not substantial enough to need its own ADR, but worth a quick follow-up task).
- **Dataset sync:** keeping `scripts/db/data/weapons.json` (code-facing) and
  `docs/features/03-weapon-list-seeding/weapons-seed-data.json` (spec-facing) in sync is a manual
  discipline, not an enforced one. If this becomes a recurring pain point across future tables
  (`ITEMS`/`UPGRADES`/`SPELLS`), consider having the seed script read directly from the docs copy instead
  of duplicating it — not done now because it would couple runtime tooling to a docs/ path, which this
  plan's author considered the worse trade-off for a one-time cost.
- **`sql.js` Node-side WASM path resolution** is treated as a spike (§10 step 1) rather than a pre-solved
  problem; if it turns out to be non-trivial, it may warrant its own ADR update (ADR-0004's action item 4)
  rather than being buried in this feature's implementation.

## 14. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | The GDD's Gunslinger class needs a "Pistola" (firearm), conflicting with the spec's "no firearms" scope — how to resolve? | Drop the Pistola from `WEAPONRY`, and drop the Gunslinger class from the GDD entirely (a follow-up GDD edit, out of this plan's scope). |
| 2 | The GDD's Mage class/Goblin Shaman monster use a "Cajado" (Staff) not in the original dataset — add it? | Yes — added as `staff` skill group + a `Staff` weapon entry to `weapons-seed-data.json` during planning. |
| 3 | `tsconfig.app.json` has `erasableSyntaxOnly: true`, which rejects the `enum` keyword the spec asked for — how to implement `WeaponSkillGroup`? | Keep the real `enum` keyword; remove `erasableSyntaxOnly` from the relevant tsconfig(s) instead of switching to a `const`-object/union-type workaround. |
| 4 | Where should the feature's code live (schema, enum, CLI scripts)? | `src/utils/` for shared types/enum (reusable by future app code); a separate `scripts/` folder for the CLI tooling, with its own Node-targeted tsconfig. |
| 5 | How should the CLI scripts be run? | Via `tsx`, added as a new devDependency, over Node's native `--experimental-strip-types` (which would require pinning a Node version the project doesn't declare yet). |
| 6 | Where should the committed `.sqlite` file live? | `src/data/`, to be imported later via Vite's `?url` suffix so the build emits a fetchable URL; not consumed by any code in this plan. |

## 15. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not precisely measurable from within this session — no Admin Usage API access was available. |
| Output tokens | Not precisely measurable from within this session, for the same reason. |
| Estimated cost (USD) | Not computed, since no reliable token counts were available. |
| Estimated cost (BRL) | Not computed, for the same reason. |

- Confirmed pricing (from the spec's own token-cost research, carried over to this plan): Claude Sonnet 5
  — **US$ 2.00 / 1M input tokens**, **US$ 10.00 / 1M output tokens**.
- This planning session's main cost drivers were: reading the spec, the GDD, the HLD, ADR-0004, and the
  existing `tsconfig`/`package.json` files; a round of back-and-forth to resolve the Gunslinger/Pistola
  and `erasableSyntaxOnly` conflicts found during that review; and authoring this plan document.
