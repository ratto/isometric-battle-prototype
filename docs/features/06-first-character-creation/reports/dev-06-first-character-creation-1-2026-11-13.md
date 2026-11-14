# Dev Report: First Character Creation

**Slug:** `06-first-character-creation`
**Plan:** [plan-06-first-character-creation.md](../plan-06-first-character-creation.md)
**Branch:** `feature/06-first-character-creation`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-13

## 1. Summary

Implemented the first character creation flow: clicking "Start" on the main menu now rolls a fresh set
of 8 Sistema Daemon attributes (4d6 drop-lowest, nine times, drop the worst total), stores a default
Fighter-class character in a new `characters` Pinia store, and the "Configure Match" panel renders a
class select (Fighter/Wizard/Thief), the 8 attributes with name/description/value, and a weapon select
populated from the `WEAPONRY` SQLite table. Switching class re-distributes the same rolled pool per that
class's tier rule without a new roll; switching the weapon only updates the stored selection. This is
also the first browser-side (non-Node) consumer of the seeded `WEAPONRY` table, loading `sql.js` and
`game-data.sqlite` via Vite `?url` imports.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-06-first-character-creation.md` | Primary source of truth for file layout, state design, the composable/store split, and implementation sequencing — followed exactly. |
| `docs/HLD-isometric-battle-prototype.json` | Confirmed the layered architecture (Pinia ↔ composables ↔ Pixi/HUD) and that `WEAPONRY` is meant to be queried via composables at runtime; no deviation needed. |
| ADR-0004 (`sqlite-wasm-for-static-game-data`), ADR-0005 (`src-model-folder-for-entities`) | Grounded reusing `sql.js` for the browser-side query and placing `Character`/`AttributeCode`/`CharacterClass` in `src/model/`. |
| `spec-06-first-character-creation.md` | Confirmed the exact attribute codes/names/descriptions, the three classes' tier rules, and the explicit deviation from the official Sistema Daemon point-buy method. |
| Existing codebase | Reused `DieRoll`/`d6` from `src/model/dieRoll.ts`/`dice.ts`, the existing `Weapon` type in `src/utils/weapon.ts`, the `scene.ts` store as a precedent for a focused composition-API Pinia store, and `scripts/db/sqliteFile.ts`/`seed.ts` to confirm the `WEAPONRY` column names and `sql.js`'s separate browser entry point. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/06-first-character-creation` (already existed, matching the slug) |
| Branch used for this task | `feature/06-first-character-creation` (reused, confirmed by human) |
| Trello card | Card named `06-first-character-creation` on the "Turn based prototype" board |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `model/character.ts` | `AttributeCode`, `CharacterClass`, and `Character` entity types. |
| `model/attribute.ts` | Static English name/description per attribute code, plus a stable display order. |
| `utils/attributeGeneration.ts` | Pure `rollAttributePool()`: 4d6 drop-lowest, nine rolls, drop the worst total. |
| `utils/attributeGeneration.spec.ts` | Vitest coverage: value range (3–18) over many samples, and a mocked-`Math.random` test proving the correct total is dropped. |
| `utils/attributeDistribution.ts` | Pure `distributeAttributes(pool, characterClass)` implementing the three classes' tier rules, plus an internal Fisher–Yates `shuffle`. |
| `utils/attributeDistribution.spec.ts` | Vitest coverage: each class's exact tier assignment under a mocked, deterministic shuffle, plus a value-preservation invariant check. |
| `utils/weaponryDatabase.ts` | `loadWeaponryDatabase()` (loads `sql.js`'s browser build + `game-data.sqlite` via `?url` imports), `mapRowToWeapon()`, `queryAllWeapons()`. |
| `composables/useWeaponryQuery.ts` | Caches the loaded database and weapon list at module scope; exposes `weapons`/`loading`/`error` reactively. |
| `stores/characters.ts` | New Pinia store: `rollNewCharacter`, `setCharacterClass`, `setCharacterWeapon`, `activeCharacter` getter. |
| `components/initial-menu/ClassSelect.vue` | Class `<select>` bound to the active character. |
| `components/initial-menu/AttributeList.vue` | Renders the 8 attributes (name, description as a tooltip, value). |
| `components/initial-menu/WeaponSelect.vue` | Weapon `<select>` backed by `useWeaponryQuery`; shows a loading label and defaults to the first weapon. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `scenes/InicialMenuScene.vue` | `@start` now calls `charactersStore.rollNewCharacter()` before switching to `'configure-match'`. |
| `components/initial-menu/ConfigureMatchPanel.vue` | Replaced the "Coming soon" placeholder with `ClassSelect`, `AttributeList`, and `WeaponSelect`; panel height increased from `21rem` to `30rem` to fit the new content. |

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `f1a37e9` | Add character attribute generation and distribution utils |
| `799a98b` | Add characters store, weaponry browser query, and Start wiring |
| `5fada16` | Wire character creation UI into Configure Match panel |

## 5. Deviations from the plan

None — implemented exactly as planned, including the file layout, the store/composable/utils split, and
the implementation sequencing from §10 of the plan.

## 6. External dependencies / Context7 lookups

None — per the plan's §9, no new npm package was introduced, and the `sql.js` API surface needed
(`initSqlJs({ locateFile })`, `new SQL.Database(Uint8Array)`, `db.exec(sql)`) was already exercised by
`scripts/db/sqliteFile.ts` in this codebase. The only new fact needed — that `sql.js` ships a distinct
`browser` export condition (`dist/sql-wasm-browser.js` + matching `.wasm`) — was confirmed by reading the
installed package's own `package.json` directly, as the plan anticipated, not via Context7.

## 7. Manual verification performed

Performed via `npm run dev` (and, for step 8, `npm run build && npm run preview`), driving the app
through the `claude-in-chrome` browser tool.

| # | Step taken | Expected result | Actual result |
| - | --- | --- | --- |
| 1 | Confirmed `WEAPONRY` was already seeded (`npm run db:inspect`) | 80 weapon rows present | Confirmed: 80 rows |
| 2 | Clicked "Start" | "Configure Match" opens with class "Fighter", 8 attributes in 3–18 range, a weapon pre-selected | Confirmed (first run showed transient, inconsistent values during the dev server's cold dependency-optimization pass for `sql.js`; a reload and clean re-run showed fully stable, consistent values from then on) |
| 3 | Compared displayed values | `FR`/`AGI`/`DEX`/`CON` are the 4 highest of the 8 values, `INT`/`WILL`/`PER`/`CAR` the 4 lowest | Confirmed via direct value inspection (e.g. pool `[15,13,13,13,12,12,10,10]` → high tier `{15,13,13,13}`, low tier `{10,12,10,12}`) |
| 4 | Switched class to "Wizard" | `INT`/`WILL` show the 2 highest, `PER`/`CAR` the 2 lowest, same 8 numbers, no reroll | Confirmed: `INT=15,WILL=13` (top 2), `PER=10,CAR=10` (bottom 2), middle 4 on `FR/AGI/DEX/CON` |
| 5 | Switched class to "Thief" | `AGI`/`DEX`/`INT` show the 3 highest, remaining 5 on the rest, same pool | Confirmed: `{AGI,DEX,INT}` = `{15,13,13}` (top 3), remaining 5 matched exactly |
| 6 | Changed weapon select (e.g. to "Longsword") | Attribute values unaffected | Confirmed |
| 7 | Switched class back to "Fighter" twice | Same tier rule holds, but the specific value-to-attribute mapping within a tier varies between switches | Confirmed: e.g. `FR=15,AGI=13` on one switch vs. `FR=13,AGI=15` on another, same underlying value set |
| 8 | Clicked "Back", then "Start" again | A brand-new 8-value roll appears, class resets to Fighter, weapon resets to the first weapon | Confirmed: new pool `[13,14,15,13,11,13,13,11]`, class `fighter`, weapon `knife` |
| 9 | `npm run build && npm run preview`, repeated steps 2–3 | No WASM/asset-path discrepancy between dev and the production build | Confirmed: production build correctly resolves `sql-wasm-browser.wasm` and `game-data.sqlite` as emitted assets; app behaves identically, no console errors |
| 10 | `npx vitest run` | New `attributeGeneration`/`attributeDistribution` tests pass alongside the existing suite | Confirmed: 4 test files, 29 tests, all passing |
| 11 | `npm run lint` | Passes | Confirmed: no lint errors |

## 8. Known issues / follow-ups

- During the very first page load right after starting a fresh `npm run dev` process, the weapon/
  attribute values displayed briefly drifted across consecutive reads while Vite was still cold-starting
  its dependency optimization for `sql.js` (observed only during this session's interactive verification,
  not during subsequent reloads or the production build check). This looked like a one-time artifact of
  that cold-start window rather than an application bug — it did not reproduce on a clean reload, in
  repeated reads afterward, or in the production build — but it is worth a quick recheck if it is ever
  observed again during normal play.
- `ConfigureMatchPanel.vue`'s panel height was increased from `21rem` to `30rem` to fit the new controls;
  the underlying background artwork is stretched to this new size via `bg-[length:100%_100%]` rather than
  redrawn for it, which is a visual compromise acceptable for this spike but may be worth revisiting if
  the panel grows further in a future feature.
- As scoped, the created character is not yet consumed by `05-combat-scene` — this is an explicit
  out-of-scope item for this feature, to be picked up by a future US per the spec/plan.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No (pending human approval to push/PR) |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens (approx.) | Not tracked by tooling available in this session |
| Output tokens (approx.) | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this implementation session. Pricing reference (current at time of writing): Claude
  Sonnet 5 — US$ 2.00 / 1M input tokens, US$ 10.00 / 1M output tokens. Given the size of this task
  (reading ~5 source documents plus the existing codebase, writing ~12 new files and 2 modified files,
  and a full interactive manual verification pass), a rough order-of-magnitude estimate would be in the
  low single-digit US$ range, but this is not based on actual measured token counts.
