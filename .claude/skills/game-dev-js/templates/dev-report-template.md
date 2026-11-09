# Dev Report: <Feature Title>

**Slug:** `<id>-<short-description>`
**Plan:** [plan-<slug>.md](../plan-<slug>.md)
**Branch:** `feature/<slug>`
**Report version:** <n>
**Author:** <human name / "Human + Claude">
**Date:** <YYYY-MM-DD>

## 1. Summary

One or two paragraphs describing what was implemented in this task, in plain language, for someone who
has not read the plan.

## 2. Source documents reviewed

What was read before implementing, and anything relevant found in each.

| Document                                   | Key takeaways for this implementation                |
| ------------------------------------------- | ------------------------------------------------------ |
| `plan-<slug>.md`                            | <summary>                                              |
| `docs/HLD-isometric-battle-prototype.json`  | <relevant components/flows, or "No deviation needed">  |
| Relevant ADRs                               | <relevant decisions, or "None found">                 |
| `spec-<slug>.md`                            | <relevant business intent, or "Not applicable">        |
| Existing codebase                           | <relevant existing files/modules reused or extended>   |

## 3. Branch and Trello

| Item                          | Value                                               |
| ----------------------------- | ---------------------------------------------------- |
| Starting branch                | <branch name the session started on>                |
| Branch used for this task      | `feature/<slug>` (new) / `<existing branch>` (reused, confirmed by human) |
| Trello card                    | <card URL>                                           |
| Trello card moved to "Ongoing" | Yes / No (reason)                                    |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose                      |
| -------------------------- | ----------------------------- |
| `<path>`                   | <what it does>               |

### Modified files/modules

| Path (relative to `src/`) | Change                 |
| -------------------------- | ----------------------- |
| `<path>`                   | <what changed and why> |

### Commits made on this branch

| Commit (short hash) | Message                    |
| --------------------- | ---------------------------- |
| `<hash>`              | `<commit message>`          |

## 5. Deviations from the plan

Anything implemented differently from `plan-<slug>.md`, and why (e.g. plan was ambiguous, codebase had
moved on, a library behaved differently than expected). State "None — implemented exactly as planned"
if there were no deviations.

## 6. External dependencies / Context7 lookups

Libraries or APIs (PixiJS, Pinia, GSAP, `pathfinding`, Tailwind, SQLite/WASM, etc.) looked up via the
Context7 MCP during implementation, and what was confirmed. State "None" if no lookup was needed.

| Library | What was looked up | What was confirmed |
| ------- | ------------------- | -------------------- |
| `<lib>` | `<topic>`           | `<finding>`          |

## 7. Manual verification performed

Concrete steps taken to verify the implementation against the plan's "Manual verification plan"
section, via `npm run dev`, and their outcome.

| # | Step taken | Expected result | Actual result |
| - | ----------- | ------------------ | ---------------- |
| 1 | <step>      | <expectation>       | <outcome>         |

## 8. Known issues / follow-ups

Anything left incomplete, any bug noticed but out of scope for this task, or anything that should
become its own Trello card or ADR. State "None" if nothing is open.

## 9. Pull request

| Item          | Value                                   |
| -------------- | ----------------------------------------- |
| Human approval to push/PR | Yes / No / Pending                |
| PR URL          | <url, or "Not opened yet">              |
| Trello card moved to "Done" | Yes / No (reason)                 |

## 10. Token usage and estimated cost

| Metric                | Value            |
| ----------------------- | ------------------ |
| Model(s) used           | <ai model(s) used> |
| Input tokens (approx.)  | <input tokens>    |
| Output tokens (approx.) | <output tokens>   |
| Estimated cost (USD)    | <cost in US$>     |
| Estimated cost (BRL)    | <cost in R$>       |

- Note which figures are exact vs. approximated, and how the approximation was derived.
- Pricing basis used for the estimate (e.g. published per-model rate card and date checked), if any.
