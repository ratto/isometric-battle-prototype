# Spec: Weapon List Seeding

**Slug:** `03-weapon-list-seeding`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-11

## 1. Summary

This user story starts populating the prototype's static data layer (SQLite via WASM, per
[ADR-0004](../../adr/0004-sqlite-wasm-for-static-game-data.md)) with the first of its four planned
tables: `WEAPONRY`. It covers only **medieval melee and ranged weapons** compatible with the Sistema
Daemon setting — no shields, no firearms, no sci-fi or modern equipment, and no material imported from
other RPG systems (D&D, GURPS, Storytelling, etc.).

The weapon data comes from two kinds of sources: the official melee weapons table in
[docs/daemon-system-rules-reference.md](../../daemon-system-rules-reference.md), and additional
Daemon-specific weapon names found through web research (the `wiki.daemon.com.br` weapon-skill category
pages, and Daemon Editora's own "Guia de Armas Medievais" supplement), with mechanical values estimated
by analogy when a source names a weapon but does not give its stats, always documented as such. The
curated result is checked in at
[weapons-seed-data.json](weapons-seed-data.json), which the implementation phase will consume to build the
actual seed script.

This is purely a data-infrastructure story: schema, seed/reset/inspect scripts, and the versioned SQLite
file. It does not add any composable, Pinia store, or UI that reads from `WEAPONRY` — that is left for
future user stories, once combat itself is being built.

## 2. Daemon System grounding

| Mechanic | Rules reference section | Notes on how it's used here |
| --- | --- | --- |
| Melee weapons table (damage, initiative modifier, range) | §6 Combat → "Melee weapons table (Armas Brancas)" | The 21 weapons listed there (including the one-handed/two-handed Bastard Sword split) are seeded verbatim as `source: "official"` rows — damage dice, initiative modifier, and range copied exactly as printed. |
| Combat skills carry attack/defense pairs, bought per specific weapon | §3 "Combat skills (Perícias de Combate)" | Grounds the decision to model `skill_group` as a per-weapon-family classification (sword, axe, bow, …) rather than a single "Armas Brancas" bucket — Daemon already requires each specific weapon (or family) to be bought as its own skill. |
| Ranged attacks always face defense value 0; range beyond "total" is an automatic miss | §7 "Special combat situations" | Grounds why `range_short`/`range_long` are stored per ranged weapon — the prototype's future combat logic will need both values to apply the "half value beyond short range, miss beyond long range" rule, even though this US does not implement that logic yet. |

No rule is being simplified or deviated from in this US, because this US does not implement any combat
resolution — it only stores the data combat resolution will later read. The one deliberate addition not
present in the rules reference is the `source`/attribution field per weapon, which is a data-provenance
concern for this project, not a Daemon rule.

## 3. Goal and value

- **Goal:** stand up the first piece of the static data layer end-to-end (schema → seed → reset →
  inspect → versioned `.sqlite` file), proving out the SQLite-via-WASM approach ADR-0004 committed to,
  using `WEAPONRY` as the simplest of the four planned tables.
- **Value:** every future combat-related user story (attack resolution, equipping units, damage
  calculation) depends on weapon data existing somewhere queryable. Doing this now, before any combat
  code is written, means later stories can focus on combat logic instead of also inventing the data
  layer. It also produces a reusable pattern (schema + idempotent seed + reset + inspect scripts) that
  the `Items`, `Upgrades`, and `Spells` tables can follow later with less rework.

## 4. Scope

### In scope

- The `WEAPONRY` table schema (columns listed in §5).
- The `WeaponSkillGroup` TypeScript enum (id + description per weapon family).
- A curated, English-language JSON dataset of medieval melee and ranged weapons — official Sistema
  Daemon weapons from the rules reference, plus Daemon-specific community/official-supplement findings,
  each weapon tagged with its data source — checked in as reference data
  ([weapons-seed-data.json](weapons-seed-data.json)).
- An idempotent seed script that reads that JSON and writes/updates rows in `WEAPONRY`, keyed by a
  unique `slug`, never duplicating rows on repeated runs.
- A reset script that recreates the `WEAPONRY` schema from scratch.
- An inspect script that prints every row of every existing table in the database, for manual review.
- Three new `npm run` scripts (`db:reset`, `db:seed`, `db:inspect`) and the `.sqlite` file itself,
  versioned in the repository so it ships with the Netlify static deploy.
- Updating `README.md`'s "Getting started" section with the three new commands.

### Out of scope

- Shields (`Escudo`) — explicitly deferred; shields have no attack value in Daemon and belong with
  armor/protection data, not `WEAPONRY`.
- Firearms, explosives, and any modern/sci-fi equipment.
- Any weapon, mechanic, or terminology sourced from a non-Daemon RPG system (D&D, GURPS, Storytelling,
  etc.) — even if visually similar to a Daemon weapon.
- The `ITEMS`, `UPGRADES`, and `SPELLS` tables (ADR-0004's other three planned tables) — a later US each.
- Any composable, Pinia store, or query helper (e.g. `getAllWeapons()`) that reads `WEAPONRY` — deferred
  to the future combat user stories that will actually consume this data.
- Any UI or HUD element displaying weapon data.
- Weapon icons/sprites.

## 5. Functional requirements

1. The `WEAPONRY` table has the following columns: `slug` (TEXT, unique, primary key), `name` (TEXT,
   English), `description` (TEXT, English, short — authored by this project when the source material
   doesn't provide one), `category` (TEXT, `"melee"` or `"ranged"`), `damage_dice` (TEXT, e.g. `"1d6+2"`),
   `initiative_modifier` (TEXT, e.g. `"-6"` or `"-10/-1"` for weapons with separate ready/attack
   penalties), `range_short` (INTEGER, nullable, metres), `range_long` (INTEGER, nullable, metres),
   `skill_group` (TEXT, one of the `WeaponSkillGroup` enum ids), `two_handed` (BOOLEAN), and `source`
   (TEXT, e.g. `"official - Sistema Daemon, Módulo Básico v1.04, page 17"` or `"community -
   <URL>"`).
2. The `WeaponSkillGroup` enum is defined once in TypeScript (not as a separate database table) and
   lists, at minimum: `dagger`, `sword`, `axe`, `mace`, `hammer`, `flail`, `whip`, `spear`, `polearm`,
   `bow`, `crossbow`, `thrown`, `exotic` — each with an `id` and a human-readable `description`.
3. [weapons-seed-data.json](weapons-seed-data.json) contains only medieval melee/ranged weapons consistent
   with the Sistema Daemon setting (including Daemon's own Eastern/"exotic" weapon-skill category, per
   the human's explicit decision to include it) — no firearms, no modern gear, and no mechanic or name
   traceable only to a non-Daemon system.
4. Every weapon entry's `source` field states either the official manual page/section it was copied from,
   or the community URL it was found at, so provenance is auditable for every row.
5. Running `npm run db:reset` drops and recreates the `WEAPONRY` table (and any other static-data tables
   that exist at the time) from scratch.
6. Running `npm run db:seed` inserts every weapon from the JSON dataset into `WEAPONRY`, using `slug` as
   the uniqueness key: a row whose slug already exists is updated in place (upsert), never duplicated.
7. Running `npm run db:seed` a second time, without an intervening `db:reset`, leaves the row count
   unchanged.
8. Running `npm run db:inspect` prints, in a human-readable form, every row of every table that currently
   exists in the database file.
9. The database persists as a `.sqlite` file committed to the repository, regenerated by `db:reset` +
   `db:seed`, so it is present at Netlify build/deploy time without any build-time seeding step.
10. `README.md`'s "Getting started" section lists the three new `npm run` commands alongside the
    existing ones.

## 6. Non-functional requirements

- Uses the already-installed `sql.js` dependency (SQLite via WASM) per ADR-0004 — no new database engine
  or ORM is introduced.
- All identifiers, data (`name`, `description`), comments, and documentation are written in English, per
  the repository's language policy (CLAUDE.md), even though the source rules reference and most research
  sources are in Brazilian Portuguese.
- The scripts must run under Node via `npm run`, consistent with the project's existing script
  conventions (`dev`, `build`, `lint`, `format`, `test`).
- No new runtime dependency beyond what a reset/seed/inspect CLI script reasonably needs (e.g. reading
  the JSON file and writing to `sql.js`); no new frontend-facing dependency is introduced by this US.

## 7. Edge cases

| Edge case | Expected behavior |
| --- | --- |
| `db:seed` run twice in a row without `db:reset` | Row count and row contents stay identical after the second run (upsert by `slug`, not insert). |
| A weapon's `slug` is edited in the JSON between two seed runs (same conceptual weapon, new slug) | Treated as a brand-new row; the old slug's row is **not** automatically removed by `db:seed` (only `db:reset` clears the table). This is a known limitation, not a bug — recorded in Open Questions. |
| `db:inspect` run on a freshly `db:reset` (but not yet seeded) database | Prints the table structure with zero rows, not an error. |
| A ranged weapon's `range_short`/`range_long` on a melee-only weapon | Both columns are `NULL` for melee weapons that have no thrown/shot variant; populated only when the weapon can be used at range. |
| A weapon with two initiative values (e.g. a bow's ready vs. attack penalty) | Stored as a single string (e.g. `"-10/-1"`), mirroring the exact notation already used in the rules reference table, rather than splitting into two columns — this US does not interpret the value, only stores it. |
| Source material names a weapon but gives no mechanical stats (most "community" entries) | Stats are estimated by analogy to the closest official weapon, and the estimation is spelled out in the `description` or `source` field — never silently invented. |

## 8. Risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Scarcity of Daemon-specific community material on the web (niche Brazilian system) | Medium / Low | Accepted as a known limitation per the human's explicit sign-off — the seed can lean mostly on official entries plus a smaller community-sourced set; this is a time-boxed spike, not a commercial product requiring an exhaustive catalog. |
| The one community source with real stat tables found ("Guia de Armas Medievais", Daemon Editora) is a multi-system book (Daemon + D20 + White Wolf + GURPS columns per weapon) and the fetched copy is OCR-corrupted | Medium / Medium | Only the `Daemon:`-labeled values from that book would ever be used, and only where legible without guessing; the research for this US treated it as unreliable and did not pull numbers from it into the final dataset — flagged here for the implementation phase to re-verify against a clean copy if it wants to mine it further. |
| Estimated ("community") stats turn out unbalanced once real combat math exists | Low / Low | Acceptable for a spike; any weapon can be re-tuned once actual combat testing (a future US) reveals a problem — the `source` field makes it easy to find which rows were estimated. |
| Re-running `db:seed` after editing a weapon's `slug` leaves an orphaned old row (see Edge cases) | Low / Low | Documented as a known limitation; `db:reset` is the escape hatch when the dataset's slugs change meaningfully. |

## 9. Dependencies

- Depends on [ADR-0004](../../adr/0004-sqlite-wasm-for-static-game-data.md) and the `sql.js` dependency
  already installed in `01-project-initial-setup`.
- Is the first of the four static-data tables ADR-0004 anticipates; it does not block `ITEMS`,
  `UPGRADES`, or `SPELLS`, but is expected to establish the schema/seed/reset/inspect pattern those future
  USs will likely reuse.
- Blocks, conceptually, any future combat US that needs to equip units with weapons — but does not itself
  implement any consumer of this data.

## 10. Definition of Done

- [ ] `WEAPONRY` table schema exists and matches §5's column list.
- [ ] `WeaponSkillGroup` TypeScript enum exists with at least the 13 groups listed in §5, each with an
      `id` and a `description`.
- [ ] [weapons-seed-data.json](weapons-seed-data.json) is the authoritative seed source, with every weapon
      tagged with a `source`.
- [ ] `npm run db:reset`, `npm run db:seed`, and `npm run db:inspect` all exist and work as described in
      §5's functional requirements.
- [ ] Running `db:reset` then `db:seed` reports how many weapons were inserted.
- [ ] Running `db:seed` again without `db:reset` leaves the row count unchanged.
- [ ] `npm run db:inspect` prints every row of every existing table.
- [ ] The resulting `.sqlite` file is committed to the repository.
- [ ] `README.md`'s "Getting started" section documents the three new commands.
- [ ] No shield, firearm, modern, or non-Daemon-sourced weapon appears in the final dataset.

## 11. Manual verification plan

1. **Setup:** check out this feature's branch, run `npm install` if needed.
2. **Reset + seed:** run `npm run db:reset && npm run db:seed`. Confirm the terminal reports the number of
   weapons inserted (expected to match the weapon count in
   [weapons-seed-data.json](weapons-seed-data.json)).
3. **Idempotency check:** run `npm run db:seed` again, with no reset in between. Confirm the reported/
   observed row count is unchanged — no duplicates were created.
4. **Inspection:** run `npm run db:inspect`. Confirm every `WEAPONRY` row prints with all its columns
   populated as expected (no missing `damage_dice`, no weapon with both `category: "melee"` and a
   non-null range outside the documented thrown exceptions, etc.), and manually review a sample of rows
   against [weapons-seed-data.json](weapons-seed-data.json) for a visual sanity check.
5. **Scope check:** confirm no shield, firearm, or modern weapon appears in the `db:inspect` output.
6. **Repo check:** confirm the `.sqlite` file is present and staged/committed, and that `README.md` lists
   the three new commands.

## 12. Open questions

- Editing a weapon's `slug` between seed runs leaves the old row behind until the next `db:reset` (see
  Edge cases §7) — acceptable for this spike, but worth keeping in mind if the dataset churns a lot during
  implementation.
- The OCR-corrupted "Guia de Armas Medievais" (Daemon Editora) was identified as a potential richer
  official source but not mined for exact numbers in this spec, due to data-quality concerns — the
  implementation phase may choose to track down a clean scan and extend the dataset, but this is not
  required for Definition of Done.
- The exact on-disk location of the `.sqlite` file, the seed/reset/inspect script implementation
  language/structure, and any additional internal helper modules are left for the `tech-lead` plan to
  decide — this spec defines the schema and behavior, not the file layout.

## 13. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | Should shields be included in `WEAPONRY`, given the human's initial list mentioned them? | No — melee and ranged weapons only; shields deferred to a future table/feature. |
| 2 | What columns should `WEAPONRY` have? | `name`, `category`, `damage_dice`, `initiative_modifier`, `range_short`/`range_long`, `skill_group`, `two_handed`, `source`, `slug` — confirmed, plus a `description` field added per the human's follow-up. Language: English; `description` authored by the project when the source lacks one; `source` must cite the exact origin (official page or community URL). |
| 3 | Should `WeaponSkillGroup` be a DB lookup table or a code-only enum, and how granular? | Code-only TypeScript enum (no DB table); granularity is specific weapon-type subgroups (sword, axe, spear, polearm, …), not a single umbrella group. |
| 4 | What's the inclusion bar for "community" weapons found on the web? | Must be Daemon-specific material (not a conversion from another system); if a source doesn't give explicit mechanical stats, the human allowed creating/estimating them, annotated in the description. |
| 5 | What should the reset/repopulate commands look like? | `npm run db:reset` (recreate schema) + `npm run db:seed` (idempotent upsert by `slug`) — confirmed; also confirmed the `.sqlite` file persists as a versioned file in the repo (not regenerated purely in-memory), to simplify the Netlify deploy. |
| 6 | How should the human manually verify the seed worked? | Row count reported on `db:reset && db:seed`; unchanged row count on a second `db:seed`; plus a `npm run db:inspect` command (added per the human's request) that prints every row of every table. |
| 7 | Does this US include any composable/store/UI consuming the weapon data? | No — infrastructure only; consumption is deferred to future user stories. |
| 8 | Is it acceptable if few "community" weapons are found, given how niche Sistema Daemon is? | Yes, explicitly acceptable for this prototype. |
| 9 | Should Eastern/"exotic" Daemon weapons (katana, nunchaku, shuriken, kusarigama, etc.) be included? | Yes, include everything in that official Daemon category, alongside the Western-medieval weapon families. |
| 10 | Should the full curated weapon JSON be produced now (attached to the spec) or deferred to implementation? | Now — produced as part of this spec and checked in as [weapons-seed-data.json](weapons-seed-data.json). |

Additionally, per the human's instruction, the `claude-api` skill was consulted to obtain current Claude
model pricing before completing this spec, strictly for populating §14 below — this has no connection to
the weapon-seeding feature itself.

## 14. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 (`claude-sonnet-5`) |
| Input tokens | Not precisely measurable from within this session — no Admin Usage API access was available to query exact per-request token counts. |
| Output tokens | Not precisely measurable from within this session, for the same reason. |
| Estimated cost (USD) | Not computed, since no reliable token counts were available to multiply against the confirmed per-token rate. |
| Estimated cost (BRL) | Not computed, for the same reason. |

- Confirmed pricing used for any future, more precise estimate: Claude Sonnet 5 — **US$ 2.00 / 1M input
  tokens**, **US$ 10.00 / 1M output tokens** (per the `claude-api` skill's cached pricing table, 2026-06-24).
- This session's main token-cost drivers were: re-reading the full
  `docs/daemon-system-rules-reference.md` (~580 lines) at the start of the conversation per this skill's
  instructions; several web-research subagent calls (wiki.daemon.com.br category pages, the "Guia de
  Armas Medievais" OCR text, and a Daemon forum thread); and authoring this spec plus the 68-entry
  `weapons-seed-data.json` reference file. An organization with Admin API access could pull the exact
  figures via the Usage and Cost Admin API for this session's time window; that path was not available
  here.
