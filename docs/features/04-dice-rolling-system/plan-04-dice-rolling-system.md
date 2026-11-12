# Technical Plan: Dice Rolling System

**Slug:** `04-dice-rolling-system`
**Spec:** [spec-04-dice-rolling-system.md](spec-04-dice-rolling-system.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

This plan implements a small, framework-agnostic dice-rolling primitive consisting of a `Dice` type
(face count + notation description), seven fixed `Dice` constants (`d3`, `d4`, `d6`, `d8`, `d10`, `d12`,
`d100`), and a `DieRoll` class that rolls one or more `{ dice, modifier }` entries plus an overall
modifier, exposing a summed `getResult()` and a per-entry `getDetailedResult()` breakdown. The code lives
in a new `src/model/` folder (introduced by this plan — see section 3) rather than `src/utils/`, has no
dependency on Pixi/Pinia/Vue/GSAP, and carries no store, composable, or UI changes. It is pure,
Vitest-covered code meant to be consumed by future combat features (damage resolution, initiative,
percentile tests) without those features reinventing roll-plus-modifier math.

## 2. Source documents reviewed

| Document                                   | Key takeaways for this plan                                                                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-04-dice-rolling-system.md`            | Fully specifies the `Dice`/`DieRoll` API, edge cases, and Definition of Done; originally said `src/utils/`, amended during this planning session to `src/model/` (see §3 and interview notes).           |
| Trello card `04-dice-rolling-system`        | Description and checklist match the spec 1:1 (die set, constructor validation, `getResult`/`getDetailedResult`, `d100` never-zero, Vitest + lint passing, no UI/Pinia/composable touched); no extra context beyond the spec. |
| `docs/GDD-isometric-battle-prototype.md`    | Not consulted beyond what the spec's §2 "Daemon System grounding" table already extracts (percentile core mechanic, weapon damage dice, initiative roll, critical-hit doubling) — sufficient for this feature. |
| `docs/HLD-isometric-battle-prototype.json`  | No component models a dice-rolling primitive explicitly; `Combat Composables` is the future consumer. This feature sits below that layer and doesn't require an HLD update — it's an addition to the data/logic foundation, not a new architectural component. |
| Existing ADRs (`docs/adr/0001`–`0004`)      | None cover utility/model code organization; all four concern external libraries (PixiJS, `pathfinding`, GSAP, SQLite/WASM), which this feature doesn't touch.                                             |
| Current codebase                            | `src/utils/` exists and is empty; `src/{components,composables,scenes,stores}` are empty. No prior implementation to build on or conflict with.                                                          |

## 3. Architecture fit

CLAUDE.md's existing architecture describes a split between stateful Pinia stores, pure composables, and
presentation (Pixi/HUD), with `src/utils/` reserved for framework-agnostic pure functions (e.g. combat
formulas). This feature deviates from the spec's original `src/utils/` placement: per the human's
direction during planning, `Dice`/`DieRoll` are entities/models rather than free-standing utility
functions, so they are placed in a new `src/model/` folder instead. `src/model/` follows the same
constraint already applied to `src/utils/` (no Pixi/Pinia/Vue/GSAP dependency) and sits at the same
layer — below composables, consumed by them, never consuming them. This is a new, lightweight
convention, not a new architectural component in the HLD's sense (no store, no composable, no
render/HUD surface), so no HLD update is needed. Because it introduces a durable project convention
(where entities/models live going forward, distinct from `src/utils/`), the human has asked for it to be
recorded as a dedicated ADR (see section 13).

## 4. Affected surface

### New files/modules

| Path (relative to `src/`)   | Purpose                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `model/dice.ts`              | `Dice` type and the seven exported constants (`d3`, `d4`, `d6`, `d8`, `d10`, `d12`, `d100`).                 |
| `model/dice.spec.ts`         | Vitest coverage for the `Dice` constants: correct `faceNumber`/`description` per die.                        |
| `model/dieRoll.ts`           | `DieRoll` class: constructor, private `rollDie` helper, `getResult()`, `getDetailedResult()`, and the result-shape types those two methods return. |
| `model/dieRoll.spec.ts`      | Vitest coverage for `DieRoll`: construction validation, summation, breakdown shape, range bounds, and the edge cases in spec §7. |

### Modified files/modules

None.

### Out of scope for this plan

- `src/utils/` is left untouched — this feature does not add anything there, despite the spec originally
  naming it (see section 3).
- No Pinia store, composable, or Vue/HUD component is created or modified, per spec §4.
- No critical-hit doubling or percentile success/failure logic, per spec §4.

## 5. State design (Pinia)

Not applicable — this feature adds no Pinia store or state; `DieRoll` instances are plain objects owned
by whatever future composable constructs them.

## 6. Logic design (composables)

Not applicable — no composable is created or modified by this feature. `DieRoll` itself is the pure logic
unit; future composables (e.g. a hypothetical `useAttackResolution`) will import and call it, but that
integration is explicitly out of scope here (spec §4).

## 7. Rendering / HUD impact

Not applicable — no visual surface; this feature has no Pixi or DOM/HUD component.

## 8. Data layer impact

Not applicable — no SQLite/WASM schema or query changes; `Dice`/`DieRoll` are in-memory, code-level
constructs with no persisted or static data dependency.

## 9. External dependencies

None. No new npm package is introduced, and no existing library (PixiJS, GSAP, `pathfinding`, SQLite/WASM)
is used by this feature, so no Context7 lookup was needed.

## 10. Implementation sequencing

1. Create `src/model/dice.ts`: define the `Dice` type (`faceNumber: number`, `description: string`) and
   export the seven constants (`d3` through `d100`), each with `description` matching its notation
   (`'d3'`, `'d4'`, etc.).
2. Create `src/model/dice.spec.ts`: assert each constant's `faceNumber` and `description`.
3. Create `src/model/dieRoll.ts`:
   - Define the roll-entry shape (`{ dice: Dice; modifier: number }`) and the detailed-result shape
     (per-entry `rolledValue`, `modifier`, `subtotal`, plus overall `modifier` and `total`).
   - Implement the `DieRoll` class: constructor taking `roll: Array<{ dice; modifier }>` and
     `modifier: number`, throwing if `roll` is empty.
   - Implement a private instance method (e.g. `rollDie(dice: Dice): number`) that calls `Math.random()`
     directly and maps it into `1..dice.faceNumber` inclusive (and `1..100` for `d100`, never `0`).
   - Implement `getResult()`: re-rolls every entry on each call, sums rolled values + per-entry
     modifiers + the overall modifier.
   - Implement `getDetailedResult()`: re-rolls every entry on each call, returns the full breakdown
     described above; its `total` must equal what a contemporaneous `getResult()` call would return.
4. Create `src/model/dieRoll.spec.ts` covering:
   - Each die type's rolled value staying within `1..faceNumber` across many samples (unmocked
     `Math.random`), with a dedicated assertion that `d100` never yields `0`/`100+1` and `d3` never
     exceeds `3`.
   - `Math.random` mocked (via `vi.spyOn(Math, 'random')`) to assert exact `getResult()` /
     `getDetailedResult()` outputs for known inputs.
   - Constructor throwing on an empty `roll` array.
   - Multiple entries of the same `Dice` (e.g. two `d6` entries) reported independently in
     `getDetailedResult()` and summed correctly in `getResult()`.
   - Negative per-entry and overall modifiers subtracting correctly, with no clamping.
   - All modifiers at `0` reducing `getResult()` to the plain sum of rolled values.
   - Two consecutive calls to `getResult()`/`getDetailedResult()` being independent re-rolls (not
     asserting a specific relationship between them, since values are random, but asserting the method
     is called/executes each time — i.e. no caching logic exists in the implementation under test).
5. Run `npm run lint` and `npm run test` (`vitest run`) and confirm both pass.

Each step is independently verifiable: steps 1–2 and 3–4 are verified by running their respective spec
file; step 5 is the final, whole-suite gate.

## 11. Technical risks and mitigations

| Risk                                                                                   | Likelihood/Impact | Mitigation                                                                                                                                      |
| --------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mocking `Math.random` incorrectly produces false-positive tests (e.g. mock not reset)   | Low/Medium         | Restore the spy (`vi.restoreAllMocks()` or equivalent) in an `afterEach`, and keep mocked-RNG tests and range-sampling tests in clearly separate `describe` blocks. |
| Off-by-one error mapping `Math.random()` into `1..faceNumber` (classic fencepost bug)   | Medium/Medium      | Use the well-known `Math.floor(Math.random() * faceNumber) + 1` formula consistently for every die, including `d100`; cover with the range-bound tests in step 4. |
| `src/model/` convention introduced here is not documented anywhere else in the project  | Medium/Low         | Captured in this plan (section 3) and flagged for a dedicated ADR (section 13) so the convention is discoverable before the next feature needs it. |

This feature carries no connection to the HLD's tracked risks (pathfinding complexity, runtime
performance, SQLite/WASM integration) — it is a self-contained, synchronous, in-memory utility.

## 12. Manual verification plan

Per spec §11, this feature has no UI/Pinia integration, so verification is limited to the automated
suite plus an optional ad-hoc check:

1. Run `npm run test` and confirm every `dice.spec.ts`/`dieRoll.spec.ts` test passes, including the
   range-bound and mocked-RNG assertions from sequencing step 4.
2. Run `npm run lint` and confirm it passes with no errors.
3. Optionally, in a scratch `it.only` block or the browser console during `npm run dev`, construct a
   `DieRoll` mixing a `d10` entry and a `d6` entry (each with a small modifier) plus an overall modifier,
   and confirm `getResult()` equals the manually summed value from `getDetailedResult()`'s breakdown.

## 13. Open technical questions

- **`src/model/` vs. `src/utils/` convention** — the human has asked for this to become a dedicated
  Architecture Decision Record via the `architecture` skill, recording why entities/models (starting with
  `Dice`/`DieRoll`) live in `src/model/` rather than `src/utils/`, and what belongs in each going
  forward. This should happen before or shortly after this feature's implementation, so the next feature
  that needs a model/entity has a documented place to put it.

## 14. Interview notes

| #   | Question                                                                                   | Answer                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | One file for `Dice`+`DieRoll`, or two separate files?                                        | Two files: `dice.ts` and `dieRoll.ts`, placed in a new `src/model/` folder (not `src/utils/`) that will hold entities/models going forward.                   |
| 2   | Where should the RNG seam live, given tests need to mock it?                                 | A private method on `DieRoll` calling `Math.random()` directly.                                                                                              |
| 3   | The new `src/model/` location conflicts with the spec's `src/utils/` non-functional requirement — how to resolve? | Create `src/model/` and amend the spec accordingly (spec §4, §6, §10, and interview notes updated to say `src/model/`). |
| 4   | Should the new `src/model/` convention get a dedicated ADR, or just be recorded in this plan? | Write a dedicated ADR via the `architecture` skill.                                                                                                           |

## 15. Token usage and estimated cost

| Metric               | Value                                                                        |
| --------------------- | ----------------------------------------------------------------------------- |
| Model                | Claude Sonnet 5 (`claude-sonnet-5`)                                           |
| Input tokens         | Not measurable from within this session — no token-usage tool available       |
| Output tokens        | Not measurable from within this session — no token-usage tool available       |
| Estimated cost (USD) | Not computable without the above token counts                                 |
| Estimated cost (BRL) | Not computable without the above token counts                                 |

- Pricing reference (current at time of writing): Claude Sonnet 5 — $2.00 / 1M input tokens, $10.00 / 1M
  output tokens (Anthropic first-party rates).
- USD/BRL reference rate on 2026-11-12: ≈ R$5.57 (same reference used in the spec, dated one day prior; no
  more recent rate was available within this session).
- The `/usage` Claude Code command only reports subscription percentage usage, not absolute token counts,
  so it could not be used to derive a dollar figure.
