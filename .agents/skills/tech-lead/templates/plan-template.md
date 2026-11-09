# Technical Plan: <Feature Title>

**Slug:** `<id>-<short-description>`
**Spec:** [spec-<slug>.md](spec-<slug>.md)
**Status:** Draft | Approved | In Progress | Done
**Author:** <human name / "Human + Claude">
**Date:** <YYYY-MM-DD>

## 1. Summary

One or two paragraphs restating, in technical terms, what is being built and why. Should make sense to
a developer who has not read the spec.

## 2. Source documents reviewed

What was read before drafting this plan, and anything relevant found in each.

| Document                                   | Key takeaways for this plan                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `spec-<slug>.md`                           | <summary>                                                                   |
| Trello card                                | <summary, or "No additional context beyond the spec">                       |
| `docs/GDD-isometric-battle-prototype.md`   | <relevant rules/sections>                                                   |
| `docs/HLD-isometric-battle-prototype.json` | <relevant components/flows>                                                 |
| Existing ADRs                              | <relevant decisions, or "None found">                                       |
| Current codebase                           | <relevant existing files/modules, or "No prior implementation to build on"> |

## 3. Architecture fit

How this feature fits into the layered architecture from the HLD (Pinia store ↔ composables ↔
Pixi renderer / HUD). Call out explicitly if this plan requires deviating from or extending that
architecture, and why.

## 4. Affected surface

### New files/modules

| Path (relative to `src/`) | Purpose                         |
| ------------------------- | ------------------------------- |
| `<path>`                  | <what it does and why it's new> |

### Modified files/modules

| Path (relative to `src/`) | Change                 |
| ------------------------- | ---------------------- |
| `<path>`                  | <what changes and why> |

### Out of scope for this plan

- <existing code intentionally left untouched, if relevant to call out>

## 5. State design (Pinia)

Shape of any new or changed state, per store. State only — no mutation logic here (see section 6).

```
<store name>
  <field>: <type>        // <purpose>
```

If no store changes are needed, state "Not applicable" and explain why.

## 6. Logic design (composables)

Per CLAUDE.md's state/logic separation: composables hold pure calculation logic and call store actions
to commit results. Describe, per composable, its responsibility and its public surface (function
names, inputs/outputs by type/shape — not implementation code).

| Composable | Responsibility     | Inputs → Output      | Store actions it calls |
| ---------- | ------------------ | -------------------- | ---------------------- |
| `<useX>`   | <what it computes> | `<input> → <output>` | `<action>`             |

## 7. Rendering / HUD impact

What the Pixi renderer and/or the Vue/Tailwind HUD need to read from the state above and how they
should react (new sprites/VFX, new DOM panels, animation triggers via GSAP). State "Not applicable" if
this feature has no visual surface.

## 8. Data layer impact

Any new/changed static data (Items, Weapons, Upgrades, Spells in SQLite via WASM) this feature needs:
schema changes, seed data, or new queries. State "Not applicable" if none.

## 9. External dependencies

New npm packages, or new usage of an existing one (PixiJS, GSAP, `pathfinding`, etc.) that required a
Context7 lookup. Note the library, the API confirmed via Context7, and why it's needed. State "None" if
no new dependency/API usage is introduced.

## 10. Implementation sequencing

Ordered, incremental steps a developer (human or agent) should follow. Each step should be
independently verifiable (see section 12) before moving to the next, so issues surface early.

1. <step>
2. <step>

## 11. Technical risks and mitigations

Risks specific to this feature's implementation (distinct from the spec's product risks), including
any connection to the risks already tracked in the HLD (pathfinding complexity, runtime performance,
SQLite/WASM integration).

| Risk   | Likelihood/Impact  | Mitigation   |
| ------ | ------------------ | ------------ |
| <risk> | <e.g. Medium/High> | <mitigation> |

## 12. Manual verification plan

Since this project has no automated test runner (per CLAUDE.md), list the concrete manual steps to
verify this implementation via `npm run dev`, tied to the plan's sequencing in section 10.

1. <step — setup/state needed>
2. <step — action taken>
3. <step — expected observable result>

## 13. Open technical questions

Anything still unresolved after the interview. Flag explicitly if any item here should become its own
ADR (via the `architecture` skill) before implementation starts. State "None" if nothing is open.

## 14. Interview notes

Condensed log of the Q&A that produced this plan, for traceability (question → answer, not a full
transcript).

| #   | Question   | Answer   |
| --- | ---------- | -------- |
| 1   | <question> | <answer> |

## 15. Token usage and estimated cost

| Metric               | Value           |
| -------------------- | --------------- |
| Model                | <ai model used> |
| Input tokens         | <input tokens>  |
| Output tokens        | <output tokens> |
| Estimated cost (USD) | <cost in US$>   |
| Estimated cost (BRL) | <cost in R$>    |

- Tokens used in each step and other information.
- Actual model pricing details used for the estimate (if any).
