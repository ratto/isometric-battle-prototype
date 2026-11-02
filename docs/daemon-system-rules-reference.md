# Daemon System — Rules Reference

> Condensed but detailed summary of **Sistema Daemon, Módulo Básico v1.04 (December 2022)**, Daemon Editora.
> Source terms are Brazilian Portuguese; this document keeps the original term in parentheses on first use so
> the rules stay traceable to the manual.
>
> Purpose in this repository: a rules reference for the turn-based isometric battle prototype. Sections marked
> **[Prototype-relevant]** are the ones that directly drive combat math.

---

## 1. Core resolution mechanic

Everything resolves with a **percentile roll (`1d100`)** against a target number.

- Roll `1d100`. A result **less than or equal to** the target value is a **success**.
- `00` reads as **100**.
- **Any roll above 95 is always a failure**, regardless of how high the target value is.
- Target values above 100% are legal but capped in effect by the rule above.

A `1d100` is two ten-sided dice (one as tens, one as units). A digital stopwatch may replace dice: start it,
count to three, stop it, and read the hundredths of a second (00–99, exactly like `1d100`).

Other dice notation: `1d6`, `1d10`, and `1d3` (roll `1d6`, divide by 2, round up).

### Difficulty modifiers

| Modifier | Effect |
| --- | --- |
| **Easy Test** (Teste Fácil) | Target value **× 2**. If the result exceeds 100%, treat as an automatic success. |
| **Normal Test** | Target value unchanged. |
| **Hard Test** (Teste Difícil) | Target value **÷ 2**. |

Flat percentage modifiers (e.g. `-10%`) are allowed but the manual recommends sticking to **double / half**
for consistency.

---

## 2. Attributes (Atributos) **[Prototype-relevant]**

Eight attributes, split into physical and mental. Humans normally range **5–18**; a typical human has **3D**
in each (see Comparison Dice below).

**Physical**

| Code | Name | Role |
| --- | --- | --- |
| `CON` | Constituição (Constitution) | Vigor, health. Feeds Hit Points; resists poison, fatigue, suffocation, crushing. |
| `FR` | Força (Strength) | Muscle. Feeds Hit Points, melee **damage bonus**, carrying/lifting capacity. |
| `DEX` | Destreza (Dexterity) | Manual dexterity (hands/feet only). Base value of all weapon skills. |
| `AGI` | Agilidade (Agility) | Whole-body agility. Base for **Initiative**, dodging, movement speed. |

**Mental**

| Code | Name | Role |
| --- | --- | --- |
| `INT` | Inteligência (Intelligence) | Problem solving, memory. Feeds Skill Points. |
| `WILL` | Força de Vontade (Willpower) | Concentration, resistance to torture/hypnosis/mind control; tied to Magic. |
| `PER` | Percepção (Perception) | Noticing details; base for several skills. |
| `CAR` | Carisma (Charisma) | Charm, social influence; also stands in for "Luck". |

### Test Number (Número de Teste)

```
Attribute Test % = Attribute × 4
```

E.g. `AGI 15` → Agility Test at 60%.

### Exponential scale

Attributes follow `Y = K × 2^((Attribute − 6))`, meaning **an attribute doubles in real capability every
6 points**. `FR 17` is literally twice as strong as `FR 11`. Conversion constants: Carry `12.4`, Lift `24.8`,
Speed `1.24`. Damage bonus uses a different formula: `Y = (A − 13.5) ÷ 2`.

### Strength table (excerpt) **[Prototype-relevant]**

| FR | Carry (kg) | Lift (kg) | Damage bonus | AGI speed (m/s) |
| --- | --- | --- | --- | --- |
| 1–2 | 15 | 30 | −3 | 1.5 |
| 5–6 | 25 | 50 | −1 | 2.5 |
| 9 | 35 | 70 | 0 | 3.5 |
| 12 | 50 | 100 | 0 | walking pace |
| 15 | 70 | 140 | +1 | 7.0 |
| 17 | 90 | 180 | +2 | 9.0 |
| 20 | 125 | 250 | +3 | 12 |
| 24 | 200 | 400 | +5 | 20 |
| 30 | 400 | 800 | +8 | 40 |

The same table column `AGI → Speed (m/s)` is read with the Agility value.

### Comparison Dice (Dados de Comparação)

A shorthand for creature power: how many `d6` a creature has in an attribute. Humans are `3D` (range 3–18).
A demon with `FR 4D+10` ranges 14–34.

---

## 3. Skills (Perícias) **[Prototype-relevant]**

Skills are percentages. **A skill at 0% cannot be used at all.**

### Skill points

```
Skill Points = 10 × age + 5 × INT
```

- Each point of `INT` = 5 skill points; each year of natural age = 10 points; each year of non-natural age = 5.
- Cap: **500 points per century of life**.
- Each point spent raises the skill by **1%**, up to **+50% over the initial value** at character creation
  (level-ups and Enhancements can exceed this later).
- **Minimum spend of 10 points** on any newly chosen skill.

### Initial values

- **Instinctive skills**: start at a base attribute's value (e.g. `Esquiva (AGI)` starts equal to AGI).
- **Highly technical skills**: start at `0`.
- **Related skills**: start from another skill's value.

### Subgroups

Skills marked `*` are umbrella groups (e.g. `Armas de Fogo* (DEX)`); points must be spent on a specific
subgroup (Pistols, Rifles…). Raising a subgroup never raises the parent group.

### Competence scale

| Value | Meaning |
| --- | --- |
| up to 15% | Curious — heard about it somewhere |
| 15–20% | Novice |
| 21–30% | Practitioner — uses it daily |
| 31–50% | Professional — works with it |
| 51–60% | Specialist |
| 60%+ | One of the best in the field |

### Skill list (groups)

Animals\*, Armadilhas (PER), Armas Brancas\* (DEX), Armas de Fogo\* (DEX), Artes\*, Artífice\* (DEX),
Avaliação de Objetos\* (PER), Camuflagem (PER), Ciências\* (INT), Ciências Proibidas\* (0), Condução\* (AGI),
Disfarce (INT), Eletrônica (0), Engenharia\* (0), Escutar (PER), **Esquiva (AGI)**, Esportes\*,
Etiqueta (CAR)\*, Explosivos (0), Falsificação\* (INT), Furtar (DEX), **Furtividade (AGI)**,
Idiomas/Línguas (0)\*, Informática\* (0), Jogos\*, Manipulação\*, Manuseio de Fechaduras (0), Mecânica (DEX),
Medicina\*, Mineração\* (0), Negociação\*, Pesquisa/Investigação (PER), Procura (PER), Rastreio (PER),
Sobrevivência (PER)\*.

### Combat skills (Perícias de Combate) **[Prototype-relevant]**

Combat skills carry **two values: attack / defense** (e.g. `Espada longa 35/30`), bought from the same skill
point pool. Attack and defense are raised **separately**.

Every character starts with **Briga (Brawl) at `DEX/DEX`**.

---

## 4. Derived statistics **[Prototype-relevant]**

### Hit Points (Pontos de Vida, PV)

```
PV = ceil((FR + CON) / 2) + level
```

Humans typically land at **12–20 PV**. Natural recovery: **1 PV per day of complete rest**.

### Heroic Points (Pontos Heroicos, PH)

An "aura of heroism" layer of extra effective HP, spent to cancel damage from heroic acts.

- Declared **after** damage is known; any damage not cancelled is applied normally.
- Using them is **not an action** and has **no per-round limit**.
- **Cannot** be used when helpless: asleep, unconscious, tied up, poisoned, surprise-attacked, hostage, or
  when the character is not trying to defend themselves.
- Recovery: **1 PH per day** (independent of PV recovery); on level-up, a character regains PH equal to level.
- Important NPCs and villains have them too if the campaign uses them.

### Protection Index (Índice de Proteção, IP)

Armor. **Subtract IP from incoming damage.** Base IP protects only against **kinetic (impact) and ballistic**
damage. Separate IP values exist for fire, gases, electricity, acid, cold, pressure, etc. — armor against one
type does nothing against another, and physical/ballistic armor does **not** protect against falls, light,
gases, fire, cold or electricity.

#### Armor table (Armaduras — all have kinetic IP)

| Type | IP | Penalty (DEX/AGI) |
| --- | --- | --- |
| Roupa Comum (common clothes) | 0 | 0 / 0 |
| Corselete de Tecido | 1 | −1 / 0 |
| Corselete de Couro | 1 | −1 / 0 |
| Armadura de Couro Reforçado | 1 | −1 / −2 |
| Armadura de Anéis | 2 | −1 / −2 |
| Armadura de Escamas | 2 | −1 / −2 |
| Cota de Malha (chainmail) | 3 | −4 / −3 |
| Manto de Ferro | 4 | −2 / −4 |
| Armadura de Placas | 5 | −2 / −4 |
| Armadura de Batalha | 5 | −3 / −6 |
| Armadura de Batalha Completa | 6 | −9 / −7 |

#### Vests and protections

| Type | Kinetic IP | Ballistic IP | Penalty |
| --- | --- | --- | --- |
| Normal clothes | 0 | 0 | 0 / 0 |
| Leather jacket | 1 | 0 | 0 / −1 |
| Kevlar 10 layers | 3 | 5 | −2 / −3 |
| Kevlar 14 layers | 4 | 7 | −2 / −4 |
| Kevlar 18 layers | 5 | 9 | −3 / −5 |
| Kevlar (each extra 2 layers) | +½ | +1 | — |

Environmental/specific IP: firefighter suit IP 10 vs fire, asbestos suit IP 36 vs fire, gas mask IP 30 vs
gases, rubber suit IP 8 vs electricity, thermal suit IP 30 vs cold, astronaut suit IP 36 vs vacuum.
Cover: wooden door IP 2–5, brick wall IP 8, concrete wall IP 15–24, steel door IP 25, bulletproof glass
ballistic IP 12–18, armored car ballistic IP 10–20.

---

## 5. Contested tests

### Attribute vs. Attribute

Pick one side as **Active Source** (Fonte Ativa), the other as **Passive Source**.

```
Active's success % = 50% + (Active attribute − Passive attribute) × 5
```

- A difference of **10 or more** is an **automatic success** (or automatic failure in the reverse direction) —
  no roll needed.
- Lifting weight: convert the weight to its equivalent `FR` from the strength table and treat it as the
  opposing attribute (100 kg ≈ FR 12).

### Combined Attribute (Atributo Somado)

When several characters cooperate: take the **highest** individual value aside; sum **all the others**, divide
by 2 (round up), then add the highest value back. (Example: 16, 11, 8 → 35 ÷ 2 = 18, + 17 = 35 total.)

### Skill vs. Skill

```
Active's success % = 50% + Active's skill − Passive's skill
```

Results above 100% or below 0% are automatic success/failure.

### Skill vs. Attribute

Same formula, using the attribute's **Test number** (`attribute × 4`) as the opposing value.

### Resistance Tests (Teste de Resistência)

Plain attribute tests against an imposed effect: `CON` vs physical attacks, poison, gas, acid, crushing;
`WILL` vs mental attacks, illusions, hallucinations, mind control, psionics; `AGI` vs explosions, slips,
falls, collapses. A successful `AGI` dodge against a magical attack typically **halves** the damage.

---

## 6. Combat **[Prototype-relevant]**

### Round structure (Rodada de combate)

A round is **~10 seconds**. Four phases, always in this order:

1. **Intentions** (Intenções) — every player declares what, when, how and in what manner they act. Order of
   declaration does not matter; ~10–20 seconds of real time each. Indecision = no action this round. The GM
   decides NPC actions first but does not announce them.
   *Optional rule:* conditional actions ("I cast it only if no ally is near the target").
2. **Initiative** (Iniciativas) — everyone rolls.
3. **Attacks / actions** — resolved in initiative order.
4. **Hits and damage** are calculated.

### Initiative

```
Initiative = 1d10 + AGI + modifiers
```

Resolved in **descending** order; ties act simultaneously.

**Modifiers** (optional but recommended, order irrelevant):

- **Weapon modifier** — melee weapons have negative initiative modifiers; bigger weapons, worse modifiers
  (see weapon table).
- **Magic weapon modifier** — `+2` per enchantment level, applied on top of the weapon's own penalty
  (a `+2` sword with a natural `−5` ends at `−3`).
- **Magic modifier** — `−1` per Focus Point spent on the effect.

**Negative initiative**: a character whose final initiative is negative **loses the action this round**, but
their blow is **guaranteed next round**. This penalty cannot apply twice in a row — in practice such a
character acts once every 2 rounds.

**Speed rule (Velocidade)**: a character with multiple actions whose initiative is **more than double** the
second-highest initiative may take their second action before anyone else acts; **more than triple**, the
third action too, and so on.

### What one action can be

Open a door/hatch/window; make an attack (or more, per skills and maneuvers); drink a potion; talk to someone;
cast a spontaneous spell; perform a ritual or part of one; use Faith points for a miracle; apply first aid;
make a skill test; stand up into combat stance; pick up an object and ready it; use an object already in hand;
mount or dismount; **move up to `AGI` metres keeping defensive posture**; **run up to `CON × 3` metres,
forfeiting the dodge**; drop a held object; shout an order and hear the reply; read a map or a few pages.

### Attack resolution **[Prototype-relevant]**

Each weapon has an **attack value** and a **defense value**, both starting from `DEX`. Some weapons give no
defense value; shields have no attack value.

```
Chance to hit = 50% + attacker's weapon attack − defender's defense value
```

The defender's defense value is: their shield's `Escudo` skill if using one; otherwise their weapon's defense
value; otherwise the `AGI` attribute (or the `Esquiva` skill if trained).

Example: `Machado 40/25` attacking a defender with `Espada curta 30/50` → `50 + 40 − 50 = 40%`.
Counter-attack: `50 + 30 − 25 = 55%`.

Key rulings:

- Rolling **far below** the needed number is not "a better hit" — it is simply a hit (except for crits).
- **Barring special cases, each character gets one attack and one defense per round.**
- **Never** allow the `Esquiva` skill against arrows or ranged weapons.

### Critical hit (Acerto Crítico)

```
Critical index = ceil(attack skill / 4)
```

A `1d100` **less than or equal to** the critical index is a critical: the **damage dice are rolled twice and
summed**. Strength bonus and magical bonuses are **not** doubled. (`Machado 40/25` → critical index 10% →
`2d10+2` on a crit.) The GM may add a fracture or a stun lasting into the next round.

### Damage (Dano)

Roll the weapon's damage dice, add the attacker's **FR damage bonus** for melee weapons, then **subtract the
defender's IP**.

**Impact damage (Dano de Impacto)**: any blow that connects deals **at least 1 point** (plus any FR bonus),
even if IP would absorb everything.

### Melee weapons table (Armas Brancas)

| Weapon | Damage | Initiative | Range (m) |
| --- | --- | --- | --- |
| Faca (knife) | 1d3 | −3 | 15/30 |
| Punhal Escocês | 1d3+1 | −3 | |
| Adaga Suíça | 1d3 | −2 | |
| Espada Curta | 1d6 | −4 | |
| Florete | 1d6+2 | −3 | |
| Sabre | 1d6+2 | −6 | |
| Espada Longa | 1d10 | −5 | |
| Espada Bastarda (1 hand) | 1d10 | −6 | |
| Espada Bastarda (2 hands) | 2d6 | −9 | |
| Espada de Duas Mãos | 2d6 | −9 | |
| Machado Militar | 1d6+2 | −7 | |
| Machado Bárbaro | 1d10 | −6 | |
| Mangual | 1d6+1 | −6 | |
| Maça | 1d10 | −5 | |
| Porrete | 1d3+1 | −3 | |
| Martelo de Guerra | 1d6 | −4 | |
| Arco Curto | 1d6 | −10/−1 | 40/100 |
| Arco Longo | 1d6+2 | −9/−1 | 80/200 |
| Besta Leve | 1d6 | −15/−1 | 40/60 |
| Lança de Golpe | 1d6+2 | −7 | |
| Lança de Caça | 1d6 | −6 | 15/30 |

---

## 7. Special combat situations **[Prototype-relevant]**

| Situation | Rule |
| --- | --- |
| **Unarmed (Briga)** | Everyone has `Briga` at `DEX/DEX`. Damage `1d3` + FR bonus. |
| **Multiple opponents** | The outnumbered character may **split their defense value** into as many parts as they wish (60% → two defenses at 30%), or pick which blows to defend — declared **before** the attackers roll. |
| **Multiple attacks** | Resolve everyone's first action in initiative order, then extra actions in initiative order again. Watch the Speed rule. |
| **Ranged attacks** | **Defense value is always 0** against them. Ranged skill points cost **double** (2 points = +1% attack). Beyond normal range but within max range, attack at **half** value; beyond max range, automatic miss. |
| **Out-of-range shots** | Always miss, but the target does not know it — useful as suppressing fire. |
| **Burst fire (Rajada)** | Use only the **tens digit** of the weapon skill as attack value, and roll **`1d10`** instead of `1d100`. *Frontal*: all shots at one target. *Arcing*: spread over a group — more hits possible, but friendlies can be hit too; randomize targets. |
| **Grenades** | Stat `nd6`, plus `pulse X/Y`: `X` = blast radius (m), `Y` = reducer (m). Full damage within the radius; **−1 die per `Y` metres** beyond it. |
| **Aimed/Called shot (Ataque Localizado)** | Must be declared in phase 1 and specified. Suggested as a **Hard Test** (half attack value). On a hit, **+50% damage**; on a critical, **3× normal damage**. Never allow a single called shot to outright kill. |
| **Disarm (Desarme)** | A called shot: on a hit, no damage, but the defender loses the weapon. A **critical disarm** also humiliates (weapon thrown far, onto a table, or caught mid-air). Two-weapon defenders must be disarmed one weapon at a time. |
| **All-out attack / Charge (Ataque Total)** | Single attack, **no defense** that round. **+10% attack**, **+2 damage**, impact damage floor rises to **3**. |
| **Total defense (Defesa Total)** | Forfeit attacks to defend **twice** in a round (or more with multiple attacks). |
| **Surprise attack** | Victim must not know they are watched and have no reason to suspect. Resolved as an **Easy Test**; the surprised side gets **no defense**. |
| **Attack from behind** | If the victim is aware: attacker suffers **half** attack value (hard to see the opponent). If the victim cannot see the attacker: treat as a surprise attack. If merely distracted: **Easy Test**. |
| **Aiming (Mira)** | Spend a full round aiming. Requires: not in close combat (back off ≥10 m if a melee is nearby); not attacked or distracted during the aiming round **or** the attack round (an attack by someone with lower initiative does not spoil it); the target must not be in close combat during the aiming round. Pays off as an **Easy Test** on the aimed shot. |
| **Blind fighting (Luta às Cegas)** | Without the maneuver, **halve both attack and defense** values. With it, fight normally as long as other senses work. |
| **Disadvantageous position** | Seated, surprised, knocked down, etc. GM applies a penalty to **both** attack and defense; **half** is the usual modifier, and it lasts while the situation does. |
| **Off hand (Mão Oposta)** | With the *Ataque com Duas Armas* maneuver: subtract `DEX` from the weapon skill. Without it: subtract `DEX`, then **divide by 2** (round up). The **Ambidestria** Enhancement cancels all off-hand penalties. |
| **Non-lethal combat** | Normal rules except damage: only **one third** is real, the rest temporary. Reaching 0 or less (real + temporary) knocks the character out; they wake in `1d6` hours with the temporary damage healed. |
| **Adverse environment** | Treat the hazard separately from combat; apply flat penalties (e.g. −10% to shoot a partially covered target). |

---

## 8. Special rules

- **Paralysis** — the character is aware but cannot act, move, or defend. If someone decides to kill them,
  they have no defense.
- **Suffocation** — a character holds breath for `CON / 2` rounds. After that they *will* breathe, even
  knowing it is lethal. Underwater: `1d6` damage per round after that point.
- **Falls** — `1d6` damage **per metre**, with an `AGI` test to halve it. An **intentional** jump: pass the
  `AGI` test to reduce the damage by `1d6` **per comparison die** of the character (humans have 3D; angels
  and demons 4D+).
- **Poisons** — always grant a Resistance Test to avoid the worst effect; paralyzing, debilitating, soporific
  or lethal.
- **Localized damage** — if a single body part takes **more than half** the character's PV at once, make a
  `CON` test. Pass: the limb is temporarily disabled. Fail: permanent loss.
- **Inevitable death** — the GM should just rule it rather than forcing dozens of rolls; the manual advises
  against inflicting it on a player character.
- **Healing** — 1 PV per full day of rest, and PH equal to level per day. Special injuries (sprains, torn
  ligaments, fractures) take weeks or months. Rituals can accelerate this.
- **Dying** — at **0 PV** the character falls unconscious and loses **1 PV per round** from the wound. At
  **−5 PV**, with no intervention, the character **dies**.

---

## 9. Character creation (10 steps)

| Step | Content |
| --- | --- |
| 1 | **Campaign and setting** — fixes the attribute pool, Enhancement points, skill cap and era restrictions. |
| 2 | **Background** — written history first, numbers later (the manual supplies a questionnaire on history, goals, personality, tastes, environment). |
| 3 | **Attributes** — distribute the campaign's point pool across the 8 attributes; compute Test numbers (`×4`). |
| 4 | **Enhancements** (Aprimoramentos) — spend the campaign's points. |
| 5 | **Profession and skills** — compute `10 × age + 5 × INT`; the manual recommends distributing raw points **first** and adding the attribute-derived initial values **afterwards**. |
| 6 | **Combat skills** — same pool, but each skill has an attack and a defense value. `Briga` starts at `DEX/DEX`. |
| 7 | **PV and IP** — `ceil((FR+CON)/2) + level`; IP from worn armor, with its DEX/AGI penalties. Initiative equals AGI at this point. |
| 8 | **Heroic Points** — from the *Pontos Heroicos* Enhancement and level. |
| 9 | **Equipment and weapons** — bound by era, profession and GM approval. Firearms require the *Armas de Fogo* Enhancement. |
| 10 | **Extras** (optional) — magic, psionics, faith powers, cybernetics, supernatural races, etc. |

### Campaign types

| Type | Attribute points | Range | Enhancement pts | Skill cap | Starting enemies |
| --- | --- | --- | --- | --- | --- |
| Realistic / Horror | 101 | 5–18 | 5 | 500 | 1 |
| Adventure / Fantasy | 111 | 5–20 | 6 | 500 | 1 |
| Medieval Horror | 101 | 5–18 | 5 | 500 | ≥1 |
| Espionage / Heroic | 111 | 5–20 | 6 | 500 | ≥2 |
| Immortals / Heroes | 131 | 12–30 | 1 per 20 years of life | 500 | ≥2 (1 per 50 years) |

---

## 10. Enhancements (Aprimoramentos)

Uncommon, rare or supernatural traits. Humans start with **5 points**. A level-2 Enhancement requires having
it at level 1 first (1 point per level step). Up to **3 Negative Points** may be taken, each buying one
positive point. Enhancements from other Daemon Editora books are compatible.

Notable entries from the basic list:

| Enhancement | Cost | Effect summary |
| --- | --- | --- |
| **Afinidade com fadas** | 3–5 | Fae are drawn to the character; at 4, fae companions; at 5, access to Arcádia's realms and portals. |
| **Alma Pura** | 2 | (Christian characters.) No demon can touch or attack them while the soul is unblemished; demonic magic suffers `−4D` against them. Breaking a commandment taints the soul for ≥1 week. |
| **Ambidestria** | 2 | Both hands equally effective; two one-handed melee weapons at once. Affects only **DEX**-based skills (not boxing/martial arts). |
| **Armas de Fogo** | 1–3 | Legal right / means to carry: 1 = revolvers, pistols, legal semi-autos; 2 = SMGs, cal. 12 carbines, automatic weapons; 3 = heavy machine guns, military weapons. |
| **Arma ou Amuleto Mágico** | 1–2 | 1 = small/medium weapon at `+1` (+1 damage, +10% to split between attack and defense); 2 = up to `+3` (+3 damage, +30% to split). |
| **Biblioteca** | 1–4 | Triples knowledge-skill values (max 90%) for specified subgroups: 1 = 2 subgroups, 2 = 6, 3 = 10, 4 = 14. |
| **Bom Senso** | 1 | The GM may warn the player when an intended action is obviously stupid. |
| **Conhecimentos Arcanos** | 2 | Divination (tarot, runes, I-Ching, …): once per session, up to three YES / NO / IRRELEVANT answers. |
| **Contatos e Aliados** | 1–4 | 1 = one important ally, 2 = two, 3 = four, 4 = eight. Areas: Bureaucracy & Politics, Law, Church, Industry, Media, Police, Underworld. |
| **Familiares** | 1–2 | 1 = common animal (cat, owl, snake…); 2 = exotic or larger animal. |
| **Guardião de Artefato** | 3 | Guardian of a valuable item — attracts powerful attention; the manual warns against using it lightly. |
| **Homúnculo** | 2 | A 10 cm flying demon, fully loyal. Needs a drop of the master's blood daily or loses 1 PV/day. Stats: CON 6, FR 6, AGI 16, DEX 4, INT 1, WILL 5, CAR 0, PER 16, 8 PV, IP 0, Garras 20/20, damage `1d3`. |
| **Imunidade a Venenos** | 2–3 | 2 = immune to natural poisons, `+1D` vs magical ones; 3 = also immune to artificial poisons, `2D` protection vs magical. |
| **Inocência** | 1–2 | 1 = easily appears innocent, alibis stick; 2 = even witnesses can be convinced (Manipulação-Lábia Normal Test), and Interrogation tests against them become Hard. |
| **Pactos** | 1 | Pacts with powerful entities — power traded for attributes, magic points, skill points or the soul. |
| **Recursos e Dinheiro** | 1–5 | Monthly income: 1 = US$2,000; 2 = 4,000; 3 = 8,000; 4 = 16,000; 5 = 32,000. Total possessions ≈ 50× income. |
| **Sábio** | 1 | One non-combat skill treated as 90%, plus contacts and lore in that field. Once per character; max two characters per group. |
| **Saúde de Ferro** | 1 | Recovers 3 PV every two days instead of 2; rarely falls ill. |
| **Sedutor** | 1 | `+25%` on any seduction-related test. |
| **Sensitivo** | 1–2 | 1 = prophetic dreams/art; 2 = sixth sense, may attempt Perception tests beyond normal senses. |
| **Senso de Direção** | 1–2 | 1 = never gets lost, always remembers a travelled route; 2 = works across planes of existence. |
| **Senso Numérico** | 1 | Instantly counts large quantities precisely. |
| **Sentidos Aguçados** | 1 per sense | Perception tests with that sense drop one difficulty step (Hard→Normal, Normal→Easy, Easy→no roll). |
| **Sono Leve** | 1 | Wakes at any noise or movement nearby. |
| **Sortudo** | 2 | Once per session, reroll one failed test. Must be declared **before** the roll. |
| **Talento** | 1 per Art | Normal tests in that Art are treated as Easy, Hard tests as Normal. **Never** for combat skills. |

---

## 11. Magic terminology (basic module only names them)

- **Pontos de Magia** — how much magic a mage can perform; non-mages have none.
- **Pontos de Focus** — how far along a mage is in a given Path/Form; more Focus = more power there.
- **Formas** (Forms) — the 3 ways of manipulating: **Entender** (Understand), **Criar** (Create),
  **Controlar** (Control), based on the Sephiroth.
- **Caminhos de Magia** (Paths) — 6 elemental (Fire, Water, Air, Earth, Light, Darkness) plus Humanos,
  Animais, Plantas, Arkanun, Spiritum, Metamagia.
- **Círculos de Magia** — the maximum Focus inside a mage's largest Path.
- **Rituais** — elaborate spells that must be written in grimoires and memorized.

Combat interaction: each Focus Point spent applies **−1 to initiative** (gestures, words, fetishes take time).

---

## 12. Experience and advancement

At the end of an **adventure** (not each session), the GM scores each character 0–2 on five questions:
good roleplay? collaborated with the group? adventure objectives met? did the character/player learn
something? was the character heroic? Maximum 10 XP, minimum 0; the manual recommends staying in the 3–7 band.

Maximum human level is **15** (higher requires demonic pacts or Advanced Age). Each 10 years without
adventures after creation grants 1 level.

Per level the character gains **+1 PV**, **+1 attribute point**, **25 skill points**, and 1 Enhancement point
every three levels. The **mystic method** (mages only) adds 10 skill points, 1 Focus point and 1 Magic point;
the **mundane method** (non-mages) gives 25 skill points.

Constraints: an attribute may **not** be raised **two levels in a row**; attributes may exceed 18 this way.
Unallocated skill points are lost; min 5 and max 10 points per skill per level-up, and a brand-new skill
costs at least 10.

### Level advancement table

| XP | Level | PV | Attributes | Enhancement pts | Skill pts | Magic pts | Focus pts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | 0 | initial | 100 | initial | initial | — | — |
| 0 | 1 | +1 | 101 | initial | initial | initial | initial |
| 5 | 2 | +2 | 102 | +1 | +25 | +1 | +1 |
| 15 | 3 | +3 | 103 | +1 | +50 | +2 | +2 |
| 30 | 4 | +4 | 104 | +1 | +75 | +3 | +3 |
| 50 | 5 | +5 | 105 | +2 | +100 | +4 | +4 |
| 80 | 6 | +6 | 106 | +2 | +125 | +5 | +5 |
| 120 | 7 | +7 | 107 | +2 | +150 | +6 | +6 |
| 180 | 8 | +8 | 108 | +3 | +175 | +7 | +7 |
| 250 | 9 | +9 | 109 | +3 | +200 | +8 | +8 |
| 400 | 10 | +10 | 110 | +3 | +225 | +9 | +9 |
| 550 | 11 | +11 | 111 | +4 | +250 | +10 | +10 |
| 800 | 12 | +12 | 112 | +4 | +275 | +11 | +11 |
| 1,100 | 13 | +13 | 113 | +4 | +300 | +12 | +12 |
| 1,600 | 14 | +14 | 114 | +5 | +325 | +13 | +13 |
| 2,200 | 15 | +15 | 115 | +5 | +350 | +14 | +14 |

All columns are **cumulative totals**, not per-level gains (reaching level 7 grants 1 PV, not 7).

---

## 13. Time units

| Unit | Duration |
| --- | --- |
| **Rodada** (round) | ~10 seconds — enough for every character to take one action |
| **Cena** (scene) | Undefined; 3–10 rounds, up to 2–3 minutes |
| **Aventura** | A single story; 2–3 hours up to several sessions |
| **Campanha** | A succession of adventures |

---

## 14. Golden Rule

> *Regra de Ouro*: you may add, change or remove any rule so the game works the way you like it.

---

## 15. Prototype implementation notes

Mapping the above onto the battle prototype's combat model:

1. **Unit stats needed**: 8 attributes, PV (current/max), PH, IP (kinetic), and per-weapon `attack/defense`
   pairs with damage dice and initiative modifier.
2. **Turn order**: roll `1d10 + AGI + weapon modifier` once per round, sort descending; drop units with a
   negative result (and flag them so the penalty cannot repeat next round).
3. **Hit roll**: `1d100 <= 50 + attackerAttack − defenderDefense`, with the hard ceiling that **any roll > 95
   fails**. Ranged attacks use defense `0`.
4. **Critical**: `roll <= ceil(attackerAttack / 4)` → roll damage dice twice; add FR bonus **once**.
5. **Damage**: `max(1 + frBonus, rolledDamage + frBonus − defenderIP)` — the impact-damage floor.
6. **Death/unconscious**: `PV <= 0` → unconscious, `−1 PV` per round, dead at `−5`.
7. **Movement on the grid**: `AGI` metres while keeping defense, or `CON × 3` metres when running (dodge
   forfeited) — a natural fit for two movement ranges in the pathfinding layer.

---

*Summarized from* **Sistema Daemon — Módulo Básico v1.04**, Daemon Editora, © 1998 (open content under the
Licença Daemon; authors Marcelo Del Debbio, Norson Botrel et al.). Reference material only.
