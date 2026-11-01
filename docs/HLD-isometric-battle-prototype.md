### HLD: Isometric Battle Prototype Turn-Based Tactical Combat Spike

Version: 1.0
Date: 2026-11-01
Responsible: Pedro "Ratto" Paixão

---

### Technical objective
Structure a client-side-only SPA (Vue 3 + PixiJS + Pinia) capable of running a turn-based tactical combat loop on an isometric grid, with deterministic and testable combat logic decoupled from rendering, and a static data layer (SQLite via WASM) validating a database-integration approach intended for a future full product. Today no battle logic, rendering, or state management exists beyond the default Vite + Vue 3 + TypeScript scaffold; this HLD defines how that gap is closed architecturally.

Dependencies with other systems
- None. This is a standalone, client-side-only application with no backend and no external integrations.

---

### General architecture
Client-side single-page application built on the existing Vite + Vue 3 + TypeScript scaffold, deployed as a static site. The architecture follows a layered design with unidirectional data flow: Pinia holds all battle state as the single source of truth; composables contain pure combat logic and commit results to the store via actions; PixiJS and the Vue/Tailwind HUD both read from (and write to, via composables) the same store, without talking to each other directly.

Deployment environment
- Cloud (static hosting), Netlify free tier
- No backend, no server-side compute; the published bundle is the entire system

Main technologies
- Vite, Vue 3, TypeScript
- PixiJS (canvas/WebGL renderer)
- Pinia (state management)
- GSAP (animation, canvas and DOM)
- `pathfinding` npm package (grid traversal, A*, range/distance queries)
- Tailwind CSS (HUD styling)
- SQLite via WASM (static game data, read-only, seeded at build time)
- Vitest (unit tests for combat formulas)

Patterns adopted
- Layered architecture with unidirectional data flow (state → logic → render/UI)
- Separation of state (Pinia) from logic (composables) from presentation (Pixi canvas / DOM HUD)

---

### Components and responsibilities
| Component | Responsibilities | Dependencies |
| ----------- | ----------------- | ------------ |
| App Shell (Vue + Vite) | Application bootstrap; mounts the configuration screen and the battle screen | Battle Store, HUD |
| Pixi Renderer (`usePixiApp` composable) | Owns the Pixi `Application` and its render loop; draws tiles, unit sprites, and battle VFX based on store state | Battle Store, Animation Layer |
| Battle Store (Pinia) | Single source of truth for battle/unit state: stats, HP, status, positions, turn/phase data; exposes getters/actions | None (leaf state holder) |
| Combat Composables | Pure combat logic: initiative, hit/damage resolution, movement/pathfinding (via `pathfinding` package); computes results and commits them through Battle Store actions | Battle Store, Static Data Layer |
| Enemy AI Composable | Decides enemy actions (melee approach-and-attack, ranged keep-distance, fallback to Defend/Item) using the same combat composables | Combat Composables, Battle Store |
| HUD (Vue + Tailwind) | DOM overlay: configuration screen, action panels, HP bars; reads/writes the Battle Store via composables | Battle Store, Animation Layer |
| Animation Layer (GSAP) | Shared timeline/animation API for both canvas (movement, attacks) and DOM (damage popups, panel transitions) | None (invoked by Pixi Renderer and HUD) |
| Static Data Layer (SQLite via WASM) | Read-only data for Items, Weapons, Upgrades, Spells; seeded at build time, queried client-side | None (leaf data source) |

---

### Request and data flow
**Request flow (attack action example)**
- HUD captures player input (target/action selection) and calls the corresponding Combat Composable
- Combat Composable validates the action (correct turn, target in range/line of sight) against the Battle Store
- Composable queries the Static Data Layer for weapon/spell attributes involved in the calculation
- Composable runs the pure calculation (hit chance, damage) and calls a Battle Store action to apply the result (HP, status)
- Battle Store triggers reactivity; Pixi Renderer and HUD react to the state change
- Animation Layer (GSAP) plays the VFX/animation corresponding to the event

**Data flow**
- Origin: player input (HUD) or AI decision (Enemy AI Composable) → transformation: calculation in Combat Composables (combining static data from SQLite with dynamic state from the Battle Store) → destination: Battle Store (mutated state) → consumed by Pixi Renderer (drawing) and HUD (display)

---

### Data model (high level)
Main entities
- Character (player or enemy): attributes (Agility, HP, Jump, etc.), class, grid position, status
- Weapon / Item / Upgrade / Spell (static data): combat attributes (damage, range, etc.)
- Tile / Grid: position, height, terrain, occupancy
- BattleState: current phase, initiative order, active turn, win/loss/draw condition

Relationships
- Character references equipped Weapon/Item/Spell (N:1 or N:N)
- Character occupies a Tile (1:1 per turn)
- BattleState aggregates the list of Characters and the Grid state

Source of truth
- Dynamic battle data (Character, BattleState, Tile occupancy): Pinia Battle Store (in-memory, session-scoped)
- Static data (Weapon, Item, Upgrade, Spell): SQLite via WASM (read-only, seeded at build time)

---

### Public interfaces
| Name | Kind | Protocol | Exposure | SLAs/Limits |
| ---- | ---- | ---------- | --------- | ------------- |
| Battle Store API | SDK (internal) | Pinia getters/actions (TypeScript) | Internal | p95 < 5 ms per combat-action calculation |
| Combat Composables API | SDK (internal) | Synchronous TypeScript functions | Internal | p95 < 5 ms per combat-action calculation |
| Static Data Layer API | SDK (internal) | SQLite/WASM queries (SQL) | Internal | p95 < 5 ms per query |
| Pixi Renderer API | SDK (internal) | `usePixiApp` composable (lifecycle hooks) | Internal | p95 < 16 ms per frame |

---

### Scalability and availability considerations
General approach
- Horizontal scaling is delegated entirely to Netlify's CDN for serving static assets; there is no server-side component to scale
- Client-side resource constraints (sprite/VFX count) are the real scaling concern, not infrastructure

Techniques applied
- CDN distribution (Netlify) for static assets
- Caching: static assets (sprites, audio, JS bundle) via standard CDN/browser cache; SQLite data loaded once at startup and kept in memory for the session
- No partitioning/sharding: no distributed data, SQLite is local and read-only
- Sprite/VFX count capping in the Pixi Renderer to sustain the minimum frame rate

Availability target
- Hypothesis: no custom uptime target; relies on Netlify's standard free-tier SLA, consistent with this being a low-stakes internal/partner demo rather than a production service

---

### Security
Authentication
- Not applicable: public app, no login

Authorization
- Not applicable: no distinct roles/permissions, local browser usage only

Data protection
- Not applicable: no sensitive data or PII is captured or stored; battle data lives only in memory for the browser session

Secrets management
- Not applicable: no API keys, credentials, or secrets on the client; SQLite data is a publicly served static asset

---

### Observability
Logs
- Structured console logging, development environment only, for blocked actions (invalid movement, out-of-range/line-of-sight attacks, out-of-turn actions) and missing VFX/audio assets

Metrics
- Hypothesis: FPS during combat monitored manually (e.g. via devtools/Pixi stats) as the indicator for the performance NFR; no metrics are formally collected or exported, since there is no backend or external monitoring tool

Tracing
- Not applicable: no distributed calls; the flow is synchronous and local to the browser

Dashboards and alerts
- Not applicable: out of scope for this spike (no external monitoring tool)

---

### Architectural risks and mitigation
#### Isometric pathfinding complexity (Movement/Jump rules) takes longer than estimated
- **Probability:** medium
- **Impact:** delays the prototype, affecting the time/cost measurement goal
- **Mitigation:**
  - Implement a simplified version of pathfinding first (without Jump) and evolve it incrementally
  - Review the movement cost logic in isolation before integrating it with the UI
- **Contingency plan:** if the timeline becomes unsustainable, reduce the Jump rule to a single fixed value (e.g. always 1) and document the simplification as a deviation from the GDD

#### Runtime performance falls below 30 FPS on weaker machines
- **Probability:** low
- **Impact:** poor experience when demoing the prototype to partners
- **Mitigation:**
  - Limit the number of simultaneous sprites/effects
  - Test early on modest hardware
- **Contingency plan:** reduce VFX quality or grid size if needed

#### SQLite-via-WASM integration brings unexpected complexity or compatibility issues
- **Probability:** medium
- **Impact:** delays the prototype and risks failing to validate this part of the architecture, one of the spike's explicit goals
- **Mitigation:**
  - Validate the SQLite + WASM integration in isolation before populating all data
  - Keep a documented static JSON fallback ready in case WASM proves infeasible within the spike's timeline
- **Contingency plan:** if SQLite via WASM does not work in time, fall back to static JSON temporarily and record the limitation as a learning from the spike

---

### ADRs and next steps
Associated ADRs
- No formal ADRs exist yet; the decisions in the PRD (PixiJS as renderer, `pathfinding` package, GSAP for all animation, SQLite for static data) should each be formalized as an individual ADR

Pending decisions
- Exact SQLite/WASM driver to use (e.g. sql.js, wa-sqlite) not yet chosen
- Exact SQL schema/serialization format for static data (Items, Weapons, Upgrades, Spells)

Next steps
- Detail the data schema (Character, Weapon, Item, Spell, Upgrade)
- Specify the public API of the Combat Composables (signatures, inputs/outputs)
- Prototype the SQLite/WASM integration in isolation before integrating it with the rest of the system
