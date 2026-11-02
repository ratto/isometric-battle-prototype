# PRD: Isometric Battle Prototype Turn-Based Tactical Combat Spike

Version: 1.0
Date: 2026-11-01
Responsible: Pedro "Ratto" Paixão

---

## Resume

This is a greenfield, time-boxed spike to validate the hypothesis that a JavaScript stack (Vue 3, PixiJS, Pinia, GSAP, the `pathfinding` package, and SQLite) can support an isometric, turn-based tactical RPG battle scenario similar to Final Fantasy Tactics (GBA), using the combat rules of Sistema Daemon, a Brazilian tabletop RPG created by Marcelo Del Debbio. The prototype lets the player configure a battle, choose 3 to 6 player characters and 1 to 6 enemies, position their side on the grid, and fight a turn-based battle against enemies controlled by simple AI until one side is eliminated. The prototype will also be used to measure development time and cost in order to estimate ROI for a larger future project, and to produce a tangible artifact to pursue partnerships.

---

## Context and Problem

Target audience

- The author (Pedro "Ratto" Paixão) and other RPG and tactics-game enthusiasts

Cenaries and key use

- Configuring a battle (choosing player characters and enemies) and playing a full turn-based isometric combat to a win, loss, or draw condition
- Using the finished prototype as a tangible demo to support conversations with potential partners

Where it will be implemented

- Brand new system (greenfield spike). No existing codebase or battle logic exists today beyond the default Vite + Vue 3 + TypeScript scaffold. Deployed as a static web app on Netlify (free tier), client-side only, no backend.

Prioritized issues

- No tangible proof of concept exists today for the Sistema Daemon tactical combat idea, which makes it hard to decide whether to invest in a larger project or to pursue partnerships (impact: blocks investment and partnership decisions, priority: high)
- There is no concrete data on technical viability, development time, or cost for this kind of game with this stack, making any larger investment decision speculative (impact: high uncertainty on ROI estimation, priority: high)

---

## Goals and Metrics

| Objective                                                   | Metric                                                      | Goal                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Validate technical viability of the chosen stack            | A full battle playable end to end without critical blockers | Achieved (yes/no)                                     |
| Quantify cost and time to estimate ROI for a larger project | Time and investment spent on development                    | Recorded and consolidated at the end of the prototype |
| Ensure acceptable minimum runtime performance               | FPS during combat                                           | Minimum of 30 FPS                                     |

---

## Scope

### Included

- Initial match configuration screen
- Selection of 3 to 6 player characters
- Selection/configuration of up to 6 enemies
- Manual positioning of player characters within an 8x2 tile area; automatic random positioning of enemies across the map
- Turn-based combat with different classes and terrain, following Sistema Daemon rules (detailed in the GDD)
- Simple enemy AI
- Basic combat VFX (via GSAP)
- Basic audio feedback
- Win/loss/draw condition when one or both sides lose all characters

### Out of Scope

- Character progression between matches (XP, leveling, items persistence)
- Game save/persistence
- Multiplayer
- Any screen beyond the initial configuration screen and the battle screen
- Mobile/responsive version
- Fine-tuned balancing of classes and terrain
- Sophisticated enemy AI
- Elaborate VFX/animation polish and a full music score
- User authentication, personal data collection, and compliance requirements (no personal data is captured)
- Accessibility support (screen reader, full keyboard navigation)

---

## Functional Requirements

### FR-001 Initial configuration screen

The system must let the player configure a match before starting combat.

**Main Flow**

- Player opens the prototype
- Player selects the number and type of player characters
- Player selects the number and type of enemies
- Player confirms and starts the match

**Alternative Flows and Exceptions**

- None beyond the validation rules below

**Predicted issues**

- Match cannot start with fewer than 3 or more than 6 player characters
- Match cannot start with fewer than 1 or more than 6 enemies

**Priority:** high

---

### FR-002 Initial positioning on the grid

The system must let the player position their own characters before combat starts, and automatically position enemies.

**Main Flow**

- Player manually places each of their characters within a fixed 8x2 tile area
- System randomly places enemies across the map

**Alternative Flows and Exceptions**

- Player attempts to place a character outside the 8x2 area
- Player attempts to place a character on an occupied tile or impassable terrain

**Predicted issues**

- Invalid placement attempts are simply blocked by the system

**Priority:** medium

---

### FR-003 Turn-based combat loop

The system must run combat as a sequence of turns ordered by initiative, letting each character move once and perform one action per turn.

**Main Flow**

- At the start of each turn, initiative is rolled for each character as Agility + 1d10, minus any penalty carried from the action taken in the character's previous turn
- Initiative penalties apply only to the next roll and do not accumulate
- On a character's turn, the player (or AI) may move the character once, before or after acting
- The character then performs one action: Attack, Cast Spell/Use Ability, Defend, or Use Item

**Alternative Flows and Exceptions**

- None beyond the error conditions below

**Predicted issues**

- Attempting to move beyond the character's movement range
- Attempting to attack a target out of range or without line of sight
- Attempting to act with a defeated character
- Attempting to act outside of the character's own turn
- All of the above are blocked by the system with a developer-facing error notification (dev environment)

**Priority:** high

---

### FR-004 Attack and damage resolution

The system must resolve attacks using the official Sistema Daemon hit and damage formulas.

**Main Flow**

- Hit chance is calculated as Active Source minus Passive Source plus 50
- The attacking character rolls 1d100; the attack hits if the result is less than or equal to the hit chance
- On a hit, total damage is calculated as damage dealt minus the target's Protection Index (IP)
- Total damage is subtracted from the target's hit points

**Alternative Flows and Exceptions**

- Resulting damage is negative

**Predicted issues**

- Negative total damage must be clamped to zero and never heal the target
- A character whose hit points reach zero or below is defeated and removed from combat
- Attacking an already defeated target is blocked

**Priority:** high

---

### FR-005 Movement and pathfinding

The system must calculate and display valid movement tiles for a character's turn, respecting Movement and Jump attributes.

**Main Flow**

- When it is a player character's turn, the system highlights all tiles reachable given the character's Movement (derived from Agility) and Jump attributes
- Player selects a destination tile among the highlighted options

**Alternative Flows and Exceptions**

- Movement is a passive attribute indicating the maximum tiles a character can traverse per turn
- Jump is a passive attribute indicating the maximum terrain height a character can climb or descend in one step; most characters have Jump 1
- Each Jump used reduces remaining Movement by 1 (example: Jump 2 and Movement 6 spent 2 tiles horizontally plus a 2-tile height change in one step costs 2 Movement, leaving 2 more tiles of Movement available)

**Predicted issues**

- Selecting a tile outside the highlighted reachable area is blocked
- Selecting an occupied tile is blocked
- Selecting a tile whose height change exceeds the character's Jump is blocked

**Priority:** high

---

### FR-006 Simple enemy AI

The system must control enemy characters automatically using simple decision rules.

**Main Flow**

- On an enemy's turn, melee enemies move toward and attack the nearest player character
- Ranged enemies try to keep a safe distance from player characters while staying within their own attack range

**Alternative Flows and Exceptions**

- No player character is reachable or attackable on the current turn

**Predicted issues**

- If no attack is possible, the AI must choose to Defend or Use Item (if one is available) instead

**Priority:** medium

---

### FR-007 Combat VFX and audio feedback

The system must play basic visual and audio feedback for combat events.

**Main Flow**

- Every relevant combat event (attack, hit, damage, victory, defeat) triggers a simple animation (via GSAP) and a corresponding sound effect

**Alternative Flows and Exceptions**

- A required animation or audio asset is missing

**Predicted issues**

- A missing asset must not block combat; it must only be skipped, with an error shown to the developer in the dev environment

**Priority:** low

---

### FR-008 Victory, defeat, and draw condition

The system must detect and resolve the end of combat.

**Main Flow**

- After each turn, the system checks whether all characters on one side have been defeated
- If one side has no characters left, combat ends and a simple victory or defeat message is shown

**Alternative Flows and Exceptions**

- Both sides lose all remaining characters as a result of the same turn

**Predicted issues**

- This edge case must resolve to an explicit draw state, even though a draw is not expected to normally occur

**Priority:** high

---

## Non Funcional Requirements

### Performance

- Minimum of 30 FPS sustained during combat

### Availability

- Hypothesis: no custom uptime target; the prototype is a static site hosted on Netlify's free tier and relies on Netlify's standard SLA, as this is a low-stakes internal/partner demo rather than a production service

### Security and authorization

- Hypothesis: no authentication or authorization required; the prototype is client-side only, publicly accessible via its Netlify link, with no sensitive user data

### Observability

- Structured console logging in the development environment for blocked actions (invalid moves, invalid attacks, out-of-turn actions) and missing assets; no external monitoring tool required for this prototype

## Reliability and data integrity

- Match state (unit stats, HP, positions, turn/phase data) lives only in memory (Pinia) for the duration of the browser session; there is no save/load and no session recovery
- Static system data (Items, Weapons, Upgrades, Spells) is persisted in a read-only SQLite database, seeded at build time

### Compatibility and portability

- Target the latest stable versions of Chrome, Firefox, and Edge on desktop; no mobile or legacy browser support

### Compliance

- Not applicable: no personal data is captured by this prototype (hypothesis)

### Accessibility in client frontend

- Not applicable for this prototype (hypothesis); no screen reader or full keyboard navigation support planned

---

## Architecture and approach

### Approach

- Client-side only single-page application built on the existing Vite + Vue 3 + TypeScript scaffold, deployed as a static site on Netlify. PixiJS owns the isometric canvas rendering (tiles, unit sprites, battle VFX) inside a composable tied to component lifecycle; Pinia holds all battle state as the single source of truth; composables contain pure combat logic (initiative, hit/damage resolution, movement/pathfinding rules) and call Pinia actions to commit results; the Vue + Tailwind HUD is a DOM overlay reading/writing the same Pinia store. Static system data (Items, Weapons, Upgrades, Spells) is served from a read-only SQLite database running in the browser, seeded at build time, as a deliberate proxy for the database integration the full product will eventually need.

### Components

- Vue 3 + TypeScript application shell (Vite)
- PixiJS canvas renderer (tiles, sprites, VFX) owned by a `usePixiApp`-style composable
- Pinia store for battle/unit state
- Combat composables (initiative, hit/damage resolution, movement/pathfinding rules using the `pathfinding` package)
- GSAP for both canvas animations and HUD/DOM transitions
- Tailwind-styled HUD (configuration screen, action panels, HP bars)
- Read-only SQLite database (seeded at build time) for Items, Weapons, Upgrades, and Spells, queried client-side (e.g. via a WASM SQLite runtime)
- Vitest for unit tests of critical combat formulas (initiative, hit chance, damage)

### Integrations

- None external; the only "integration" is the client-side SQLite database used to validate the data-access approach intended for the future full product

## Decisions and trade-offs

### Decision: Use PixiJS as the rendering engine

- **Justification:** Canvas/WebGL renderer well suited to many animated sprites at once (tiles, units, VFX) for the isometric scene
- **Trade-off:** Rejected Phaser (a full game framework with its own competing game loop) and DOM/SVG rendering (less suited to many animated sprites simultaneously)

### Decisão: Use the `pathfinding` npm package for grid traversal

- **Justification:** Synchronous API and multiple algorithm options for A\*, range, and distance queries on the isometric grid
- **Trade-off:** Rejected `easystarjs`, which offers a similar feature set but with an asynchronous API; isometric screen-to-grid projection math is still hand-rolled rather than covered by any package

### Decisão: Use GSAP uniformly for all animation

- **Justification:** A single API/timeline model for both Pixi canvas animations (movement, attacks) and HUD/DOM transitions (damage popups, panel transitions)
- **Trade-off:** Avoids mixing Pixi's own ticker with CSS transitions, at the cost of depending on a single animation library for everything

### Decisão: Persist static game data (Items, Weapons, Upgrades, Spells) in SQLite instead of plain JSON

- **Justification:** The intended full product will be integrated with a real database; this spike needs to prove that approach works end to end before committing to it at larger scale
- **Trade-off:** Added client-side complexity (running SQLite, likely via WASM, in the browser) compared to the simplicity of a static JSON file, accepted because validating this integration is itself one of the spike's goals

---

## Dependencies

### organizational: Game Design Document (GDD)

At least a partial GDD detailing the Sistema Daemon combat rules (classes, terrain, formulas) must exist before or in parallel with development, as it is the source of truth for combat rules referenced throughout this PRD.

### organizational: Static game data content

The data for Items, Weapons, Upgrades, and Spells that will populate the SQLite database must be gathered and defined before that part of the system can be fully validated.

### external: Visual and audio assets

Character sprites, isometric tiles, and sound effects are not yet available. They will either be generated with AI tools or sourced from ready-made free or low-cost asset packs; visual quality is explicitly not a priority for this prototype, and audio/music can be deprioritized relative to the rest of the scope.

---

## Riscs and mitigation

### Isometric pathfinding complexity (Movement/Jump rules) takes longer than estimated

- **Probability:** medium
- **Impact:** Delays the prototype, affecting the time/cost measurement goal
- **Mitigation:**
  - Implement a simplified version of pathfinding first (without Jump) and evolve it incrementally
  - Review the movement cost logic in isolation before integrating it with the UI
- **Contingency plan:** If the timeline becomes unsustainable, reduce the Jump rule to a single fixed value (e.g. always 1) and document the simplification as a deviation from the GDD

#### Runtime performance falls below 30 FPS on weaker machines

- **Probability:** low
- **Impact:** Poor experience when demoing the prototype to partners
- **Mitigation:**
  - Limit the number of simultaneous sprites/effects
  - Test early on modest hardware
- **Contingency plan:** Reduce VFX quality or grid size if needed

#### SQLite-via-WASM integration brings unexpected complexity or compatibility issues

- **Probability:** medium
- **Impact:** Delays the prototype and risks failing to validate this part of the architecture, one of the spike's explicit goals
- **Mitigation:**
  - Validate the SQLite + WASM integration in isolation before populating all data
  - Keep a documented static JSON fallback ready in case WASM proves infeasible within the spike's timeline
- **Contingency plan:** If SQLite via WASM does not work in time, fall back to static JSON temporarily and record the limitation as a learning from the spike

---

## Acceptance criteria

Checklist that defines when the product is ready:

- Player can configure a match by selecting between 3 and 6 player characters and between 1 and 6 enemies; outside these limits, the system blocks starting the match
- Player can manually position their characters within the 8x2 tile area before combat starts
- Enemies are automatically positioned randomly across the map when combat starts
- Turn order is calculated by initiative (Agility + 1d10 minus the previous turn's penalty), with non-cumulative penalties
- On each turn, a character can perform one move (respecting Movement and Jump) and one action (Attack, Spell/Ability, Defend, or Use Item)
- Hit resolution follows the official Sistema Daemon formula (Active Source minus Passive Source plus 50, compared against 1d100)
- Damage resolution follows the official formula (damage dealt minus Protection Index), never reducing hit points by a negative amount
- Characters whose hit points reach zero or below are removed from combat
- Enemy AI attacks the nearest player character when possible, keeps a safe distance when ranged, and uses Defend or Item when it cannot attack
- Combat ends automatically when one side loses all characters, showing victory, defeat, or draw (when both sides are eliminated on the same turn)
- Invalid actions (out-of-range movement, out-of-range/line-of-sight attacks, acting out of turn) are blocked by the system with an error shown in the dev environment
- Basic VFX and audio trigger on combat events (attack, damage, victory/defeat); a missing asset does not block combat, it only logs an error in the dev environment
- Static data for Items, Weapons, Upgrades, and Spells is queryable from the SQLite database seeded at build time
- The prototype sustains a minimum of 30 FPS during combat on the latest stable versions of Chrome, Firefox, and Edge
- The prototype is published and accessible via Netlify
- Time and investment spent on developing the prototype are recorded by the end of the project

---

### Tests and validation

Mandatory types of testing

- Unit tests (Vitest) for critical combat formulas: initiative roll, hit chance, and damage calculation
- Manual/exploratory QA for the full combat flow, positioning, enemy AI, and VFX/audio feedback

Validation strategy

- Vitest unit tests isolate and verify the mathematical correctness of the Sistema Daemon formulas
- Manual QA by playing the prototype (`npm run dev`) validates the end-to-end battle experience, enemy AI behavior, and VFX/audio feedback, since there is no automated coverage for those areas
