# GDD: Isometric Battle Prototype Turn-Based Tactical Combat Spike

Version: 1.0
Date: 2026-11-01
Responsible: Pedro "Ratto" Paixão

---

## Overview

Storyline: the player assembles a party of adventurers to fight a group of enemies on a single, limited battlefield. There is no campaign, no narrative progression, and no screen beyond match configuration and the battle itself (per the PRD's scope). The setting is medieval fantasy, matching Sistema Daemon's "Adventure/Fantasy" campaign type and keeping art direction simple (generic fantasy adventurers vs. monsters).

This document is the gameplay source of truth referenced by the PRD (organizational dependency "Game Design Document") and complements `daemon-system-rules-reference.md`, which stays the authoritative reference for the underlying tabletop formulas. Where this GDD simplifies or deviates from the manual, the simplification is called out explicitly — the prototype favors speed of validation over rules completeness, consistent with `CLAUDE.md`.

### Core loop

1. Configure the match: choose 3–6 party classes (and a weapon per class) and 1–6 enemies.
2. Position the party manually inside the fixed 8x2 zone; enemies are placed automatically at random elsewhere on the map.
3. Fight turn by turn, in initiative order, until one side (or both) has no characters left.
4. See a victory, defeat, or draw message. Match ends — no progression carries over (out of scope per PRD).

---

## Setting and tone

- Medieval fantasy, low narrative investment: no dialogue, cutscenes, or world lore beyond flavor names.
- Single battlefield theme for this version: an open field with rocky outcrops (see Terrain below).
- Visual/audio assets: placeholder-quality is acceptable; AI-generated or free asset packs, per the PRD's "Visual and audio assets" dependency.

---

## Battlefield

### Grid

- 24x24 tiles, isometric projection.
- A fixed 8x2 sub-area (defined in the PRD, FR-002) is reserved for manual party placement; its position on the 24x24 grid is the designer's choice at map-build time (e.g., one edge of the map), kept constant for the single map in this version.
- Enemies are placed automatically at random on any valid (unoccupied, passable) tile outside the party's 8x2 zone.
- Single fixed map/layout for this version — no map variety or randomized terrain generation.

### Terrain

Two terrain features for this version, kept intentionally minimal to de-risk the "pathfinding complexity" item already flagged in the PRD/HLD:

| Feature                       | Effect                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Height**                    | Tiles have variable height. Moving between tiles of different height consumes extra Movement according to the character's Jump (see Movement below). No separate "difficult terrain" tile type exists in this version.                                                                      |
| **Rock formation (obstacle)** | A single impassable terrain type. Blocks movement entirely (cannot be entered, no pathfinding route through it) and blocks line of sight for ranged attacks and ranged/area abilities (a target fully behind a rock formation relative to the attacker cannot be targeted by ranged means). |

### Camera

- The camera follows the active character's turn automatically, but the player can pan it manually at any time.
- During a ranged attack or a projectile-based ability (arrow, bolt, thrown spell effect), the camera follows the projectile from origin to target.
- No zoom control in this version (fixed zoom level); only pan.

---

## Characters

### Attributes used by the prototype

Only the Sistema Daemon attributes that feed a combat formula are tracked per character. Full attribute list and formulas: see `daemon-system-rules-reference.md`, section 2.

| Attribute | Used for                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `CON`     | Hit Points (`ceil((FR+CON)/2) + level`), running Movement (`CON × 3`)                                       |
| `FR`      | Melee damage bonus, Hit Points                                                                              |
| `DEX`     | Base attack/defense value for weapon skills                                                                 |
| `AGI`     | Initiative (`1d10 + AGI`), normal Movement (`AGI` tiles)                                                    |
| `INT`     | Power of caster abilities (Mage, Cleric, Bard) — simplified use, no Focus/Path system (see Abilities below) |
| `WILL`    | Power to resist charms or fear                                                                              |
| `PER`     | Hability to spot hidden                                                                                     |
| `CAR`     | Not used in this prototype, but it measures luck and the hability to talk to other NPC                      |

`level` is fixed at the campaign-creation default (no leveling in this prototype, per PRD out-of-scope). `INT` and `CAR` are not tracked — they only affect skill points and social tests, neither of which exist in this spike.

### Party classes (PC)

9 fixed classes. Weapon is chosen per character at the configuration screen, from the listed options for that class; armor/IP is fixed per class. Each class has 3 unique abilities (see Abilities section) usable via "Cast Spell/Use Ability" (FR-003).

| Class               | Role             | Key attributes | Weapon choices                       | Armor (IP)                         |
| ------------------- | ---------------- | -------------- | ------------------------------------ | ---------------------------------- |
| Guerreiro (Warrior) | Melee / tank     | High CON, FR   | Espada Longa, Machado Militar        | Cota de Malha (IP 3)               |
| Arqueiro (Archer)   | Ranged / DPS     | High DEX, AGI  | Arco Curto, Arco Longo               | Corselete de Couro (IP 1)          |
| Mago (Mage)         | DPS (magic)      | High INT, WILL | Cajado (melee backup, 1d6)           | Roupa Comum (IP 0)                 |
| Clérigo (Cleric)    | Support / healer | High INT, CON  | Maça                                 | Corselete de Tecido (IP 1)         |
| Ladino (Rogue)      | DPS / stealth    | High DEX, AGI  | Faca, Adaga Suíça                    | Roupa Comum (IP 0)                 |
| Bárbaro (Barbarian) | DPS / tank       | High FR, CON   | Machado Bárbaro, Espada de Duas Mãos | Armadura de Couro Reforçado (IP 1) |
| Bardo (Bard)        | Support          | High WILL, CAR | Espada Curta, Florete                | Corselete de Tecido (IP 1)         |
| Gunslinger          | Ranged / DPS     | High DEX, PER  | Pistola (custom, see below)          | Corselete de Couro (IP 1)          |
| Brawler             | Melee / DPS      | High FR, DEX   | Briga (unarmed)                      | Roupa Comum (IP 0)                 |

**Pistola (custom weapon, not in the Daemon melee table):** damage `2d6`, initiative modifier `−8`, treated as a ranged weapon for all ranged rules in `daemon-system-rules-reference.md` section 7 (defense value against it is always 0, double skill-point cost, no `Esquiva` allowed, half damage beyond normal range, automatic miss beyond max range). Range: 30/80 (normal/max, in tiles).

### Enemies (monsters)

Distinct monster stat blocks (not mirrors of PC classes), using the Comparison Dice logic from the rules reference, kept to 3 types to cover both AI behaviors defined in the PRD (FR-006: melee approach-and-attack, ranged keep-distance) plus one support caster.

| Monster         | Role           | Key attributes               | Weapon/attack                                       | Armor (IP)                                    | AI behavior                                                                                                                        |
| --------------- | -------------- | ---------------------------- | --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ogro            | Melee tank     | CON 16, FR 17, AGI 8, DEX 8  | Clava (treated as Porrete, `1d3+1` + high FR bonus) | Roupa Comum (IP 0, relies on high CON for HP) | Melee: moves toward and attacks the nearest PC                                                                                     |
| Goblin Arqueiro | Ranged         | DEX 14, AGI 15, CON 8, FR 8  | Arco Curto                                          | Roupa Comum (IP 0)                            | Ranged: keeps safe distance while staying in range                                                                                 |
| Xamã Goblin     | Support caster | WILL 14, CON 7, FR 6, AGI 10 | Cajado (melee backup, `1d6`)                        | Roupa Comum (IP 0)                            | Ranged/support: stays behind other goblins, casts heal/debuff abilities on cooldown-less "use when available" logic (see Enemy AI) |

A battle's enemy composition (1–6 units) is chosen at the configuration screen from these 3 types, per FR-001.

---

## Turn structure and actions

Follows FR-003 exactly; this section only adds the content needed to make the rule concrete.

1. **Initiative**: `1d10 + AGI − penalty`, where `penalty` is the initiative modifier of the action taken on that character's previous turn (weapon's own Initiative value from the melee weapons table for Attack; a flat per-ability penalty for Spell/Ability, see table below; `0` for Defend and Use Item). Penalties do not stack across turns — only the immediately preceding action's value applies.
2. **Movement** (once per turn, before or after the action):
   - Normal move (keeps the ability to defend): up to `AGI` tiles.
   - Run (forfeits defense for the round, per the Daemon rule referenced in FR-003/FR-005): up to `CON × 3` tiles.
   - Each tile that changes height by more than the character's Jump value is blocked; each height change within Jump consumes 1 extra Movement point, as already specified in FR-005.
3. **Action** (one per turn): Attack, Cast Spell/Use Ability, Defend, or Use Item — per FR-003/FR-004.

### Ability initiative penalties

| Class      | Ability                | Penalty to next initiative roll |
| ---------- | ---------------------- | ------------------------------- |
| Guerreiro  | Golpe Poderoso         | −6                              |
| Guerreiro  | Postura Defensiva      | −2                              |
| Guerreiro  | Grito de Guerra        | −4                              |
| Arqueiro   | Tiro Certeiro          | −3                              |
| Arqueiro   | Chuva de Flechas       | −7                              |
| Arqueiro   | Tiro de Atordoamento   | −5                              |
| Mago       | Bola de Fogo           | −6                              |
| Mago       | Raio Congelante        | −5                              |
| Mago       | Explosão Arcana        | −8                              |
| Clérigo    | Cura                   | −3                              |
| Clérigo    | Bênção                 | −3                              |
| Clérigo    | Exorcismo              | −5                              |
| Ladino     | Ataque Furtivo         | −4                              |
| Ladino     | Golpe Duplo            | −6                              |
| Ladino     | Fumaça                 | −2                              |
| Bárbaro    | Fúria                  | −2                              |
| Bárbaro    | Golpe Sísmico          | −7                              |
| Bárbaro    | Grito Selvagem         | −4                              |
| Bardo      | Canto de Encorajamento | −3                              |
| Bardo      | Melodia Zombeteira     | −3                              |
| Bardo      | Verso Curativo         | −4                              |
| Gunslinger | Disparo Duplo          | −6                              |
| Gunslinger | Rolamento Evasivo      | −2                              |
| Gunslinger | Tiro Perfurante        | −5                              |
| Brawler    | Combo                  | −4                              |
| Brawler    | Agarrão                | −5                              |
| Brawler    | Chute Giratório        | −6                              |

---

## Combat resolution

Uses the formulas in `daemon-system-rules-reference.md` sections 6 and 15, as already specified in FR-004:

- **Hit chance** = `50 + attacker's weapon/ability attack value − defender's defense value`, rolled as `1d100 ≤ hit chance`, with the hard rule that **any roll above 95 always fails**.
- **Critical hit**: `1d100 ≤ ceil(attack value / 4)` → damage dice rolled twice and summed; FR bonus applied once. This is the only Daemon "special combat situation" included in this version — Heroic Points, all-out attack, total defense, called shots, disarm, and blind fighting are explicitly out of scope for this prototype.
- **Damage**: `max(1 + FR bonus, rolled damage + FR bonus − defender's IP)` — the impact-damage floor from the rules reference, section 6.
- **Ranged rules**: defense value against ranged attacks/abilities is always 0; `Esquiva` never applies against them; half damage beyond normal range, automatic miss beyond max range; line of sight blocked by a rock formation tile.

---

## Abilities and spells

Each class has exactly 3 abilities, usable via the "Cast Spell/Use Ability" action. Abilities are **not** governed by the Daemon magic system (Pontos de Magia/Foco/Caminhos) — that system is explicitly out of scope for this spike (too much setup cost relative to validation value). Instead, each ability is a fixed, pre-defined effect with no resource cost beyond the initiative penalty above and (where noted) a once-per-battle limit, to keep balancing tractable for a hand-tuned spike.

| Class      | Ability                | Effect                                                                                                                                                                                                               |
| ---------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guerreiro  | Golpe Poderoso         | Single-target attack, `+50%` damage, `−10%` to hit.                                                                                                                                                                  |
| Guerreiro  | Postura Defensiva      | This round only: treated as Total Defense (two defense rolls instead of attacking).                                                                                                                                  |
| Guerreiro  | Grito de Guerra        | All enemies within 3 tiles: `−10%` to their next attack roll this battle round.                                                                                                                                      |
| Arqueiro   | Tiro Certeiro          | Single-target ranged attack, `+25%` to hit, critical index doubled for this attack.                                                                                                                                  |
| Arqueiro   | Chuva de Flechas       | All enemies within a 2-tile radius of a chosen tile take a normal ranged attack roll each, no `+` bonus.                                                                                                             |
| Arqueiro   | Tiro de Atordoamento   | Single-target ranged attack at `−20%` to hit; on a hit, half damage and the target skips its next turn.                                                                                                              |
| Mago       | Bola de Fogo           | All targets within a 2-tile radius of a chosen tile take `2d6 + WILL bonus` fire damage (WILL bonus uses the same `(A−13.5)/2` formula as FR, applied to WILL), ignoring IP (fire damage, no kinetic armor applies). |
| Mago       | Raio Congelante        | Single-target `2d6` cold damage, ignoring IP; target's Movement is halved on its next turn.                                                                                                                          |
| Mago       | Explosão Arcana        | Single-target `3d6` damage, ignoring IP, at `−15%` to hit. Once per battle.                                                                                                                                          |
| Clérigo    | Cura                   | Restores `1d10 + WILL bonus` HP to one ally in range (no attack roll needed; cannot exceed max HP).                                                                                                                  |
| Clérigo    | Bênção                 | One ally gains `+20%` to hit on their next attack this battle round.                                                                                                                                                 |
| Clérigo    | Exorcismo              | Single-target attack (`1d6` damage, ignores IP) that also heals the Clérigo for half the damage dealt.                                                                                                               |
| Ladino     | Ataque Furtivo         | Single-target attack; if this target has not yet acted this battle round, `+100%` damage.                                                                                                                            |
| Ladino     | Golpe Duplo            | Two attack rolls against the same target at `−15%` to hit each, using the equipped weapon's normal damage each.                                                                                                      |
| Ladino     | Fumaça                 | This round only: Ladino's defense value is doubled against the next incoming attack.                                                                                                                                 |
| Bárbaro    | Fúria                  | This round's Attack action: `+30%` damage, `−20%` defense for this round.                                                                                                                                            |
| Bárbaro    | Golpe Sísmico          | All enemies adjacent to the Bárbaro take a normal attack roll with the equipped weapon.                                                                                                                              |
| Bárbaro    | Grito Selvagem         | All enemies within 3 tiles: `−15%` to their defense value until their next turn.                                                                                                                                     |
| Bardo      | Canto de Encorajamento | All allies within 3 tiles: `+2` to their next initiative roll.                                                                                                                                                       |
| Bardo      | Melodia Zombeteira     | All enemies within 3 tiles: `−15%` to their next attack roll.                                                                                                                                                        |
| Bardo      | Verso Curativo         | All allies within a 2-tile radius of the Bardo heal `1d6` HP.                                                                                                                                                        |
| Gunslinger | Disparo Duplo          | Two attack rolls against the same or different targets in range, at `−15%` to hit each.                                                                                                                              |
| Gunslinger | Rolamento Evasivo      | Moves up to 2 tiles (does not consume normal Movement) and gains Total Defense this round.                                                                                                                           |
| Gunslinger | Tiro Perfurante        | Single-target attack that ignores half of the target's IP (rounded down).                                                                                                                                            |
| Brawler    | Combo                  | Two attack rolls against the same target at `−10%` to hit each, using `Briga` damage (`1d3` + FR bonus) each.                                                                                                        |
| Brawler    | Agarrão                | Single-target attack (`1d3` + FR bonus, no critical); on a hit, target cannot move on its next turn.                                                                                                                 |
| Brawler    | Chute Giratório        | All enemies adjacent to the Brawler take a `Briga` attack roll.                                                                                                                                                      |

---

## Items

One consumable in this version, per the chosen MVP scope:

| Item          | Effect                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Poção de Cura | Restores `2d6` HP to the user. No attack roll, no initiative penalty, usable once per character per battle (stock of 1 per character, configured automatically — no inventory screen). |

---

## Enemy AI

Per FR-006, extended with concrete tie-breaking logic needed for implementation:

- **Melee monster (Ogro)**: each turn, move toward the nearest reachable PC (shortest pathfinding distance) and Attack if in range after moving; if no PC is reachable this turn, Defend.
- **Ranged monster (Goblin Arqueiro)**: if a PC is within the bow's normal range and line of sight, Attack without moving; if a PC is too close (within 2 tiles), move away to re-establish distance while staying in range of another target if possible, then Attack; if no PC is in range after repositioning, Defend.
- **Support monster (Xamã Goblin)**: prioritizes using Cura-equivalent or debuff-equivalent custom monster ability on itself or the ally with the lowest HP% if one exists and is in range; otherwise behaves like the ranged monster using its `Cajado` as a melee fallback only if cornered (no PC within normal ranged engagement and a PC adjacent).
- Fallback for all monster types, matching FR-006's predicted issue: if no Attack/Ability target is valid, Defend; Use Item is not available to enemies in this version (monsters carry no items).

---

## UI / HUD

- **Configuration screen**: per-slot selection of class and weapon for 3–6 party members; per-battle selection of 1–6 enemies from the 3 monster types. No character naming or customization (auto-generated labels, e.g. "Guerreiro 1").
- **Positioning screen**: drag/click placement of party members inside the highlighted 8x2 zone; enemies are placed automatically and are not shown as interactive during this phase.
- **Battle HUD**:
  - Floating HP bar above every unit's sprite on the canvas.
  - Initiative order list, always visible, showing the upcoming turn order.
  - Context/action menu (Attack, Cast Spell/Use Ability, Defend, Use Item) appears when the player clicks the active character, replacing a persistent bottom action panel.
  - Victory/Defeat/Draw message overlay at battle end (FR-008).

---

## Audio

- SFX only for this version (no background music, per the PRD's audio deprioritization): attack swing/impact, hit confirmation, ability cast, item use, victory, defeat.
- A missing SFX asset must not block combat; it is skipped with a dev-environment console error (FR-007).

---

## Content summary (build checklist)

- 9 PC classes × weapon choices × 3 abilities each = 27 abilities to implement and balance.
- 3 monster types with fixed stat blocks and 2 (Xamã Goblin: custom heal/debuff) special abilities.
- 1 consumable item (Poção de Cura).
- 1 battlefield: 24x24 grid, variable height, 1 obstacle type (rock formation), 1 fixed 8x2 party zone.
- 1 custom weapon (Pistola) beyond the Daemon melee/ranged weapons table.

---

## Scope risk note

The class/ability roster (9 classes × 3 abilities = 27 distinct effects) and the 24x24 grid are larger than the minimal options proposed during design; this was a deliberate choice by the responsible stakeholder to make the demo richer for partner conversations. It increases the volume of content and balancing work relative to the PRD's original time/cost estimate and compounds the "pathfinding complexity" and "runtime performance" risks already tracked in the PRD and HLD. No separate mitigation is added here beyond what the PRD/HLD already specify (simplify Jump first, cap sprite/VFX count, test on modest hardware); if the timeline becomes unsustainable, the first candidates to cut are: reducing abilities per class from 3 to 1, and/or reducing the grid from 24x24 to a smaller size, consistent with the PRD's existing contingency plans.

---

## Open items

- Exact visual/audio asset source (AI-generated vs. free packs) is still pending, per the PRD's "Visual and audio assets" external dependency.
- Exact tile position of the 8x2 party zone within the 24x24 map is a map-authoring detail, not yet fixed.
- Monster custom abilities for Xamã Goblin (heal/debuff values) are referenced above as "equivalent" to PC abilities but not yet assigned final numbers; to be tuned during implementation alongside the rest of the balancing pass.
