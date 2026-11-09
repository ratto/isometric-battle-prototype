# Spec: <Feature Title>

**Slug:** `<id>-<short-description>`
**Status:** Draft | Approved | In Progress | Done
**Author:** <human name / "Human + Claude">
**Date:** <YYYY-MM-DD>

## 1. Summary

One or two paragraphs describing the feature/user story in plain language: what it is, and why it's
being built now. Should be understandable without reading the rest of the document.

## 2. Daemon System grounding

Which Sistema Daemon mechanic(s) this feature implements or depends on, with a direct reference to
the relevant section(s) of
[docs/daemon-system-rules-reference.md](../../daemon-system-rules-reference.md).

| Mechanic                 | Rules reference section | Notes on how it's used here                                |
| ------------------------ | ----------------------- | ---------------------------------------------------------- |
| <e.g. Attack resolution> | <e.g. §6 Combat>        | <e.g. exact formula used, any simplification made and why> |

If any rule is being intentionally simplified or deviated from for the prototype, say so explicitly here
and explain why (remember the Golden Rule in §14 of the reference permits this, but it must be a
conscious choice, not an oversight).

## 3. Goal and value

- **Goal:** what gameplay hypothesis or capability this validates.
- **Value:** who benefits (player experience, design validation, technical foundation) and why it
  matters for the spike.

## 4. Scope

### In scope

- <bullet list of what this US covers>

### Out of scope

- <bullet list of what this US explicitly does NOT cover>

## 5. Functional requirements

Numbered, testable statements of required behavior.

1. <requirement>
2. <requirement>

## 6. Non-functional requirements

Constraints tied to the project's stack (Pixi, Pinia, composables, `pathfinding`, GSAP, Tailwind — see
[CLAUDE.md](../../../CLAUDE.md)) or to usability/performance expectations. State "Not applicable" if
none apply.

## 7. Edge cases

Boundary conditions, unusual inputs, or ordering issues this feature must handle correctly (e.g. ties,
zero/negative values, empty states, simultaneous actions).

| Edge case | Expected behavior |
| --------- | ----------------- |
| <case>    | <behavior>        |

## 8. Risks and mitigations

| Risk   | Likelihood/Impact  | Mitigation   |
| ------ | ------------------ | ------------ |
| <risk> | <e.g. Medium/High> | <mitigation> |

## 9. Dependencies

Other features, stores, composables, or decisions this depends on or blocks. State "Not applicable" if
none.

## 10. Definition of Done

Checklist of observable, verifiable conditions that must all be true for this feature to be considered
complete.

- [ ] <condition>
- [ ] <condition>

## 11. Manual verification plan

Since this project has no automated test runner (per CLAUDE.md), list the concrete manual steps to
play-test this feature via `npm run dev`.

1. <step — setup/state needed>
2. <step — action taken>
3. <step — expected observable result>

## 12. Open questions

Anything still unresolved after the interview that the human should revisit. State "None" if nothing is
open.

## 13. Interview notes

Condensed log of the Q&A that produced this spec, for traceability (question → answer, not a full
transcript).

| #   | Question   | Answer   |
| --- | ---------- | -------- |
| 1   | <question> | <answer> |

## 14. Token usage and estimated cost

| Metric               | Value           |
| -------------------- | --------------- |
| Model                | <ai model used> |
| Input tokens         | <input tokens>  |
| Output tokens        | <output tokens> |
| Estimated cost (USD) | <cost in US$>   |
| Estimated cost (BRL) | <cost in R$>    |

- Tokens used in each step and other information.
- Actual used model pricing details (if any).
