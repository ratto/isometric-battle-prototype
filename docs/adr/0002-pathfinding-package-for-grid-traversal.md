# ADR-0002: Use the `pathfinding` npm package for grid traversal, range, and distance queries

**Status:** Accepted
**Date:** 2026-11-09
**Deciders:** Pedro "Ratto" Paixão

## Context

Movement (FR-005) requires computing the set of reachable tiles for a character given its Movement (derived from AGI or CON×3 when running) and Jump attributes, on a 24x24 isometric grid that includes an impassable obstacle (rock formation) and variable tile height. Enemy AI (FR-006) additionally needs shortest-path and range/line-of-sight-adjacent queries (melee "move toward nearest reachable PC", ranged "keep safe distance while staying in range"). The HLD/GDD already flag "isometric pathfinding complexity (Movement/Jump rules)" as a medium-probability risk to the project timeline, with a mitigation of implementing a simplified version (no Jump) first and evolving incrementally. Per `CLAUDE.md`, isometric screen↔grid projection math itself is expected to stay hand-rolled regardless of package choice — only grid traversal/search is being delegated.

## Decision

Use the `pathfinding` npm package for A*, range, and distance queries on the grid, called synchronously from Combat Composables.

## Options Considered

### Option A: `pathfinding` npm package

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — synchronous call, drop-in grid/A* abstraction |
| Cost | None (open source) |
| Scalability | Adequate for a single 24x24 grid, no performance concern at this size |
| Team familiarity | Not previously used, but minimal API surface |

**Pros:** Synchronous API fits directly into the existing pure-function Combat Composable model (`useCombat`-style composables compute a result and return it) without introducing callbacks or promises into combat logic; offers multiple algorithms (A*, Dijkstra, etc.) if the simple case needs to be swapped later; actively maintained enough for a time-boxed spike's needs.
**Cons:** Height/Jump cost rules (moving between tiles of different height consumes extra Movement per Jump) and the custom 8x2 zone/obstacle rules are Daemon/GDD-specific and are not provided by the package — they must be implemented as custom cost logic layered on top of the package's grid search.

### Option B: `easystarjs`

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — asynchronous (callback-based) API |
| Cost | None (open source) |
| Scalability | Comparable to `pathfinding` for a grid this size |
| Team familiarity | Not previously used |

**Pros:** Similar feature set (A* on a grid), widely used in browser games.
**Cons:** Asynchronous API (callback-driven, designed to spread pathfinding work across multiple engine ticks) is a poor fit for Combat Composables, which are expected to be pure/synchronous functions that compute a result and immediately commit it to the Pinia store; adopting it would force either wrapping it in artificial promises or breaking the pure-function composable pattern for movement logic specifically.

### Option C: Hand-rolled A* / BFS

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — needs correct implementation and testing from scratch |
| Cost | None (no dependency), but developer time |
| Scalability | Fine at this grid size if implemented correctly |
| Team familiarity | Full control, but more code to write and verify in a time-boxed spike |

**Pros:** No dependency; full control to bake height/Jump cost directly into the search.
**Cons:** Reimplements a well-understood, already-solved problem, adding development time this spike is explicitly trying to minimize (the project's own risk log already flags pathfinding as a schedule risk); more surface area for pathfinding bugs that the chosen mitigation (simplify first, evolve incrementally) would rather spend on height/Jump rules than on reimplementing A* itself.

## Trade-off Analysis

The decisive factor is the synchronous-vs-asynchronous API shape, not raw algorithm capability — `easystarjs` and `pathfinding` are otherwise comparable. A synchronous API keeps movement/targeting logic inside the same pure-composable-then-commit-to-store pattern used for every other combat calculation, avoiding a special-cased async path for movement alone. Hand-rolling is rejected purely on time-boxed-spike economics: the GDD/HLD risk log already treats pathfinding as the most likely source of schedule overrun, so delegating the generic traversal problem (and spending the saved time on the Daemon-specific height/Jump cost layer instead) is the better use of the available time.

## Consequences

- Movement and AI targeting queries stay synchronous, composable, and directly testable with Vitest alongside the other combat formulas.
- Height/Jump cost rules and the 8x2 placement-zone/obstacle constraints must be implemented as custom cost/weight logic on top of the package's grid, not provided out of the box.
- If the HLD's pathfinding contingency triggers (Jump reduced to a fixed value), only the custom cost layer changes — the underlying `pathfinding` dependency and its synchronous call pattern are unaffected.

## Action Items

1. [x] Add `pathfinding` as a dependency.
2. [ ] Implement a simplified grid-cost adapter (no Jump) first, per the HLD mitigation, then layer in height/Jump costs.
3. [ ] Cover reachable-tiles and nearest-target queries with Vitest tests once implemented.
