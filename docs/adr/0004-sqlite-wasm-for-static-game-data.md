# ADR-0004: Persist static game data (Items, Weapons, Upgrades, Spells) in SQLite via WASM instead of plain JSON

**Status:** Accepted
**Date:** 2026-11-09
**Deciders:** Pedro "Ratto" Paixão

## Context

The prototype is client-side only with no backend (HLD "Dependencies with other systems: None"). Static system data — Items, Weapons, Upgrades, Spells — is read-only and known at build time. Beyond serving this prototype's own needs, one of the spike's explicit goals (HLD "Technical objective") is to validate a database-integration approach intended for a future full product, not just to pick the simplest way to ship static data for this demo alone. The HLD/PRD risk log already flags SQLite-via-WASM integration as a medium-probability risk, with a documented fallback: keep a static JSON version ready and fall back to it temporarily if WASM proves infeasible within the spike's timeline.

## Decision

Serve static game data from a read-only SQLite database, seeded at build time and queried client-side via a WASM SQLite runtime, with a documented static-JSON fallback kept ready in case the WASM integration proves infeasible in time.

## Options Considered

### Option A: SQLite via WASM

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — introduces a WASM runtime and SQL query layer into a client-only app that would otherwise need none |
| Cost | None (open source runtime; no server) |
| Scalability | Irrelevant at this data volume; the data is small, static, and loaded once per session |
| Team familiarity | Not previously used in this stack; exact driver (sql.js vs wa-sqlite) still an open decision per the HLD |

**Pros:** The only one of the four stack decisions in the PRD motivated by validating something *beyond this prototype's own functional needs* — it is a deliberate proxy for the database-integration approach the future full product will need, which is explicitly one of this spike's stated goals; querying via SQL also matches how the eventual production backend would likely expose this same data.
**Cons:** Meaningfully more complexity than the data's own requirements justify (read-only, static, small) — a self-inflicted risk taken on purpose rather than one required to ship the prototype's gameplay; adds a WASM runtime, a schema/serialization format (still an open pending decision per the HLD), and a build-time seeding step.

### Option B: Plain static JSON

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — load a JSON file, no query layer |
| Cost | None |
| Scalability | More than sufficient for this data volume |
| Team familiarity | High (standard practice) |

**Pros:** Simplest possible solution for data that is read-only, static, and known at build time; zero risk to the prototype's core gameplay goal; faster to implement, leaving more time for combat/rendering work.
**Cons:** Does not validate anything about database integration for the future full product — the data-access question the full product will actually face (querying a real database) remains untested; this is precisely the gap Option A exists to close, since this spike's results are meant to inform a larger investment decision.

## Trade-off Analysis

Judged purely on "best way to serve this prototype's own static data," plain JSON wins outright — the data's shape (read-only, static, small, known at build time) does not need SQL at all. The decision only makes sense because the HLD states that proving the database-integration approach is itself one of the spike's explicit technical objectives, not merely a delivery detail. That reframes the trade-off from "simplicity vs. complexity for this feature" to "simplicity now vs. a learning this spike is specifically funded to produce." The documented JSON fallback means the gameplay validation goal is not put at risk even if the SQLite/WASM goal fails — if the integration proves infeasible in time, the project falls back to JSON, ships the gameplay validation on schedule, and still records "SQLite via WASM did not work in the available time" as a valid, useful finding for the ROI estimate.

## Consequences

- The prototype takes on WASM-runtime complexity and an unresolved schema/driver decision (sql.js vs wa-sqlite, per the HLD's pending decisions) purely to produce a learning for a future, larger product — not because the prototype's own gameplay needs it.
- A working static-JSON version of the same data must be kept ready throughout development as the funded fallback, not written only if things go wrong.
- If the fallback triggers, this ADR's status should be revisited (e.g. superseded or amended) to record the outcome as a learning from the spike, per the HLD's contingency plan.

## Action Items

1. [x] Choose the SQLite/WASM driver (sql.js vs wa-sqlite) — currently an open decision per the HLD.
   Resolved during `01-project-initial-setup` (2026-11-10): **`sql.js`**, chosen for its synchronous
   API and sufficient maturity for a read-only, build-time-seeded dataset; `wa-sqlite` was not needed at
   this data volume. Only the dependency was installed in that user story — no schema, seed data, or
   query was written.
2. [ ] Define the SQL schema/serialization format for Items, Weapons, Upgrades, Spells.
3. [ ] Keep an equivalent static JSON dataset ready as the documented fallback.
4. [ ] Validate the SQLite + WASM integration in isolation before populating all data, per the HLD mitigation.
