# Dev Report: Character Enhancement List

**Slug:** `07-character-enhancement-list`
**Plan:** [plan-07-character-enhancement-list.md](../plan-07-character-enhancement-list.md)
**Branch:** `feature/07-character-enhancement-list`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-14

## 1. Summary

Implemented Enhancement selection for character creation, extending the existing "Configure Match"
modal (`06-first-character-creation`). A new `ENHANCEMENTS` SQLite table (66 rows, one per Enhancement
tier, flattened from `docs/daemon-system-enhancements.json`) was seeded alongside `WEAPONRY`. A new
`EnhancementsPanel.vue` component renders 3 positive + 3 negative Enhancement selects, enforcing
mutual exclusion between tiers of the same Enhancement and a live point budget (base 5 points, up to 3
points bought back by Negative Enhancements, per §10 of the rules reference). Selected Enhancement ids
are stored on the character in Pinia; no combat formula reads them yet (selection/storage only, per the
spec).

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-07-character-enhancement-list.md` | Primary source of truth: exact file list, state/logic design, the shared-SQLite-helper refactor, the budget formula, and the 9-step implementation sequencing, followed in order. |
| `docs/HLD-isometric-battle-prototype.json` | No deviation needed; the new table fits the existing read-only Static Data Layer, the new component fits the existing HUD layer. |
| ADR-0004, ADR-0005 | Respected: `sql.js` stayed the only DB engine used; the new `Enhancement` type lives in `src/utils/`, not `src/model/`, consistent with `Weapon`. |
| `spec-07-character-enhancement-list.md` | Confirmed the exact budget formula, the "selection/storage only" scope boundary, and the "no minimum, default to None" rule while writing the component. |
| Existing codebase | `weaponryDatabase.ts`, `useWeaponryQuery.ts`, `WeaponSelect.vue`, `ConfigureMatchPanel.vue`, `characters.ts` store, and `attributeDistribution.spec.ts`'s test style were all read and directly mirrored or extended. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/07-character-enhancement-list` (already existed, named after the slug) |
| Branch used for this task | `feature/07-character-enhancement-list` (reused — human confirmed via a direct question at the start of this task, since it matched the slug) |
| Trello card | https://trello.com/c/FmlMaGbi/7-07-character-enhancement-list |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `utils/enhancement.ts` | `Enhancement` interface and `EnhancementPolarity` type — plain data shape, mirrors `utils/weapon.ts`. |
| `utils/sqliteDatabase.ts` | Shared, table-agnostic `loadGameDatabase()` and `queryTable<T>()` helpers, factored out of `weaponryDatabase.ts`. |
| `utils/enhancementDatabase.ts` | `mapRowToEnhancement` and `queryAllEnhancements`, built on `queryTable`. |
| `utils/enhancementBudget.ts` | Pure budget/exclusion functions: `calculateNegativePointsTaken`, `calculatePositiveBudget`, `calculatePositiveSpent`, `isOptionSelectable`. |
| `utils/enhancementBudget.spec.ts` | 11 Vitest cases covering the budget formula, the 3-point negative cap, and the exclusion/budget-overflow rules. |
| `composables/useEnhancementsQuery.ts` | Lazy, module-cached query exposing all `ENHANCEMENTS` rows reactively, mirroring `useWeaponryQuery.ts`. |
| `components/initial-menu/EnhancementsPanel.vue` | Renders the 3+3 Enhancement selects, owns the cross-select coordination (mutual exclusion, budget, option disabling), commits picks to the character store. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `model/character.ts` | Added `enhancementIds: string[]` to `Character`. |
| `stores/characters.ts` | Added `setCharacterEnhancements(id, enhancementIds)` action; `rollNewCharacter` now initializes `enhancementIds: []`. |
| `components/initial-menu/ConfigureMatchPanel.vue` | Added `<EnhancementsPanel>` as a new sibling after `WeaponSelect`; wrapped the field area in a scrollable `flex-1 overflow-y-auto` container so the Start/Back buttons stay inside the panel frame now that there are 6 more selects (see §5, deviation). |
| `utils/weaponryDatabase.ts` | Refactored to delegate to `sqliteDatabase.ts`'s shared helpers; `mapRowToWeapon`'s signature changed from `(row, columns)` to `(rowObject)` internally (not used outside this file), public exports' names and usage from `useWeaponryQuery.ts`/`WeaponSelect.vue` unchanged. |

### Repository-root (non-`src/`) changes

| Path | Change |
| --- | --- |
| `scripts/db/data/enhancements.json` (new) | 66 rows, one per Enhancement tier, flattened from `docs/daemon-system-enhancements.json` by a one-off local transform script (not committed as tooling). |
| `scripts/db/schema.ts` | Added `ENHANCEMENTS_TABLE`, its DDL, and `ensureEnhancementsSchema`. |
| `scripts/db/seed.ts` | Added `EnhancementSeedRow`, reads `enhancements.json`, upserts into `ENHANCEMENTS` by `id`. |
| `scripts/db/reset.ts` | Also drops/recreates the `ENHANCEMENTS` schema. |
| `src/data/game-data.sqlite` | Regenerated via `npm run db:reset && npm run db:seed` (80 weapons + 66 enhancements). |

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `29a74dc` | Add spec, plan, and seeded ENHANCEMENTS table for character enhancement list |
| `a66dae2` | Factor out a shared SQLite load/query helper from weaponryDatabase |
| `0e155f1` | Add Enhancement type and ENHANCEMENTS read query |
| `dd6b158` | Add pure Enhancement budget/exclusion functions |
| `8ff4c28` | Store selected Enhancement ids on the character |
| `03aecf0` | Add Enhancement selection UI to Configure Match |

(`43d3520`, adding the `docs/daemon-system-enhancements.json` catalog itself, predates this
implementation task — it was committed during an earlier spec-writing session on the same branch.)

## 5. Deviations from the plan

- **Panel layout (not in the plan, but required by it)**: the plan didn't address that adding 6 more
  selects to the fixed-height `ConfigureMatchPanel` would overflow the panel's background art and push
  the Start/Back buttons outside the frame. Fixed by wrapping the field area in a
  `flex-1 overflow-y-auto` scroll container, keeping the panel's `h-120` and the buttons fixed below it.
  This is a small, necessary UI adjustment, not a scope or architecture change.
- **`mapRowToWeapon` signature**: the plan said public exports should keep the same names/signatures
  "so `useWeaponryQuery.ts` and `WeaponSelect.vue` require no changes." That held — neither file changed
  — but `mapRowToWeapon`'s own signature changed from `(row: unknown[], columns: string[])` to
  `(rowObject: Record<string, unknown>)` to match `queryTable`'s generic `mapRow` contract. Confirmed via
  `Grep` that `mapRowToWeapon` is not imported anywhere outside `weaponryDatabase.ts` itself, so this is
  safe and matches the plan's intent even though the literal wording suggested zero signature change.
- Everything else was implemented exactly as planned, including the file list, the budget formula, the
  groupKey-based exclusion rule, and the "list removes group-excluded options, disables budget-excluded
  ones" rendering rule.

## 6. External dependencies / Context7 lookups

None. No new npm package; `sql.js` usage is identical to the existing `WEAPONRY` code.

## 7. Manual verification performed

| # | Step taken | Expected result | Actual result |
| --- | --- | --- | --- |
| 1 | `npm run db:reset && npm run db:seed` | Both `WEAPONRY` and `ENHANCEMENTS` seeded | Console confirmed 80 weapons + 66 enhancements seeded; `scripts/db/inspect.ts` confirmed 66 `ENHANCEMENTS` rows with the expected columns |
| 2 | `npx vue-tsc --noEmit`, `npm run lint`, `npx vitest run` | All pass | All pass (0 type errors, 0 lint errors, 40/40 tests passing, including the 11 new `enhancementBudget.spec.ts` cases) |
| 3 | Opened the app, clicked Start, reached Configure Match | Weapon select still populates/defaults correctly (regression check for the `weaponryDatabase.ts` refactor) | Confirmed — defaulted to "Knife" as before |
| 4 | Confirmed all 6 Enhancement selects render, defaulting to "None" | Budget readout shows `0 / 5` | Confirmed |
| 5 | Selected "Crowd Control (3)" in a positive slot | Readout updates to `3 / 5`; cost-3+ options disabled in sibling positive selects | Confirmed via DOM inspection: `Arcane Library (Tier 3) (3)` and `Channeler (Tier 2) (4)` became `disabled: true`, cost-1/2 options stayed enabled |
| 6 | Selected "Haunted (-2)" in a negative slot | Readout becomes `3 / 7 (+2 from Negative Enhancements)`; a previously-disabled cost-4 option becomes selectable | Confirmed; `Channeler (Tier 2)` flipped to `disabled: false` |
| 7 | Added "Fury (-4)" in a second negative slot (total magnitude 6) | Budget caps at `5 + 3 = 8`, not higher | Confirmed: `3 / 8 (+3 from Negative Enhancements)` |
| 8 | Added "Distraction (-1)" in the third negative slot (total magnitude 7) | Budget stays capped at `8` | Confirmed: readout stayed `0 / 8 (+3 ...)` after also deselecting the positive pick in step 9 |
| 9 | Deselected the "Crowd Control" pick (back to "None") | Spent drops to 0; "Crowd Control" reappears as an option in sibling positive selects | Confirmed both |
| 10 | Switched the class select to "Wizard" and the weapon select to "Sabre" | Enhancement picks (`haunted`, `fury`, `distraction`) unaffected | Confirmed — all three remained selected |
| 11 | `npx vitest run` and `npm run lint` after all code changes | Both pass | Confirmed (40/40 tests, 0 lint errors) |

One test-process note (not a product bug): an early manual check briefly appeared to lose a selection
after a rapid sequence of raw-DOM `.value` assignments without waiting for Vue's render cycle between
them; a clean re-run with a short delay between steps showed the component behaving correctly in every
case tested above. No corresponding issue was found in the component's logic, and this is called out
here only for transparency about the verification process.

## 8. Known issues / follow-ups

- The selected Enhancements' `effect` text is not yet applied to any combat formula — this was
  explicitly out of scope for this US (selection/storage only) and is left for a future feature.
- The official §10 rule also caps how many Negative Points may be *taken* at 3; this implementation
  only caps the *budget benefit* at 3 (a player can select negative Enhancements whose combined
  magnitude exceeds 3 — the excess just stops increasing the budget), per the spec's explicit scope
  decision (§4, "Out of scope").
- No automated UI/component test exists for `EnhancementsPanel.vue` itself (consistent with CLAUDE.md's
  testing scope, which limits automated coverage to pure `src/utils/` logic); its behavior was verified
  manually only, per the manual verification table above.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | Not yet (pending PR) |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens (approx.) | Not tracked by tooling available in this session |
| Output tokens (approx.) | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this implementation session. Pricing reference (per the `claude-api` skill, current at
  time of writing): Claude Sonnet 5 — US$ 2.00 / 1M input tokens, US$ 10.00 / 1M output tokens.
