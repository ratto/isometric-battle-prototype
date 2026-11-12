# Dev Report: Dice Rolling System

**Slug:** `04-dice-rolling-system`
**Plan:** [plan-04-dice-rolling-system.md](../plan-04-dice-rolling-system.md)
**Branch:** `feature/04-dice-rolling-system`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

Implemented the dice-rolling primitive described in the plan: a `Dice` type and seven exported constants
(`d3`, `d4`, `d6`, `d8`, `d10`, `d12`, `d100`), and a `DieRoll` class that rolls one or more
`{ dice, modifier }` entries plus an overall modifier, exposing a summed `getResult()` and a per-entry
`getDetailedResult()` breakdown. Both live in a new `src/model/` folder (per ADR-0005), with no Pixi,
Pinia, Vue, GSAP, store, composable, or UI changes — exactly as scoped. The implementation follows the
plan's sequencing step by step and is fully covered by a Vitest suite (23 tests, all passing), with lint,
Prettier formatting, and a type-check all passing clean.

## 2. Source documents reviewed

| Document                                   | Key takeaways for this implementation                                                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `plan-04-dice-rolling-system.md`            | Fully specified file layout (`src/model/dice.ts`, `dice.spec.ts`, `dieRoll.ts`, `dieRoll.spec.ts`), the RNG seam (private `rollDie` method calling `Math.random()` directly), and a step-by-step sequencing that was followed as written. |
| `docs/HLD-isometric-battle-prototype.json`  | No deviation needed — this feature sits below the Combat Composables layer and introduces no new component.                              |
| ADR-0005 (`src/model/` vs `src/utils/`)     | Confirmed the decision to place `Dice`/`DieRoll` in `src/model/`, not `src/utils/`; respected as written, no deviation.                    |
| `spec-04-dice-rolling-system.md`            | Confirmed the functional requirements and edge cases (empty-`roll` rejection, `d100` never `0`, negative modifiers, same-`Dice` multiple entries, re-rolling on every call) that the test suite needed to cover. |
| Existing codebase                           | `src/utils/` and `src/model/` were both empty/non-existent before this task — no prior implementation to reuse or conflict with.          |

## 3. Branch and Trello

| Item                          | Value                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Starting branch               | `feature/04-dice-rolling-system`                                                                |
| Branch used for this task     | `feature/04-dice-rolling-system` (reused — already matched the slug, confirmed by human)        |
| Trello card                   | `https://trello.com/c/` + card id `6af46da8935bbc3a22cc8299` (board "Turn based prototype")      |
| Trello card moved to "Ongoing" | Yes                                                                                            |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `model/dice.ts`             | `Dice` type and the seven exported constants (`d3`, `d4`, `d6`, `d8`, `d10`, `d12`, `d100`).            |
| `model/dice.spec.ts`        | Asserts each constant's `faceNumber` and `description`.                                                |
| `model/dieRoll.ts`          | `RollEntry`/`DetailedRollEntry`/`DetailedResult` types and the `DieRoll` class (constructor, private `rollDie`, `getResult()`, `getDetailedResult()`). |
| `model/dieRoll.spec.ts`     | Construction validation, rolled-value range checks (200 samples per die, including `d100` never-zero), mocked-`Math.random` exact-outcome checks, and the edge cases from spec §7. |

### Modified files/modules

None.

### Commits made on this branch

| Commit (short hash) | Message                                                     |
| --------------------- | -------------------------------------------------------------- |
| `00a9036`             | `Add technical plan and ADR for the dice rolling system`       |
| `bb57f1b`             | `Implement the dice rolling system`                             |

## 5. Deviations from the plan

None — implemented exactly as planned. The private `rollDie(dice: Dice): number` method uses
`Math.floor(Math.random() * dice.faceNumber) + 1`, which the plan's risk section (§11) called out as the
standard fencepost-safe formula; it is used uniformly for every die, including `d100`, so `0` is never
produced.

## 6. External dependencies / Context7 lookups

None — no new npm package or library API was used; `Math.random` and standard Vitest APIs
(`vi.spyOn`, `it.each`) required no Context7 lookup.

## 7. Manual verification performed

Per the plan (§12), this feature has no UI/Pinia integration, so verification was limited to the
automated suite, lint, a type-check, and one ad-hoc numeric check:

| # | Step taken | Expected result | Actual result |
| - | ----------- | ------------------ | ---------------- |
| 1 | Ran `npm run test` (`vitest run`) | All `dice.spec.ts`/`dieRoll.spec.ts` tests pass | 2 test files, 23 tests, all passed |
| 2 | Ran `npm run lint` | No lint errors | Passed with no output/errors |
| 3 | Ran `npx prettier --check src/model` | New files match the project's Prettier config | "All matched files use Prettier code style!" |
| 4 | Ran `npx vue-tsc -b --noEmit` | No type errors across the project | No output, no errors |
| 5 | Ad-hoc Node script summing a mocked `d6`+`d10` roll with per-entry and overall modifiers two ways (plain sum vs. detailed-breakdown-style sum) | Both sums equal | Both equaled `22`, confirming `getResult()`'s total and `getDetailedResult()`'s breakdown use consistent arithmetic |

## 8. Known issues / follow-ups

- ADR-0005's action item #1 (update CLAUDE.md's folder list to mention `src/model/`) is still open and
  was intentionally left for a future, separate change, per the ADR's own wording.
- No other follow-ups; the feature is self-contained and ready to be consumed by a future attack
  resolution, initiative, or percentile-test feature.

## 9. Pull request

| Item                        | Value       |
| ----------------------------- | ------------- |
| Human approval to push/PR    | Pending      |
| PR URL                        | Not opened yet |
| Trello card moved to "Done"  | Not yet — pending human approval to push/PR, per the skill's workflow |

## 10. Token usage and estimated cost

| Metric                  | Value                                                                  |
| ------------------------- | ------------------------------------------------------------------------- |
| Model(s) used            | Claude Sonnet 5 (`claude-sonnet-5`)                                        |
| Input tokens (approx.)   | Not measurable from within this session — no token-usage tool available    |
| Output tokens (approx.)  | Not measurable from within this session — no token-usage tool available    |
| Estimated cost (USD)     | Not computable without the above token counts                              |
| Estimated cost (BRL)     | Not computable without the above token counts                              |

- No figures in this section are exact or approximated from an observed count; this session has no tool
  exposing absolute token usage, only the `/usage` command's subscription-percentage view.
- Pricing reference (current at time of writing, for context if token counts become available later):
  Claude Sonnet 5 — $2.00 / 1M input tokens, $10.00 / 1M output tokens (Anthropic first-party rates);
  USD/BRL ≈ R$5.57 (same reference rate used in the spec and plan for this feature).
