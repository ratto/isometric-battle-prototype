# Technical Plan: First Character Creation

**Slug:** `06-first-character-creation`
**Spec:** [spec-06-first-character-creation.md](spec-06-first-character-creation.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-13

## 1. Summary

This plan wires a real character into the already-existing "Configure Match" placeholder
(`ConfigureMatchPanel.vue`). Clicking "Start" rolls a fresh set of 8 Sistema Daemon attributes (4d6
drop-lowest, nine times, drop the worst total), stores a default Fighter-class character in a new Pinia
store, and "Configure Match" renders a class select, the 8 attributes, and a weapon select. The weapon
select is the first runtime (browser) consumer of the `WEAPONRY` SQLite table seeded by
`03-weapon-list-seeding` — everything before this feature only read that table from Node scripts. The
plan follows the existing state/logic split: pure generation and distribution math lives in
`src/utils/`, the character itself lives in a new Pinia store, and a new composable owns the async
SQLite-loading side effect.

## 2. Source documents reviewed

| Document | Key takeaways for this plan |
| --- | --- |
| `spec-06-first-character-creation.md` | Defines the generation algorithm, the 3 classes' attribute-tier rules, the weapon select's data source, and that the character must be stored in Pinia but not yet wired into the battle scene. |
| Trello card (`06-first-character-creation`, list: Backlog) | Description and checklist mirror the spec's Definition of Done; no extra context beyond the spec. |
| `docs/GDD-isometric-battle-prototype.md` | Defines 8 full PC classes (Guerreiro, Arqueiro, Mago, …) for the eventual battle scene — explicitly different from this spec's simplified 3-class (`fighter`/`wizard`/`thief`) model. This is a known, spec-approved simplification for this US, not a contradiction to resolve here; the future feature that connects character creation to `05-combat-scene` will have to reconcile the two class systems. |
| `docs/HLD-isometric-battle-prototype.json` | Confirms the layered architecture (Pinia ↔ composables ↔ Pixi/HUD) and that `WEAPONRY` (part of the "Static Data Layer") is meant to be queried via composables at runtime — this feature is the first to actually do that. |
| Existing ADRs | `0004-sqlite-wasm-for-static-game-data.md` committed to `sql.js`, already used by the Node seed/reset/inspect scripts; this plan is the first to load `sql.js` and the `.sqlite` file in the browser, reusing the same dependency. `0005-src-model-folder-for-entities.md` grounds putting the new `Character`/attribute types in `src/model/`. |
| Current codebase | `src/model/dice.ts` + `src/model/dieRoll.ts` (`DieRoll`, `d6`) are reused for the attribute rolls. `src/utils/weapon.ts` already defines the `Weapon` TypeScript shape matching `WEAPONRY`'s columns. `src/stores/scene.ts` is a minimal, single-purpose store (active scene only) — a precedent for keeping the new character store similarly focused. `src/scenes/InicialMenuScene.vue` already owns the `@start` → `activeMenu = 'configure-match'` transition. `src/components/initial-menu/ConfigureMatchPanel.vue` is the "Coming soon" placeholder this feature replaces. No browser-side `sql.js` usage exists anywhere in `src/` today — `scripts/db/sqliteFile.ts` is Node-only (uses `node:fs`). `sql.js`'s package.json declares a dedicated `browser` entry (`dist/sql-wasm-browser.js` + matching `.wasm`), distinct from the Node entry the scripts use. |

## 3. Architecture fit

Fits the existing layered model without changes:

- **State (Pinia):** a new `characters` store, parallel to `scene.ts`, holding the character data only.
- **Logic (pure, `src/utils/`):** the dice-based generation and per-class distribution algorithms, plus
  the SQL row → `Weapon` mapping.
- **Logic (composable, async/stateful):** a new `useWeaponryQuery` composable owns the one genuinely
  stateful, asynchronous concern this feature introduces — loading `sql.js` + the `.sqlite` file in the
  browser and exposing the result reactively. This is a deliberate, narrow extension of the "composables
  hold logic, call store actions" pattern: this composable does not call any store action itself (the
  weapon list is read-only reference data, not battle state), it only feeds reactive props down to the
  new `WeaponSelect.vue` component, which calls the store action when the player picks a weapon.
- **Rendering (HUD, DOM):** `ConfigureMatchPanel.vue` and its new subcomponents stay Vue + Tailwind,
  consistent with `02-initial-screen`'s decision to keep this screen outside Pixi.

No deviation from the HLD's architecture is introduced.

## 4. Affected surface

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `model/character.ts` | `AttributeCode` union (`FR`, `AGI`, `DEX`, `CON`, `INT`, `WILL`, `PER`, `CAR`), `CharacterClass` union (`fighter`, `wizard`, `thief`), and the `Character` entity type (`id`, `characterClass`, `attributes: Record<AttributeCode, number>`, `weaponSlug: string \| null`). Placed in `model/` per ADR-0005 (entities/data shapes, not pure utility logic). |
| `model/attribute.ts` | Static English name + description per `AttributeCode` (Strength, Agility, Dexterity, Constitution, Intelligence, Willpower, Perception, Charisma), for `AttributeList.vue` to render without hardcoding copy in the component. |
| `utils/attributeGeneration.ts` | Pure function `rollAttributePool(): number[]` — rolls 4d6 (via `DieRoll`/`d6` from `model/dieRoll.ts` and `model/dice.ts`), drops the lowest die, sums the rest; repeats nine times; drops the lowest of the nine totals; returns the remaining 8 numbers (unordered). |
| `utils/attributeDistribution.ts` | Pure function `distributeAttributes(pool: number[], characterClass: CharacterClass): Record<AttributeCode, number>` implementing the three classes' tier rules from the spec (§5.3), plus a small internal Fisher–Yates `shuffle<T>(items: T[]): T[]` helper used to randomize placement within each tier. |
| `utils/weaponryDatabase.ts` | Async function `loadWeaponryDatabase(): Promise<Database>` that initializes `sql.js`'s browser build and loads `src/data/game-data.sqlite` (both located via Vite `?url` imports — see §8); and a pure function `mapRowToWeapon(row: unknown[], columns: string[]): Weapon` that converts a raw `sql.js` result row into the existing `Weapon` type from `utils/weapon.ts` (snake_case → camelCase, `two_handed` `0`/`1` → `boolean`). A third function `queryAllWeapons(db: Database): Weapon[]` runs `SELECT * FROM WEAPONRY` and maps every row. |
| `composables/useWeaponryQuery.ts` | Owns the async side effect: on first call, invokes `loadWeaponryDatabase()` + `queryAllWeapons()` from `utils/weaponryDatabase.ts`, exposing reactive `weapons: Ref<Weapon[]>`, `loading: Ref<boolean>`, `error: Ref<unknown>`. Caches the loaded `Database` at module scope so repeated mounts of `WeaponSelect.vue` don't re-fetch/re-init `sql.js`. |
| `stores/characters.ts` | New Pinia store (see §5). |
| `components/initial-menu/ClassSelect.vue` | `<select>` bound to the active character's `characterClass`; on change, calls `charactersStore.setCharacterClass(...)`. |
| `components/initial-menu/AttributeList.vue` | Renders the 8 attributes (name, description, value) from `model/attribute.ts` + the active character's `attributes`. |
| `components/initial-menu/WeaponSelect.vue` | Uses `useWeaponryQuery()` to populate a `<select>`; shows a simple loading label while `loading` is `true`; on the weapon list arriving, if the active character's `weaponSlug` is still `null`, defaults it to the first weapon via `charactersStore.setCharacterWeapon(...)`; on manual change, calls the same action. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `scenes/InicialMenuScene.vue` | The `@start` handler now also calls `charactersStore.rollNewCharacter()` before switching `activeMenu` to `'configure-match'`. |
| `components/initial-menu/ConfigureMatchPanel.vue` | Replaces the "Coming soon" placeholder `<p>` with `ClassSelect`, `AttributeList`, and `WeaponSelect`, laid out above the existing "Start Battle"/"Back" buttons. |

### Out of scope for this plan

- `scenes/CombatScene.vue` and anything under `05-combat-scene` — untouched; the stored character is not
  yet read by the battle scene, per the spec's explicit scope boundary.
- `scripts/db/*` — the Node-side seed/reset/inspect scripts and schema are untouched; this plan only adds
  a second, independent (browser-side) way of reading the same `.sqlite` file.

## 5. State design (Pinia)

```
characters (new store)
  characters: Character[]   // only ever holds 0 or 1 entries in this feature; an array per the
                             // human's explicit instruction, to avoid reshaping this store later
                             // when multi-character party configuration is built
```

Where `Character` (from `model/character.ts`) is:

```
Character
  id: string                              // generated at roll time (e.g. crypto.randomUUID())
  characterClass: CharacterClass          // 'fighter' | 'wizard' | 'thief'
  attributes: Record<AttributeCode, number>  // the 8 Daemon attribute codes
  weaponSlug: string | null               // WEAPONRY.slug of the selected weapon; null until a
                                           // weapon list has loaded and a default/explicit pick is made
```

Actions (logic lives here only as thin orchestration — the actual math is the `src/utils/` functions
from §4, called by the action):

- `rollNewCharacter(): void` — calls `rollAttributePool()` then `distributeAttributes(pool, 'fighter')`;
  replaces `characters` with a single new `Character` (`characterClass: 'fighter'`, `weaponSlug: null`).
- `setCharacterClass(id: string, characterClass: CharacterClass): void` — finds the character, takes
  `Object.values(character.attributes)` as the existing 8-value pool (redistribution never loses or
  invents a value, so the pool doesn't need to be stored separately from the attributes map), calls
  `distributeAttributes(pool, characterClass)`, and replaces that character's `attributes` and
  `characterClass`.
- `setCharacterWeapon(id: string, weaponSlug: string): void` — sets that character's `weaponSlug`.

Getter: `activeCharacter: Character | undefined` (`characters[0]`), so components don't repeat
`characters[0]` lookups.

## 6. Logic design (composables)

| Composable | Responsibility | Inputs → Output | Store actions it calls |
| --- | --- | --- | --- |
| `useWeaponryQuery` | Loads `sql.js` + `game-data.sqlite` once (cached at module scope) and queries every `WEAPONRY` row, exposing it reactively to `WeaponSelect.vue`. | *(none)* → `{ weapons: Ref<Weapon[]>, loading: Ref<boolean>, error: Ref<unknown> }` | None — read-only static reference data, not battle state; the consuming component calls `charactersStore.setCharacterWeapon(...)` itself when a selection is made. |

The attribute-generation and distribution functions are intentionally **not** composables — they are
synchronous and side-effect-free, so they belong in `src/utils/` per CLAUDE.md, and are called directly
from the `characters` store's actions (§5), not wrapped in a composable layer that would add no value.

## 7. Rendering / HUD impact

- `ConfigureMatchPanel.vue` (DOM/Tailwind, no Pixi) grows from a static placeholder to a small form: a
  class `<select>`, a read-only list of 8 attribute rows, and a weapon `<select>` — all native HTML form
  controls styled with Tailwind, consistent with `02-initial-screen`'s decision to keep this screen
  outside Pixi and with the project's "no automated tests outside `src/utils/`" posture (plain,
  inspectable DOM controls are easy to manually verify).
- No GSAP animation is required for this feature — the spec does not ask for any transition beyond what
  `02-initial-screen` already provides (menu switch), and adding motion to a data-entry form is out of
  scope.
- No change to `usePixiApp`, `useBattlefieldCamera`, `useBattlefieldRenderer`, or `CombatScene.vue`.

## 8. Data layer impact

- No schema change to `WEAPONRY` (owned by `03-weapon-list-seeding`); this feature only adds its first
  runtime (browser) reader.
- `utils/weaponryDatabase.ts`'s `loadWeaponryDatabase()` resolves two assets through Vite's `?url` import
  suffix (no new build-time asset pipeline, no files added to `public/`):
  - `import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'` — the browser-targeted WASM binary
    `sql.js` itself ships (distinct from `sql-wasm.js`/`.wasm`, which the Node scripts under
    `scripts/db/` use); passed to `initSqlJs({ locateFile: () => sqlWasmUrl })`.
  - `import gameDataUrl from '@/data/game-data.sqlite?url'` — the same seeded file `03-weapon-list-seeding`
    produces and `scripts/db/sqliteFile.ts` writes to; fetched with `fetch(gameDataUrl)` →
    `.arrayBuffer()` → passed to `new SQL.Database(new Uint8Array(buffer))`.
- `queryAllWeapons(db)` runs a single `SELECT * FROM WEAPONRY` (no filtering/ordering requirement from
  the spec beyond "first weapon returned is the default") and maps every row via `mapRowToWeapon`.
- No write access to the database from the browser — read-only, matching the HLD's "Static data layer:
  read-only, seeded at build time" description.

## 9. External dependencies

No new npm package. This is the first browser (non-Node) usage of the already-installed `sql.js`
dependency (added in `01-project-initial-setup`, used so far only by `scripts/db/*`). The relevant API
surface — `initSqlJs({ locateFile })` returning `SQL`, `new SQL.Database(Uint8Array)`,
`db.exec(sql)` returning `{ columns, values }[]` — is already exercised by `scripts/db/sqliteFile.ts` and
`scripts/db/inspect.ts`/`seed.ts` in this codebase, so no Context7 lookup was needed beyond confirming (via
the installed package's own `package.json`, read directly) that it ships a separate `browser` entry point
and matching `.wasm` binary distinct from the Node one already in use.

## 10. Implementation sequencing

1. Add `model/character.ts` (`AttributeCode`, `CharacterClass`, `Character`) and `model/attribute.ts`
   (English name/description per attribute). No behavior yet — just types/data, independently reviewable.
2. Add `utils/attributeGeneration.ts` (`rollAttributePool`) with Vitest coverage: value range of the
   4d6-drop-lowest roll, and that exactly 8 of the 9 totals survive.
3. Add `utils/attributeDistribution.ts` (`distributeAttributes`, `shuffle`) with Vitest coverage: each
   class's tier assignment is correct for a fixed input pool (mock `Math.random` to make shuffling
   deterministic in tests, following the precedent already set in `04-dice-rolling-system`'s tests).
4. Add `stores/characters.ts` with `rollNewCharacter`, `setCharacterClass`, `setCharacterWeapon`, and the
   `activeCharacter` getter, built on steps 1–3. Verify in isolation (e.g. via a scratch call from the
   browser console during `npm run dev`) that `rollNewCharacter()` populates a plausible character.
5. Wire `scenes/InicialMenuScene.vue`'s `@start` handler to call `charactersStore.rollNewCharacter()`.
   Manually confirm (step 1 of §12) that clicking Start produces a new character each time.
6. Add `utils/weaponryDatabase.ts` (`loadWeaponryDatabase`, `mapRowToWeapon`, `queryAllWeapons`) and
   `composables/useWeaponryQuery.ts`. Verify in isolation (browser console or a temporary log inside
   `WeaponSelect.vue` during development) that the weapon list loads and matches
   `npm run db:inspect`'s output.
7. Build `components/initial-menu/ClassSelect.vue`, `AttributeList.vue`, and `WeaponSelect.vue`, then
   wire them into `ConfigureMatchPanel.vue` in place of the "Coming soon" text.
8. Full manual verification pass per §12.

Each step is independently checkable before moving to the next, so a broken SQLite/WASM load (the
riskiest step) doesn't get discovered only at the very end.

## 11. Technical risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| This is the first browser-side `sql.js` + WASM load in the project (the HLD already flags "SQLite-via-WASM integration brings unexpected complexity" as a tracked risk); the dev-server path and the production build path can resolve asset URLs differently | Medium/Medium | Test the weapon select under both `npm run dev` and `npm run build && npm run preview` (step 8 of §12), not just the dev server, before calling this feature done. |
| `sql.js`'s browser WASM init is asynchronous and happens once per page load; if `ConfigureMatchPanel.vue` is reached before it resolves, the weapon select would otherwise render empty with no explanation | Low/Low | `useWeaponryQuery`'s `loading` flag (per the human's explicit answer) drives a simple loading label in `WeaponSelect.vue` until the weapons array is populated. |
| Re-querying/re-initializing `sql.js` every time `WeaponSelect.vue` mounts (e.g. Back → Start → Configure Match again) would be wasteful and could race | Low/Low | `useWeaponryQuery` caches the loaded `Database` (and the in-flight loading promise) at module scope, so the browser-side DB is loaded at most once per page session. |
| Fisher–Yates shuffle relying on `Math.random()` makes the distribution functions' tests non-deterministic unless mocked | Low/Low | Mock `Math.random` in the Vitest suite for `attributeDistribution.ts`, mirroring the existing approach in `model/dieRoll.spec.ts`. |

## 12. Manual verification plan

1. Ensure the database is seeded: run `npm run db:reset && npm run db:seed` if not already done.
2. `npm run dev`, open the app, click "Start": confirm "Configure Match" shows the class select on
   "Fighter", 8 attribute rows with plausible 3–18 values, and a weapon select that briefly may show a
   loading label before settling on a selected weapon.
3. Confirm `FR`/`AGI`/`DEX`/`CON` show the 4 highest of the 8 displayed values and
   `INT`/`WILL`/`PER`/`CAR` the 4 lowest.
4. Switch the class select to "Wizard", then "Thief": confirm each class's tier rule (§5.3 of the spec)
   holds, using the same 8 numbers (no value changes, only reassignment).
5. Switch back to "Fighter" a few times: confirm the exact value-to-attribute mapping within a tier
   varies between switches (randomization is real, not a fixed order).
6. Change the weapon select to a different weapon: confirm no attribute value changes.
7. Click "Back" then "Start" again: confirm a brand-new 8-value roll appears (different numbers from
   step 2 — repeat a couple of times to be confident).
8. Run `npm run build && npm run preview`, repeat steps 2–3 against the production build, to catch any
   WASM/asset-path discrepancy between dev and build (per the risk in §11).
9. Run `npx vitest run` (or `npm run test`) and confirm the new `attributeGeneration`/`attributeDistribution`
   test files pass alongside the existing suite.
10. Run `npm run lint` and confirm it passes.

## 13. Open technical questions

None. The one notable tension — this spec's simplified 3-class model (`fighter`/`wizard`/`thief`) versus
the GDD's 8-class roster for the eventual battle scene — is not an open question for *this* plan (it was
already accepted as an explicit spec-level simplification), but is flagged here again so the future
feature that connects character creation to `05-combat-scene` does not miss it. No ADR is needed for that
now; it only becomes relevant once that future feature is scoped.

## 14. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | How should `sql.js` + the `.sqlite` file be loaded in the browser, given no runtime (non-Node) consumer exists yet? | Use a composable (`useWeaponryQuery`) that calls a plain async helper function living in `src/utils/` (`loadWeaponryDatabase`) to do the actual fetch/init — composable owns reactive state, utils owns the IO function itself. |
| 2 | Where should the new character state (class, 8 attributes, weapon) live? | A new, dedicated Pinia store, holding a `characters: Character[]` array (even though only one entry exists in this feature), so a future multi-character party-configuration feature doesn't need to reshape this store. |
| 3 | Does the weapon-loading composable need a loading/error UI state? | Yes — include a simple loading state/label while `sql.js`/the database initializes. |
| 4 | Should "Configure Match"'s new UI (class, attributes, weapon) be split into subcomponents or stay inline? | Split into subcomponents (`ClassSelect.vue`, `AttributeList.vue`, `WeaponSelect.vue`), consistent with the existing `initial-menu/` component pattern (`PixelButton.vue`, `PulsingTitle.vue`). |

## 15. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this planning session. Pricing reference (per the `claude-api` skill, current at time of
  writing): Claude Sonnet 5 — US$ 2.00 / 1M input tokens, US$ 10.00 / 1M output tokens.
