# Technical Plan: Character Enhancement List

**Slug:** `07-character-enhancement-list`
**Spec:** [spec-07-character-enhancement-list.md](spec-07-character-enhancement-list.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-14

## 1. Summary

This plan adds a new static `ENHANCEMENTS` SQLite table (one row per Enhancement tier, flattened from
`docs/daemon-system-enhancements.json`) and a new `EnhancementsPanel.vue` component inside the existing
"Configure Match" modal, rendering 3 positive and 3 negative Enhancement `<select>` elements. The panel
owns the cross-select coordination (mutual exclusion by `groupKey`, live point-budget tracking, option
disabling) by calling pure functions from a new `src/utils/enhancementBudget.ts`, and commits the final
picks to the character via a new `setCharacterEnhancements` store action. Data access follows the
existing `WEAPONRY` pattern but factors out a shared generic SQLite row-mapping/query helper so both
tables use it, rather than duplicating the full load/map/query trio a second time.

## 2. Source documents reviewed

| Document | Key takeaways for this plan |
| --- | --- |
| `spec-07-character-enhancement-list.md` | Defines the `ENHANCEMENTS` row shape (`id`, `name`, `groupKey`, `polarity`, `cost`, `effect`), the 3+3 select layout, the mutual-exclusion-by-`groupKey` rule, the budget formula (`positiveBudget = 5 + min(negative magnitude taken, 3)`), and that this US is selection/storage only. |
| Trello card | No additional context beyond the spec. |
| `docs/GDD-isometric-battle-prototype.md` | No mention of Enhancements or point-budget mechanics; fixes 8 classes with hardcoded attribute emphasis and only uses `CON/FR/DEX/AGI/INT/WILL/PER` in combat formulas. Nothing here constrains this feature beyond what the spec already covers. |
| `docs/HLD-isometric-battle-prototype.json` | `data_model.entities` lists `Character, Weapon, Item, Upgrade, Spell, Tile/Grid, BattleState` with no `Enhancement` entity yet — this feature extends the existing read-only "Static Data Layer" (SQLite via WASM, seeded at build time) with a new table, following the same layering: Pinia stores hold dynamic state, composables hold pure logic, Vue+Tailwind HUD reads/writes via composables. |
| ADR-0004 (SQLite via WASM for static game data) | Confirms `sql.js`, synchronous API, read-only build-time-seeded data as the mandated engine for any new static table, including `ENHANCEMENTS`. |
| ADR-0005 (`src/model/` vs `src/utils/`) | `src/model/` holds entities with attached behavior; `src/utils/` holds pure functions and plain data-shape types with no methods — precedent (`Weapon` lives in `src/utils/weapon.ts`) for putting the new `Enhancement` interface in `src/utils/`, not `src/model/`. |
| Current codebase (`06-first-character-creation`) | `src/model/character.ts` (`Character` shape), `src/stores/characters.ts` (Pinia setup-store, `setCharacterWeapon` action pattern), `src/components/initial-menu/ConfigureMatchPanel.vue` (sibling-component composition), `src/components/initial-menu/WeaponSelect.vue` (simple select writing straight to the store), `src/composables/useWeaponryQuery.ts` (module-scoped cache, lazy load), `src/utils/weaponryDatabase.ts` (`loadWeaponryDatabase`/`mapRowToWeapon`/`queryAllWeapons` trio), `scripts/db/{schema,seed,reset,sqliteFile}.ts` (schema/seed/reset scripts, upsert-by-primary-key pattern, `scripts/db/data/weapons.json` as the static seed source), `src/utils/attributeDistribution.ts` (pure-function + sibling `*.spec.ts` convention). All of these are extended or mirrored by this plan, as detailed in section 4. |

## 3. Architecture fit

This feature stays entirely within the existing layering from the HLD: a new read-only table in the
Static Data Layer (SQLite via WASM, per ADR-0004), read through a composable into the HUD, with the
HUD writing final selections into the existing `characters` Pinia store through a new action. No Pixi
involvement (consistent with `06-first-character-creation`'s HUD-only "Configure Match" modal).

One deliberate extension of the established pattern: `weaponryDatabase.ts` currently bundles table-
agnostic SQLite loading (`loadWeaponryDatabase`, which actually just opens the whole `game-data.sqlite`
file — nothing weapon-specific about it) together with weapon-specific mapping/querying. This plan
factors the table-agnostic part into a shared `src/utils/sqliteDatabase.ts` (reusable "open the seeded
database" function plus a generic "run a `SELECT * FROM <table>` and map each row" helper), and
`weaponryDatabase.ts` is refactored to call into it instead of duplicating that logic. This is a small,
mechanical refactor of working feature-06 code — not a behavior change — done so `enhancementDatabase.ts`
does not have to re-implement the same "fetch the sqlite file, init sql.js, run a query, zip columns
into an object" boilerplate a second time.

## 4. Affected surface

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `utils/enhancement.ts` | `Enhancement` interface (`id`, `name`, `groupKey`, `polarity: 'positive' \| 'negative'`, `cost: number`, `effect: string`) and the `EnhancementPolarity` type — plain data shape, mirrors `utils/weapon.ts`. |
| `utils/sqliteDatabase.ts` | Shared, table-agnostic helpers factored out of `weaponryDatabase.ts`: `loadGameDatabase()` (opens the seeded `game-data.sqlite` via sql.js, replacing the body of `loadWeaponryDatabase`) and `queryTable<T>(db, tableName, mapRow)` (runs `SELECT * FROM <tableName>;`, zips `columns`/`values` into row objects, and maps each via the caller-supplied `mapRow`). |
| `utils/enhancementDatabase.ts` | `mapRowToEnhancement(rowObject)` and `queryAllEnhancements(db)` built on `queryTable`, mirroring `weaponryDatabase.ts`'s remaining (table-specific) surface after the refactor. |
| `utils/enhancementBudget.ts` | Pure functions: `calculateNegativePointsTaken(selected: Enhancement[]): number` (sum of `abs(cost)`, capped at 3), `calculatePositiveBudget(negativePointsTaken: number): number` (`5 + negativePointsTaken`), `calculatePositiveSpent(selected: Enhancement[]): number`, and `isOptionSelectable(option: Enhancement, context): boolean` (encapsulates the groupKey-exclusion + budget-overflow checks used to disable/hide options). Covered by `enhancementBudget.spec.ts`. |
| `composables/useEnhancementsQuery.ts` | Lazy, module-cached query exposing all `ENHANCEMENTS` rows reactively, mirroring `useWeaponryQuery.ts` exactly (same `{ enhancements, loading, error }` shape, same cache/load-promise pattern). |
| `components/initial-menu/EnhancementsPanel.vue` | New component rendering the 3 positive + 3 negative `<select>` elements and the budget readout; owns the local reactive state tying the 6 selects together (current pick per slot, derived available options, derived budget numbers) and commits the final list of chosen `Enhancement.id`s to the character store on every change. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `model/character.ts` | Add `enhancementIds: string[]` to the `Character` interface. |
| `stores/characters.ts` | Add `setCharacterEnhancements(id: string, enhancementIds: string[]): void` action, following the exact shape of `setCharacterWeapon`; initialize `enhancementIds: []` in `rollNewCharacter`'s created character. |
| `components/initial-menu/ConfigureMatchPanel.vue` | Add `<EnhancementsPanel :character-id="..." :enhancement-ids="..." />` as a new sibling after `WeaponSelect`, following the existing prop-passing pattern. |
| `utils/weaponryDatabase.ts` | Refactor `loadWeaponryDatabase` to delegate to the new `loadGameDatabase` from `sqliteDatabase.ts`; refactor `queryAllWeapons` to delegate to the new `queryTable` helper, passing `mapRowToWeapon`. `mapRowToWeapon`'s per-field mapping logic is unchanged. Public exports (`loadWeaponryDatabase`, `mapRowToWeapon`, `queryAllWeapons`) keep the same names and signatures, so `useWeaponryQuery.ts` and `WeaponSelect.vue` require no changes. |

### Repository-root (non-`src/`) changes

| Path | Purpose / change |
| --- | --- |
| `scripts/db/data/enhancements.json` (new) | Static, pre-flattened seed data: one entry per tier, transformed once (by hand or a one-off local script, not committed as tooling) from `docs/daemon-system-enhancements.json`. Snake_case fields matching the SQL columns: `id`, `name`, `group_key`, `polarity`, `cost`, `effect`. Mirrors `scripts/db/data/weapons.json`'s role exactly. |
| `scripts/db/schema.ts` (modified) | Add `ENHANCEMENTS_TABLE`, `DROP_ENHANCEMENTS_TABLE_SQL`, `CREATE_ENHANCEMENTS_TABLE_SQL` (`id TEXT PRIMARY KEY, name TEXT NOT NULL, group_key TEXT NOT NULL, polarity TEXT NOT NULL, cost INTEGER NOT NULL, effect TEXT NOT NULL`), `ensureEnhancementsSchema(db)` — same shape as the existing `WEAPONRY` constants/function. |
| `scripts/db/seed.ts` (modified) | Add an `EnhancementSeedRow` interface, read `scripts/db/data/enhancements.json`, and upsert into `ENHANCEMENTS` by `id` with the same `ON CONFLICT(...) DO UPDATE` pattern used for weapons, after the existing weapon-seeding block. |
| `scripts/db/reset.ts` (modified) | Also drop+recreate the `ENHANCEMENTS` schema, alongside `WEAPONRY`. |

### Out of scope for this plan

- Any change to `AttributeList.vue`, `ClassSelect.vue`, or the attribute-generation/distribution
  functions — untouched by this feature.
- Any combat-formula code reading `Enhancement.effect` — selection/storage only, per the spec.
- `scripts/db/inspect.ts` — not required for this feature to function, left as-is (optionally useful to
  the developer for manual verification, but no plan step depends on changing it).

## 5. State design (Pinia)

```
characters (existing store, extended)
  characters: Character[]
    id: string
    characterClass: CharacterClass
    attributes: Record<AttributeCode, number>
    weaponSlug: string | null
    enhancementIds: string[]          // NEW — ids of the selected ENHANCEMENTS rows, in no particular order, 0 to 6 entries
```

No new store is introduced; `enhancementIds` is added to the existing `Character` shape in the existing
`characters` store, consistent with how `weaponSlug` was added by feature 06.

## 6. Logic design (composables)

| Composable/module | Responsibility | Inputs → Output | Store actions it calls |
| --- | --- | --- | --- |
| `useEnhancementsQuery` | Loads and caches all `ENHANCEMENTS` rows once per page session (mirrors `useWeaponryQuery`). | `()` → `{ enhancements: Ref<Enhancement[]>, loading: Ref<boolean>, error: Ref<unknown> }` | None (read-only). |
| `enhancementBudget.ts` (pure functions, not a composable) | Computes the budget numbers and whether a given option should be selectable, given the enhancements currently picked across all 6 slots. | `calculateNegativePointsTaken(selectedNegative: Enhancement[]) → number`; `calculatePositiveBudget(negativePointsTaken: number) → number`; `calculatePositiveSpent(selectedPositive: Enhancement[]) → number`; `isOptionSelectable(option: Enhancement, selectedGroupKeys: Set<string>, positiveSpent: number, positiveBudget: number) → boolean` | None (pure). |
| `EnhancementsPanel.vue` (component, not a composable, but the integration point) | Holds 6 local `ref<string \| null>` slots (3 positive, 3 negative); on every change, derives `selectedEnhancements` from `useEnhancementsQuery`'s list + the 6 slot values, calls the pure functions above to compute budget/exclusion, filters each select's option list accordingly, and calls `charactersStore.setCharacterEnhancements(characterId, selectedIds)`. | 6 slot refs + `enhancements: Enhancement[]` → filtered option lists per select + budget readout text | `setCharacterEnhancements` |

This keeps all cross-select coordination logic pure and unit-testable in `enhancementBudget.ts`, while
`EnhancementsPanel.vue` is the thin, Vuespecific wiring layer — consistent with CLAUDE.md's state/logic
separation.

## 7. Rendering / HUD impact

Purely a Vue + Tailwind DOM addition to the existing "Configure Match" HUD panel — no Pixi/GSAP
involvement. `EnhancementsPanel.vue` renders:

- A "Positive Enhancements" group of 3 `<select>` elements (each with a "None" option plus every
  currently-available positive `Enhancement`, labelled by `name`, which already encodes the tier).
- A "Negative Enhancements" group of 3 `<select>` elements, same structure, filtered to `polarity ===
  'negative'`.
- A budget readout line, e.g. `Enhancement points: {positiveSpent} / {positiveBudget} (+{negativePointsTaken} from Negative Enhancements)`.
- Options excluded by the mutual-exclusion rule are removed from the `<option>` list entirely (not just
  disabled), since Vue's `v-for` over a filtered array is simpler than toggling `disabled` per option
  while keeping all tiers always rendered; options excluded only by budget overflow are rendered with
  `disabled` so the player can see what they can't currently afford.

## 8. Data layer impact

- New `ENHANCEMENTS` table (schema in §4), seeded from a new static `scripts/db/data/enhancements.json`
  file, itself a one-time flattening of `docs/daemon-system-enhancements.json` by tier.
- New read path: `queryAllEnhancements` (via the shared `queryTable` helper) → `useEnhancementsQuery` →
  `EnhancementsPanel.vue`.
- `npm run db:seed` and `npm run db:reset` both need to cover `ENHANCEMENTS` alongside `WEAPONRY` (see
  modified `scripts/db/seed.ts` and `scripts/db/reset.ts` in §4) so a fresh `game-data.sqlite` has both
  tables after a single reset+seed cycle.

## 9. External dependencies

None. No new npm package; `sql.js` is already a dependency (per ADR-0004) and its API usage here
(`db.exec`, `db.prepare(...).run(...)`) is identical to the existing `WEAPONRY` code, so no new Context7
lookup was needed.

## 10. Implementation sequencing

1. **Seed data**: write `scripts/db/data/enhancements.json` by transforming
   `docs/daemon-system-enhancements.json` into one flattened row per tier (assign a stable `id` per row,
   e.g. a kebab-case slug of `name`, and a `group_key` shared by all tiers of the same Enhancement).
2. **Schema**: add `ENHANCEMENTS_TABLE`/DDL/`ensureEnhancementsSchema` to `scripts/db/schema.ts`.
3. **Seed + reset scripts**: extend `scripts/db/seed.ts` and `scripts/db/reset.ts` to also handle
   `ENHANCEMENTS`. Run `npm run db:reset && npm run db:seed` and verify via `scripts/db/inspect.ts` (or a
   quick ad-hoc query) that `ENHANCEMENTS` has the expected row count and columns.
4. **Shared SQLite helper**: extract `loadGameDatabase`/`queryTable` into `src/utils/sqliteDatabase.ts`;
   refactor `src/utils/weaponryDatabase.ts` to use them, keeping its exported function names/signatures
   unchanged. Run the app and confirm the existing weapon select in "Configure Match" still populates
   correctly — this is the point where a regression in the refactor would show up.
5. **Enhancement data access**: add `src/utils/enhancement.ts` (type) and
   `src/utils/enhancementDatabase.ts` (`mapRowToEnhancement`, `queryAllEnhancements`), then
   `src/composables/useEnhancementsQuery.ts`.
6. **Budget logic**: implement `src/utils/enhancementBudget.ts` with its accompanying
   `enhancementBudget.spec.ts`, covering the budget formula and the exclusion rule in isolation from any
   UI.
7. **Store**: add `enhancementIds` to `Character` and `setCharacterEnhancements` to the `characters`
   store.
8. **UI**: build `EnhancementsPanel.vue`, wire it into `ConfigureMatchPanel.vue`.
9. **End-to-end manual pass**: follow §12 below.

## 11. Technical risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Refactoring `weaponryDatabase.ts` to use the new shared helper regresses the already-working weapon select from feature 06 | Low/Medium | Keep the refactor mechanical (same exported names/signatures, same SQL), and explicitly re-verify the weapon select in "Configure Match" immediately after step 4, before building any new Enhancement code on top. |
| Manually/semi-manually flattening `docs/daemon-system-enhancements.json` into `scripts/db/data/enhancements.json` introduces transcription errors (wrong tier cost, mismatched `group_key`) | Medium/Low | Cross-check row count against the source JSON (count of all cost-tiers across both `positive` and `negative`) after step 1, and spot-check a few multi-tier entries (e.g. "Arcane Library", "Magic Powers") by eye. |
| The 6-select cross-exclusion/budget logic has an edge-case bug (e.g. stale option list after rapid deselect/reselect) | Medium/Medium | Isolate all the decision logic in pure, unit-tested `enhancementBudget.ts` functions (step 6) before wiring them into the Vue component, so bugs surface in Vitest rather than only during manual play-testing. |

## 12. Manual verification plan

1. Run `npm run db:reset && npm run db:seed`; confirm the console output reports both `WEAPONRY` and
   `ENHANCEMENTS` seeded, then run `npm run dev`.
2. Click "Start" to reach "Configure Match"; confirm the weapon select still populates and defaults
   correctly (regression check for the `weaponryDatabase.ts` refactor).
3. Confirm all 6 Enhancement selects render, each defaulting to "None", with a budget readout showing
   `0 / 5`.
4. Pick a positive Enhancement costing 3: confirm the readout updates to `3 / 5`, and any positive
   option costing more than 2 becomes unavailable/disabled in the other two positive selects.
5. If the chosen Enhancement has multiple tiers, confirm picking Tier 1 in one select removes Tier 2/3
   of that same Enhancement from the other two positive selects.
6. Pick a negative Enhancement costing -2: confirm the readout becomes `3 / 7`, and a previously
   disabled positive option (up to 4 more) becomes available again.
7. Pick enough negative Enhancements to exceed magnitude 3 total: confirm the budget caps at `5 + 3 = 8`
   and does not keep growing.
8. Deselect the step-4 pick (back to "None"): confirm the readout drops and the tiers hidden in step 5
   become available again.
9. Switch the class select and the weapon select: confirm the Enhancement picks are unaffected.
10. Run `npx vitest run` and confirm `enhancementBudget.spec.ts` (and the existing suite) passes.
11. Run `npm run lint` and confirm it passes.

## 13. Open technical questions

None.

## 14. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | Should `ENHANCEMENTS` duplicate the full `WEAPONRY` load/map/query trio, or should a shared generic SQLite helper be factored out for both tables? | Factor out a shared generic DB helper (`loadGameDatabase`/`queryTable` in `src/utils/sqliteDatabase.ts`), refactoring `weaponryDatabase.ts` to use it too. |
| 2 | Should the tiered Enhancement data be a static pre-flattened JSON file (like `weapons.json`), or should the seed script flatten `docs/daemon-system-enhancements.json` live? | Static pre-flattened `scripts/db/data/enhancements.json`, transformed once; the seed script stays a simple upsert loop. |
| 3 | How should the 6 selects' shared cross-select state (mutual exclusion, live budget, option disabling) be structured? | One `EnhancementsPanel.vue` component owns the coordination, calling pure budget/exclusion functions from `src/utils/enhancementBudget.ts`, consistent with CLAUDE.md's state/logic split. |

## 15. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this planning session. Pricing reference (per the `claude-api` skill, current at time
  of writing): Claude Sonnet 5 — US$ 2.00 / 1M input tokens, US$ 10.00 / 1M output tokens.
