# Spec: Character Enhancement List

**Slug:** `07-character-enhancement-list`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-14

## 1. Summary

This feature lets the player pick **Enhancements** (Aprimoramentos) when creating a character, inside
the same "Configure Match" modal introduced by `06-first-character-creation` (where attributes and the
weapon select already live). Six new selects are added — three for positive Enhancements, three for
negative Enhancements — sourced from a new `ENHANCEMENTS` database table seeded from
`docs/daemon-system-enhancements.json`. The player may choose as many or as few Enhancements as they
like, but the net point cost must respect the Sistema Daemon Enhancement budget (§10 of the rules
reference): 5 base points, extendable by taking Negative Enhancements (up to 3 points' worth), which
buy back positive budget. Picked Enhancements are stored on the character in Pinia; this US does not
wire their mechanical effects into any combat formula.

## 2. Daemon System grounding

| Mechanic | Rules reference section | Notes on how it's used here |
| --- | --- | --- |
| Enhancements (Aprimoramentos) and their point economy | §10 Enhancements | Humans start with 5 Enhancement points; up to 3 Negative Points may be taken, each buying back one positive point. This feature implements that budget rule verbatim: `positive budget = 5 + min(sum of negative-point magnitudes taken, 3)`, and the sum of chosen positive costs must not exceed that budget. |
| Enhancement catalog (names, costs, effects) | §10 Enhancements (table) + `docs/daemon-system-enhancements-catalog.md` §2 | The specific Enhancement list used here is the English-translated catalog already compiled in `docs/daemon-system-enhancements.json`, not the shorter excerpt embedded directly in the rules reference's §10 table. This is a broader, but still Módulo Básico-sourced, list. |

**Intentional deviation:** the official rule leaves the leveled cost of multi-tier Enhancements (e.g.
"Arcane Library" at 1/2/3) as a single Enhancement the player buys up incrementally over time. For this
spike, each tier is instead flattened into its own independently selectable option (e.g. "Arcane
Library (Tier 1)", "Arcane Library (Tier 2)", "Arcane Library (Tier 3)"), and tiers of the same
Enhancement never stack — picking one tier removes the others from the available options. This keeps
the UI a simple flat select instead of a two-step "Enhancement, then level" picker, at the cost of not
modeling the "must own level 1 before buying level 2" prerequisite from §10. Accepted as a conscious
simplification for this spike.

**Intentional deviation:** the official layout in §10 does not prescribe a fixed number of visible
option slots; this feature fixes it at **3 positive + 3 negative selects** (6 total) as a concrete,
reviewable UI shape for the spike, rather than a dynamic "add another Enhancement" list.

## 3. Goal and value

- **Goal:** validate that a point-budgeted Enhancement-picking flow — mixing positive (cost) and
  negative (refund) choices against a shared budget — can be exposed to the player through a simple
  select-based UI, extending the character-creation flow from `06-first-character-creation` with the
  next Sistema Daemon character-creation step (§9, step 4: Enhancements).
- **Value:** gives the human a second concrete character-creation building block (after class/
  attributes/weapon) to sanity-check — does the budget feel tight or generous, is the tier-exclusion
  behavior clear — before any future feature spends effort wiring Enhancement effects into actual
  combat math.

## 4. Scope

### In scope

- A new `ENHANCEMENTS` SQLite table, seeded via a new seed script (mirroring the pattern from
  `03-weapon-list-seeding`), with one row per Enhancement **tier**:
  - `id` — row primary key.
  - `name` — the Enhancement's display name, including its tier when the Enhancement has more than one
    (e.g. `"Arcane Library (Tier 2)"`); untiered Enhancements keep their plain name.
  - `groupKey` — shared across all tier-rows of the same Enhancement (e.g. all three "Arcane Library"
    rows share one `groupKey`), used for mutual exclusion in the UI.
  - `polarity` — `"positive"` or `"negative"`.
  - `cost` — a single signed integer for this specific tier (positive Enhancements: positive integer;
    negative Enhancements: negative integer, matching the JSON's sign).
  - `effect` — the English effect description for this tier, copied from
    `docs/daemon-system-enhancements.json`.
  - Source data: every entry in `docs/daemon-system-enhancements.json`, under both its `positive` and
    `negative` top-level keys, with every `cost` value split into one row per tier (a `"cost": "1 / 2 /
    3"` or `"cost": "1-5"` entry becomes 3 or 5 rows respectively; a single-number `cost` becomes 1 row).
  - A seed script (`npm run db:seed` extension or a new script, per the `03-weapon-list-seeding`
    pattern) that (re)populates this table from the JSON file at seed time.
- A new read-only query/composable that reads all `ENHANCEMENTS` rows, analogous to the existing
  `WEAPONRY` query from `06-first-character-creation`.
- Six new selects added to the "Configure Match" modal, below the existing attributes/weapon section:
  three for positive Enhancements, three for negative Enhancements.
  - Each select's option list is every `ENHANCEMENTS` row of the matching `polarity`, labelled with
    `name` (which already encodes the tier) — minus any tier already chosen in another select of the
    same polarity (see mutual exclusion below), minus any option that would push the running point
    total over budget.
  - Each select defaults to a "None" option (no Enhancement chosen).
- Mutual exclusion / no-duplicates rule: once a tier of a given `groupKey` is selected in one select,
  every other tier sharing that `groupKey` is removed from the option lists of the other selects of the
  same polarity (so a player can never hold two tiers, or two copies, of the same Enhancement).
- Budget enforcement, computed live as selects change:
  - `negativePointsTaken` = sum of the absolute value of the `cost` of all currently selected negative
    Enhancements, capped at 3 for budget purposes.
  - `positiveBudget` = `5 + negativePointsTaken`.
  - `positiveSpent` = sum of the `cost` of all currently selected positive Enhancements.
  - Any positive-select option whose selection would make `positiveSpent` exceed `positiveBudget` is
    disabled (greyed out, not selectable) rather than merely warned about after the fact.
  - A visible running-total readout near the six selects, e.g. `"Enhancement points: 3 / 5 (+2 from
    Negative Enhancements)"`.
- Storing the player's final Enhancement picks (list of chosen `ENHANCEMENTS` row ids, or an empty list)
  on the character in the existing Pinia character store from `06-first-character-creation`.

### Out of scope

- Applying any Enhancement's mechanical effect to combat math, attribute values, or any other derived
  stat — this US only selects and stores picks; no formula in `src/utils/` or composable reads them yet.
- The "must own a lower tier before buying a higher one" prerequisite from §10 — tiers are mutually
  exclusive alternatives in this UI, not a ladder the player climbs.
- Any Enhancement outside `docs/daemon-system-enhancements.json` (e.g. the §1 catalog list that has
  names only, no cost/effect text, or anything from non-Módulo-Básico sourcebooks).
- Enforcing the official "max 3 Negative Points" as a hard cap on *how many* negative Enhancements can
  be selected — it is only enforced as the cap on how much budget they can buy back (a player could in
  principle select more negative magnitude than 3; the excess simply contributes nothing further to
  `positiveBudget`). See Edge cases (§7) for the exact behavior.
- Changing the existing class/attributes/weapon behavior from `06-first-character-creation`.
- Per-class restrictions on which Enhancements are available (all Enhancements are available to every
  class).
- Persisting picks across a page reload, multiple characters, or NPC/enemy Enhancements — consistent
  with `06-first-character-creation`'s existing scope limits.

## 5. Functional requirements

1. `ENHANCEMENTS` is seeded with one row per tier of every Enhancement in
   `docs/daemon-system-enhancements.json`, carrying `id`, `name` (tier-qualified where applicable),
   `groupKey`, `polarity`, `cost`, and `effect`, as described in §4.
2. A new query/composable reads all `ENHANCEMENTS` rows (optionally filterable by `polarity`), mirroring
   the existing `WEAPONRY` query's pattern.
3. "Configure Match" renders 3 positive-Enhancement selects and 3 negative-Enhancement selects, each
   defaulting to "None".
4. Each select's options are populated live from `ENHANCEMENTS`, filtered to the select's polarity,
   excluding: (a) any `groupKey` already chosen in a sibling select of the same polarity, and (b) for
   positive selects, any option whose `cost` would push `positiveSpent` over `positiveBudget` if chosen.
5. Selecting an Enhancement in one select immediately removes all other tiers of its `groupKey` from the
   other selects of the same polarity (if currently shown there as options), and updates the running
   point-total readout.
6. Deselecting an Enhancement (choosing "None" in a select that previously held a value) returns its
   `groupKey`'s other tiers to the option lists of the sibling selects (subject to budget) and updates
   the running total.
7. The budget readout displays, at minimum: positive points spent, positive budget available (base 5
   plus any budget bought back by negative picks), and the number of negative points currently
   contributing to that budget.
8. On confirming character creation (or whenever the character is otherwise persisted, per
   `06-first-character-creation`'s existing flow), the list of currently selected `ENHANCEMENTS` row ids
   (possibly empty) is stored on the character in Pinia.
9. Changing the class or weapon selects (existing `06-first-character-creation` behavior) does not clear
   or modify the Enhancement selections.

## 6. Non-functional requirements

- State: selected Enhancement ids live on the existing character Pinia store — data only, mutated
  through actions — per CLAUDE.md's state/logic split.
- Logic: budget computation (`positiveBudget`, `positiveSpent`, `negativePointsTaken`, and the
  option-filtering/exclusion rules) is implemented as pure functions in `src/utils/`, covered by Vitest,
  consistent with CLAUDE.md's testing scope and the pattern already used for
  `06-first-character-creation`'s attribute-distribution functions.
- Rendering: the six new selects are plain Vue + Tailwind DOM additions to the existing "Configure
  Match" modal — no Pixi involvement, consistent with that modal's existing nature.
- Data access: `ENHANCEMENTS` is read through a new read-only query/composable built on the existing
  `sql.js` setup — no new database engine.
- UI text/labels and all seeded `name`/`effect` content: English, per CLAUDE.md's language policy (the
  source JSON is already in English).

## 7. Edge cases

| Edge case | Expected behavior |
| --- | --- |
| Player selects negative Enhancements whose combined magnitude exceeds 3 (e.g. three `-2` picks = magnitude 6) | `negativePointsTaken` is capped at 3 for budget purposes (`positiveBudget` maxes out at `5 + 3 = 8`); the extra negative magnitude beyond 3 is still "spent" (the Enhancement is still selected and stored) but contributes no further budget. |
| Player picks only negative Enhancements and no positive ones | Allowed; `positiveSpent` stays 0, well under budget. |
| Player picks zero Enhancements at all (all 6 selects on "None") | Allowed; stored Enhancement list is empty. |
| Deselecting a positive Enhancement that was making another previously-disabled option exceed budget | That other option becomes selectable again immediately, since `positiveSpent` drops. |
| Two different Enhancements with the same numeric `cost` (e.g. two different Enhancements both costing 2) | Both remain independently selectable; the mutual-exclusion rule only applies within the same `groupKey`, never across different Enhancements. |
| `ENHANCEMENTS` query returns zero rows (e.g. database not seeded) | All six selects render with only the "None" option; this is a known degraded state resolved by `npm run db:seed`, not a crash — mirrors `06-first-character-creation`'s equivalent `WEAPONRY` edge case. |
| Switching class or weapon after picking Enhancements | No effect on the stored Enhancement picks (requirement 9). |

## 8. Risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| The official 5-point budget is tight against this catalog's costs (several positive Enhancements cost 3-4 on their own), so most characters will end up with only 1-2 positive picks net of negatives | High/Low | Accepted as faithful to §10's official budget; this is a spike validating the selection flow and its constraints, not final game balance. The human can revisit the budget rule later if it feels too restrictive during manual testing. |
| Flattening tiered Enhancements into separate rows/options could confuse a reader expecting "buy Arcane Library, then upgrade it" | Low/Low | Documented explicitly as an intentional deviation (§2); tier names make the distinction visible in the UI (e.g. "(Tier 2)"). |
| Live option-disabling across 6 interdependent selects could have subtle bugs (e.g. stale disabled state after a deselect) | Medium/Medium | Keep the budget/exclusion logic in small, pure, independently testable functions in `src/utils/` with Vitest coverage, rather than scattering the rules across select change-handlers. |

## 9. Dependencies

- Depends on `06-first-character-creation` (the "Configure Match" modal and its Pinia character store,
  which this feature extends with Enhancement selects and picks).
- Depends on `docs/daemon-system-enhancements.json` as the seed source (already created and committed).
- Mirrors the seeding pattern from `03-weapon-list-seeding` for the new `ENHANCEMENTS` table.
- Does not block or get blocked by `05-combat-scene`; wiring Enhancement effects into combat is left to
  a future US.

## 10. Definition of Done

- [ ] `ENHANCEMENTS` table exists and is seeded with one row per tier of every Enhancement in
      `docs/daemon-system-enhancements.json`, with `id`, `name`, `groupKey`, `polarity`, `cost`, and
      `effect` columns populated correctly.
- [ ] A new query/composable reads all `ENHANCEMENTS` rows (optionally by polarity).
- [ ] "Configure Match" shows 3 positive-Enhancement selects and 3 negative-Enhancement selects, each
      defaulting to "None".
- [ ] Selecting a tier of an Enhancement removes all other tiers of the same Enhancement from the
      sibling selects of the same polarity.
- [ ] A live point-total readout shows positive points spent vs. available budget, and reflects negative
      picks buying back budget (capped at 3 points of budget, per §10).
- [ ] Positive-select options that would exceed the current budget are disabled, not merely flagged on
      submit.
- [ ] The final selection (possibly empty) is stored on the character in Pinia and survives switching
      the class or weapon selects.
- [ ] Budget/exclusion logic lives in pure `src/utils/` functions with passing Vitest coverage.
- [ ] `npm run lint` and the Vitest suite both pass.
- [ ] All code, identifiers, comments, and UI text are in English, per CLAUDE.md's language policy.

## 11. Manual verification plan

1. Run `npm run db:reset && npm run db:seed` so `ENHANCEMENTS` (and `WEAPONRY`) have data, then
   `npm run dev` and open the app, click "Start" to reach "Configure Match".
2. Confirm all 6 Enhancement selects are visible, each defaulting to "None", and a budget readout shows
   `0 / 5`.
3. Pick a positive Enhancement costing 3 in select #1: confirm the readout updates to `3 / 5`, and any
   remaining positive option costing more than 2 becomes disabled across the other positive selects.
4. Pick a different tier of the same Enhancement (if it has one) in select #2: confirm the Tier picked
   in select #1 disappears from select #2's options and vice versa (mutual exclusion).
5. Pick a negative Enhancement costing -2 in one of the negative selects: confirm the readout now shows
   `3 / 7` (budget grew by 2), and a previously disabled positive option (costing up to 4 more) becomes
   selectable again.
6. Pick enough negative Enhancements to exceed magnitude 3 total: confirm the budget caps at `5 + 3 = 8`
   and does not keep growing past that.
7. Deselect the positive pick from step 3 (back to "None"): confirm the readout drops accordingly and
   the Tier options removed in step 4 become available again.
8. Switch the class select and the weapon select: confirm the Enhancement picks are unaffected.
9. Run `npx vitest run` and confirm the new budget/exclusion unit tests pass.

## 12. Open questions

None.

## 13. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | What should we do now? | Build Enhancement selection for feature 07 (`07-character-enhancement-list`): read `docs/daemon-system-enhancements.json`, seed an `ENHANCEMENTS` table, and add 6 selects (originally proposed as 4 positive / 2 negative) to the character-creation modal, with player picks bounded by a 5-point net budget where negative Enhancements refund points. |
| 2 | Budget rule: official §10 rule (5 base, up to 3 negative points bought back) vs. a simpler flat "net ≤ 5" rule? | Official rule — but with 3 positive selects and 3 negative selects instead of the originally proposed 4/2 split. |
| 3 | How should tiered costs (e.g. "1 / 2 / 3", "1-5") be handled in the selects? | Flatten every tier into its own selectable list item; picking one tier removes all other tiers of that same Enhancement from the other selects — tiers of the same Enhancement never stack. |
| 4 | Should the same Enhancement be selectable in more than one select at once? | No — prevent duplicates across selects, consistent with the tier-exclusion rule from question 3. |
| 5 | Should all 6 selects default to "none", with no required minimum? | Yes (no distinct second option offered; adopted as the approach). |
| 6 | How should the `ENHANCEMENTS` table represent flattened tiers? | One row per tier, with a shared `groupKey` column used for mutual exclusion across tiers of the same Enhancement. |
| 7 | Should Enhancement effects be mechanically applied to combat in this feature? | No — selection and storage only; no combat formula reads them yet. |
| 8 | Where should the point budget be shown/enforced? | A live running total near the selects, with options that would exceed budget disabled rather than just validated on submit. |

## 14. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this spec-writing session. Pricing reference (per the `claude-api` skill, current at
  time of writing): Claude Sonnet 5 — US$ 2.00 / 1M input tokens, US$ 10.00 / 1M output tokens.
