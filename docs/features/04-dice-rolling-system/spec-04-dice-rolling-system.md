# Spec: Dice Rolling System

**Slug:** `04-dice-rolling-system`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-11

## 1. Summary

This feature introduces a small, reusable dice-rolling primitive for the prototype: a `Dice` type
describing a die face count plus its notation label, and a `DieRoll` class that rolls one or more dice
(each with its own modifier) plus an overall modifier, exposing both a summed total and a per-die
breakdown. It is built now, in isolation from any specific combat mechanic, as the foundational utility
that future features (weapon damage, initiative, percentile tests) will build on top of.

## 2. Daemon System grounding

| Mechanic | Rules reference section | Notes on how it's used here |
| --- | --- | --- |
| Percentile core mechanic (`1d100`, "00 = 100") | §1 Core resolution mechanic | `d100`'s random generator produces directly in the `1-100` range, so "00 reads as 100" is satisfied structurally — no special-case code is needed. This feature does not implement the "any roll above 95 always fails" rule; that belongs to a future test-resolution feature. |
| Weapon/attack damage dice (`1d6`, `1d10`, `1d3`) | §6 Combat → Damage, Melee weapons table | `d3`, `d6`, `d10` are part of the fixed `Dice` set this feature creates, since they appear directly in the melee weapons table's damage column. |
| Initiative roll (`1d10 + AGI + modifiers`) | §6 Combat → Initiative | `DieRoll` is the primitive a future initiative composable would use to roll `1d10` and add attribute/weapon modifiers — not implemented here. |
| Critical hit (damage dice rolled twice) | §6 Combat → Critical hit | Explicitly out of scope for this feature (see §4) — doubling the dice roll on a crit is a concern for whoever resolves attacks later, not for `DieRoll` itself. |

**Intentional deviation:** the reference only ever uses `d3`, `d6`, `d10`, and `d100`. This feature also
creates `d4`, `d8`, and `d12`, which no mechanic in the reference currently uses. This is a conscious
choice (per the Golden Rule, §14) to build a generic, slightly oversized dice set now rather than
extending it piecemeal later — documented here so it isn't mistaken for an oversight.

## 3. Goal and value

- **Goal:** provide a correct, type-safe, unit-tested dice-rolling building block that later combat
  features (damage resolution, initiative, percentile tests) can depend on, without those features
  having to reinvent random-roll-plus-modifier logic.
- **Value:** technical foundation for the spike. Validates the `Dice`/`DieRoll` API shape early and
  cheaply (pure functions, Vitest-covered) before it gets wired into Pinia/composables, reducing rework
  risk in later combat features.

## 4. Scope

### In scope

- A `Dice` type with `faceNumber` and `description` fields.
- A fixed, exported set of `Dice` constants: `d3`, `d4`, `d6`, `d8`, `d10`, `d12`, `d100`.
- A `DieRoll` class:
  - Constructor takes `roll: Array<{ dice: Dice; modifier: number }>` (at least one entry — the
    constructor must reject an empty array) and an overall `modifier: number`.
  - Instance method `getResult(): number` — the grand total (sum of all rolled dice values, all
    per-entry modifiers, and the overall modifier).
  - Instance method `getDetailedResult()` — a breakdown listing, for each `roll` entry, the raw rolled
    value, that entry's modifier, and the entry's subtotal, plus the overall modifier and the grand
    total.
- Random value generation per die type, respecting each die's face count (`1` to `faceNumber`
  inclusive), with `d100` always generating in `1-100` (never `0`).
- Multiple dice of the same type are expressed as multiple separate `{ dice, modifier }` entries in
  `roll` (e.g. "2d6" = two entries with `dice: d6`) — no `quantity` field.
- Vitest unit tests covering the die types, `getResult`, `getDetailedResult`, and the edge cases in §7.

### Out of scope

- Any UI, Pinia store, or composable integration — this is a pure `src/utils/` utility only.
- Critical-hit doubling logic (doubling dice rolls, not the fixed modifier) — left for a future attack
  resolution feature to implement on top of `DieRoll`.
- The percentile success/failure rule ("≤ target is success", "above 95 always fails") — left for a
  future test-resolution feature.
- A `quantity` field or any other extension to the `{ dice, modifier }` roll-entry shape beyond what's
  specified above.
- Seeded/deterministic random number generation for production use (tests may mock `Math.random`
  internally, but no seedable RNG is exposed as part of the public API).

## 5. Functional requirements

1. `Dice` is exported as a type with exactly `faceNumber: number` and `description: string`.
2. Seven `Dice` constants are exported: `d3` (faceNumber 3), `d4` (4), `d6` (6), `d8` (8), `d10` (10),
   `d12` (12), `d100` (100), each with a `description` matching its common notation (`'d3'`, `'d4'`,
   etc.).
3. `DieRoll`'s constructor throws if `roll` is empty.
4. `DieRoll` is instantiable with one or more `{ dice, modifier }` entries of different `Dice` types in
   the same `roll` array.
5. `getResult()` returns a single number equal to the sum of: each entry's randomly rolled die value,
   each entry's `modifier`, and the `DieRoll`'s overall `modifier`.
6. `getDetailedResult()` returns, for each `roll` entry (in the same order as provided), the raw rolled
   value, that entry's modifier, and that entry's subtotal (rolled value + modifier); plus the overall
   modifier and the grand total (equal to what `getResult()` returns).
7. Every rolled value for a given `Dice` falls within `1` and that die's `faceNumber`, inclusive, for
   every die in the fixed set — including `d100`, which must never produce `0`.
8. Calling `getResult()` or `getDetailedResult()` multiple times on the same `DieRoll` instance may
   return different totals each time (each call re-rolls — rolls are not cached on construction), since
   nothing in the sketch or the interview asked for a frozen/"already rolled" instance.

## 6. Non-functional requirements

- Lives under `src/utils/` as a pure, framework-agnostic module (no Pixi, Pinia, Vue, or GSAP
  dependency), per [CLAUDE.md](../../../CLAUDE.md)'s architecture split between stateless utils and
  stateful stores/composables.
- Written entirely in English (code, identifiers, comments, this document), per this repository's
  language policy.

## 7. Edge cases

| Edge case | Expected behavior |
| --- | --- |
| `roll` array is empty | Constructor throws — a `DieRoll` with no dice is invalid. |
| Single `{ dice, modifier }` entry | `getResult()`/`getDetailedResult()` work the same as with multiple entries; just one subtotal. |
| Multiple entries using the same `Dice` (e.g. two `d6` entries for "2d6") | Each entry is rolled and reported independently in `getDetailedResult()`; `getResult()` sums all of them. |
| Negative per-entry `modifier` or negative overall `modifier` | Allowed; subtracts from the total as a plain number — no clamping to zero. |
| Overall `modifier` is `0` and all per-entry modifiers are `0` | `getResult()` equals the plain sum of rolled values. |
| `d100` roll | Always an integer in `1-100`; `0`/`"00"` never appears as a raw value. |
| Smallest die (`d3`) roll | Always an integer in `1-3`. |

## 8. Risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Randomness makes naive tests flaky or untestable | Medium/Medium | Tests mock/stub the underlying random source (e.g. `Math.random`) to assert exact outcomes, and separately assert range bounds (1 to faceNumber) across many samples for the non-mocked path. |
| Scope creep toward implementing combat mechanics (criticals, percentile success) inside `DieRoll` | Medium/Low | Explicitly listed as out of scope in §4; any such logic belongs to a future feature that consumes `DieRoll`, not to this one. |
| `d4`/`d8`/`d12` sit unused for a long time, inviting removal or confusion later | Low/Low | Documented explicitly in §2 as an intentional, conscious inclusion, not an oversight. |

## 9. Dependencies

Not applicable — this is a foundational, standalone utility with no dependency on existing project code.
It is expected to become a dependency of future features (weapon damage resolution, initiative,
percentile test resolution), but depends on nothing itself.

## 10. Definition of Done

- [ ] `Dice` type and the seven die constants (`d3`, `d4`, `d6`, `d8`, `d10`, `d12`, `d100`) are
      implemented in `src/utils/`.
- [ ] `DieRoll` class is implemented with a constructor validating a non-empty `roll` array, and
      instance methods `getResult()` and `getDetailedResult()`.
- [ ] Vitest test suite covers: each die type's value range, `getResult()`'s summation (dice + per-entry
      modifiers + overall modifier), `getDetailedResult()`'s per-entry breakdown, the empty-`roll`
      rejection, and the `d100` never-zero case.
- [ ] `npm run lint` and the Vitest suite both pass.
- [ ] No UI, Pinia, or composable code was added or modified as part of this feature.

## 11. Manual verification plan

This feature has no UI or Pinia integration (per §4, out of scope), so manual verification is limited to
the automated suite and an optional ad-hoc console check:

1. Run `npx vitest run` (or the project's configured test script) and confirm all `DieRoll`/`Dice` tests
   pass.
2. Optionally, in a scratch Node/Vitest `it.only` block or the browser console during `npm run dev`,
   construct a `DieRoll` mixing two different dice (e.g. one `d10` entry and one `d6` entry, each with a
   small modifier, plus an overall modifier) and confirm `getResult()` equals the manually summed value
   from `getDetailedResult()`'s breakdown.

## 12. Open questions

None.

## 13. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | Slug confirmation | `04-dice-rolling-system`, as given in the initial request. |
| 2 | Business goal | Reusable foundation for future combat features, not tied to one mechanic yet. |
| 3 | Should critical-hit dice-doubling be part of `DieRoll`? | No — out of scope; a future attack-resolution feature's job. |
| 4 | Should `1d3` (d6÷2 round up) be modeled? | Yes — but as a real `Dice` entry (`faceNumber: 3`, `description: 'd3'`), not derived from `d6`. |
| 5 | How to resolve the tension between "only d4/d6/d8/d10/d12/d100" (initial request) and the rules reference only using d3/d6/d10/d100? | Keep the originally requested six dice plus add `d3`: fixed set is d3, d4, d6, d8, d10, d12, d100. d4/d8/d12 documented as having no current mechanic. |
| 6 | How should `d100` avoid the "00 = 100" special case? | Generate directly in the `1-100` range; never generate `0`. |
| 7 | What should `getDetailedResult()` return? | Per-entry raw value + that entry's modifier + subtotal, plus the overall modifier and grand total. |
| 8 | Can `DieRoll.roll` be an empty array? | No — constructor must require at least one entry. |
| 9 | How to express "2d6" given the `{ dice, modifier }` shape has no quantity field? | Two separate entries in the `roll` array, both with `dice: d6`. |
| 10 | How should this be manually verified, given no automated test runner covers UI/Pinia code? | Vitest coverage in `src/utils/` is sufficient Definition of Done; no manual browser verification required since there's no UI/Pinia integration. |
| 11 | Are `getResult`/`getDetailedResult` static or instance methods? | Instance methods — the `static` in the original sketch was a slip; they read the instance's own `roll`/`modifier`. |

## 14. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not measurable from within this session — no token-usage tool available to the assistant |
| Output tokens | Not measurable from within this session — no token-usage tool available to the assistant |
| Estimated cost (USD) | Not computable without the above token counts |
| Estimated cost (BRL) | Not computable without the above token counts |

- Pricing reference (current at time of writing): Claude Sonnet 5 — $2.00 / 1M input tokens, $10.00 / 1M
  output tokens (Anthropic first-party rates).
- USD/BRL reference rate on 2026-11-11: ≈ R$5.57 (source: CNN Brasil, InfoMoney market coverage of that
  date).
- The `/usage` Claude Code command only reports subscription percentage usage (e.g. "12% of current
  session"), not absolute input/output token counts for this task, so it could not be used to derive a
  dollar figure. Exact figures would require a token-usage/cost tool this session did not have access
  to.
