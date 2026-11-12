# ADR-0005: Introduce `src/model/` for entities/models, distinct from `src/utils/`

**Status:** Accepted
**Date:** 2026-11-12
**Deciders:** Pedro "Ratto" Paixão

## Context

CLAUDE.md's original project setup lists five empty folders waiting for the first feature:
`src/{components,composables,scenes,stores,utils}`. `src/utils/` was earmarked for pure, framework-agnostic
combat formulas (initiative, hit/damage resolution) — the only place in the codebase meant for
stateless, non-Vue/Pixi/Pinia/GSAP code.

The `04-dice-rolling-system` feature spec originally placed its `Dice` type and `DieRoll` class under
`src/utils/`, matching that plan. During technical planning for that feature, the human asked instead for
a new `src/model/` folder, reasoning that `Dice` and `DieRoll` are **entities/models** — typed data
shapes with behavior attached (a class with a constructor and instance methods) — rather than free
functions operating on primitives, which is what `src/utils/` was scoped for. No existing ADR or
CLAUDE.md section addresses this distinction, so the convention needed to be decided and recorded before
more features need a place to put entities/models.

This decision only concerns **where entity/model code lives relative to utility code** — it does not
change the state/logic separation rule (Pinia stores hold state, composables hold logic) or introduce any
new external dependency.

## Decision

Introduce `src/model/` as a new top-level folder for entities/models — typed data shapes with attached
behavior (e.g. `Dice`, `DieRoll`) — kept separate from `src/utils/`, which remains reserved for
stateless, input-in/output-out utility functions (e.g. future combat formulas that take primitives and
return primitives, with no class or instance state involved).

Both folders share the same framework-agnostic constraint already established for `src/utils/`: no
Pixi, Pinia, Vue, or GSAP dependency. Both sit below composables in the architecture — composables import
from `src/model/` and `src/utils/`, never the other way around.

The dividing line for future code:

- **`src/model/`** — a type/class represents a *thing* (a die, a weapon, a character stat block) and may
  carry instance methods that operate on its own data (e.g. `DieRoll.getResult()`).
- **`src/utils/`** — a function computes a result from arguments alone, with no persistent instance
  state (e.g. a hypothetical `calculateHitChance(attacker, defender)`).

## Options Considered

### Option A: New `src/model/` folder, separate from `src/utils/`

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — one new empty folder, no tooling change (same TypeScript/Vitest/ESLint config already covers all of `src/`) |
| Cost | None |
| Scalability | Scales fine for a prototype; the distinction stays meaningful as more entities (Weapon, Character, Spell) and more pure formulas (damage, initiative) are added |
| Team familiarity | Common convention (`model`/`domain` folders for entities, `utils` for pure helpers) in TypeScript projects generally, though not previously used in this specific repo |

**Pros:** Keeps `src/utils/` focused on what CLAUDE.md already describes it for (pure combat formulas), avoiding it becoming a catch-all for "any non-Vue code"; gives future features (weapon data, character stat blocks) an obvious, already-decided home; the separation mirrors the state/logic split already established for stores/composables — grouping by *kind of code* rather than dumping everything stateless into one folder.
**Cons:** One more folder to explain to a newcomer; for a small prototype the practical difference between "a class with instance methods" and "a function" is sometimes a judgment call (see Trade-off analysis).

### Option B: Keep everything under `src/utils/`

| Dimension | Assessment |
|-----------|------------|
| Complexity | Lowest — no new folder, no new rule to learn |
| Cost | None |
| Scalability | Works while the amount of non-Vue code stays small; risks becoming a mixed-concern dumping ground as entities and pure formulas both land there |
| Team familiarity | Matches CLAUDE.md's current (as-written) folder list exactly, no deviation to track |

**Pros:** Zero migration cost, zero new convention to document or forget; matches the spec's and CLAUDE.md's current wording without amendment.
**Cons:** Blurs CLAUDE.md's own framing of `src/utils/` as pure *formulas*; as more entities are added (Weapon, Character, Spell, Upgrade) alongside pure functions, the folder loses a clear organizing principle, making it harder to predict where new code belongs without opening the folder and skimming its contents.

## Trade-off Analysis

The practical cost of Option A is close to zero for this prototype — it is one additional empty folder
with the same build/lint/test tooling, not a new dependency or a new architectural layer. The benefit is
mostly about predictability: as this spike grows past its first non-Vue code (`Dice`/`DieRoll`), having a
standing rule — "a typed thing with its own methods goes in `model/`, a pure function goes in `utils/`" —
means each future feature's tech-lead planning doesn't have to re-decide this question, and a developer
opening the repo can guess where to look. Option B avoids even that tiny overhead but defers the same
organizing decision to whichever future feature first mixes an entity and a pure formula, at which point
undoing an established `src/utils/` habit is more disruptive than deciding the convention now, while
`src/utils/` is still empty and nothing needs to move.

The boundary between the two folders will occasionally be a judgment call (e.g. is a lookup table with a
couple of helper functions a "model" or a "util"?); this ADR accepts that ambiguity as a reasonable cost
of a two-folder split in a prototype this size, to be resolved case-by-case rather than with a more
rigid rule.

## Consequences

- `src/model/dice.ts` and `src/model/dieRoll.ts` (plus their `.spec.ts` files) are the first occupants of
  the new folder, implemented as part of `04-dice-rolling-system`.
- `04-dice-rolling-system`'s spec was amended (§4, §6, §10, interview notes) to say `src/model/` instead
  of its original `src/utils/` wording, so the spec and this ADR stay consistent.
- Future features that introduce typed entities (e.g. `Weapon`, `Character`, `Spell` data shapes) should
  default to `src/model/`; future pure combat formulas (damage/hit/initiative calculations taking
  primitives) should default to `src/utils/`, per the dividing line in this ADR's Decision section.
- CLAUDE.md's folder list (`src/{components,composables,scenes,stores,utils}`) is now incomplete — it
  should be updated to include `model` the next time CLAUDE.md itself is revised, so the written
  convention matches the one recorded here.

## Action Items

1. [ ] Update CLAUDE.md's "Project state" section to add `model` to the list of `src/` folders, once a
   feature touches CLAUDE.md directly (or as a small standalone edit).
2. [x] Amend `04-dice-rolling-system`'s spec and plan to reference `src/model/` instead of
   `src/utils/` — done during that feature's tech-lead planning (2026-11-12).
