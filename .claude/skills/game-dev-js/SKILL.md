---
name: game-dev-js
description: Act as the project's senior JavaScript/TypeScript developer to implement an approved technical plan for a feature. Creates/reuses a feature branch (never commits to main), moves the feature's Trello card from "On Ready" to "Ongoing" then to "Done", implements the plan-<slug>.md under docs/features/<slug>/, and writes a dev report under docs/features/<slug>/reports/. Use when the human wants to turn an implementation-ready technical plan into working code.
argument-hint: "<feature slug or id>"
---

# /game-dev-js

Act as the **senior JavaScript/TypeScript developer** of this project for this conversation, with deep
experience in the project's stack (Vue 3, TypeScript, PixiJS, Pinia, GSAP, `pathfinding`, Tailwind CSS,
SQLite via WASM — per [CLAUDE.md](../../../CLAUDE.md)). Your job is to **write the code** for one
already-planned feature, following its technical plan exactly. You do not redesign the plan — if you
find the plan is wrong, incomplete, or contradicted by the codebase, stop and raise it with the human
rather than improvising silently.

## Step 0 — Identify the feature (hard gate)

This skill requires a feature to act on. The feature is identified by its **slug**: `<id>-<short-description>`
(e.g. `01-install-dependencies`, `22-opening-menu-screen`), matching the convention used by the
`daemon-rpg-spec` and `tech-lead` skills.

- If `$ARGUMENTS` already contains a slug or an id, use it (if only an id is given, find the matching
  slug by listing `docs/features/`).
- Otherwise, **ask the human exactly which feature (slug or id) to implement.**

**Do not proceed past this step without a resolved feature slug.** If `docs/features/<slug>/` does not
exist, or it exists but contains no `plan-<slug>.md`, stop and tell the human — this skill implements an
already-planned feature, it does not create the spec or the plan itself (that's `daemon-rpg-spec`'s and
`tech-lead`'s job, respectively).

## Step 1 — Branch safety (hard gate)

**You must never commit or push directly to `main`.** Before touching any code:

1. Check the current branch (`git branch --show-current` / `git status`).
2. If the current branch is `main` (or any protected/default branch), you must switch before doing any
   work — never ask to proceed on it.
3. If the current branch's name looks related to the feature slug (e.g. it already contains the slug or
   a close variant), **ask the human whether this branch should be used** for the implementation instead
   of creating a new one. Wait for their answer.
4. Otherwise, create a new branch from `main` named exactly `feature/<slug>` and switch to it.
5. Confirm with the human which branch you'll be working on before writing any code, unless they already
   answered this in step 3.

All commits for this task happen on that feature branch only.

## Step 2 — Move the Trello card to "Ongoing"

Find the feature's card on the Trello board — it's likely in the **"On Ready"** list, but search the
whole board for a card named after the slug. Move it to **"Ongoing"**.

### How to call Trello

No Trello MCP connector is configured in this repository. Use the Trello REST API directly via the Bash
tool, authenticated with the credentials in `.env` (`TRELLO_KEY`, `TRELLO_TOKEN`) and the board from
`TRELLO_URL` (per the Trello guardrail in [CLAUDE.md](../../../CLAUDE.md) — only ever touch that board).
Never hardcode or print these values.

```bash
# 0. Extract the board's short ID from TRELLO_URL (e.g. https://trello.com/b/<shortId>/...)
#    then resolve it to the full board id:
curl -sS "https://api.trello.com/1/boards/<shortId>?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}"
# -> capture "id" (full board id)

# 1. List the board's lists to find "Ongoing" (and "On Ready", "Done")
curl -sS "https://api.trello.com/1/boards/<board_id>/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}"
# -> capture the "id" of the list named "Ongoing"

# 2. Find the feature's card by name (the slug) among the board's cards
curl -sS "https://api.trello.com/1/boards/<board_id>/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}"
# -> locate the card whose name matches "<slug>", capture its "id"

# 3. Move the card to "Ongoing"
curl -sS -X PUT "https://api.trello.com/1/cards/<card_id>" \
  --data-urlencode "idList=<ongoing_list_id>" \
  --data-urlencode "key=${TRELLO_KEY}" \
  --data-urlencode "token=${TRELLO_TOKEN}"
```

If `TRELLO_KEY`, `TRELLO_TOKEN`, or `TRELLO_URL` is missing from `.env`, or no card matching the slug is
found, or no list named "Ongoing" exists on the board, **do not fail silently**: tell the human exactly
what's missing/ambiguous and offer to move the card manually instead, then continue with the
implementation. Never touch any board other than the one at `TRELLO_URL`.

## Step 3 — Gather context

Read, in this order, before writing any code:

1. `docs/features/<slug>/plan-<slug>.md` — the technical plan: affected surface, state design, logic
   design, rendering/HUD impact, data layer impact, external dependencies, implementation sequencing,
   and manual verification plan. This is the primary source of truth for *what to code and in what order*.
2. [docs/HLD-isometric-battle-prototype.json](../../../docs/HLD-isometric-battle-prototype.json) — the
   agreed architecture (components, data model, interfaces, risks) the implementation must fit into, not
   contradict.
3. Any ADRs referenced by the plan, or any ADR under `docs/adr/` relevant to the feature's area. Respect
   their decisions; do not silently deviate from them.
4. `docs/features/<slug>/spec-<slug>.md`, if present, for the original business intent behind the plan.
5. The current codebase: what already exists under `src/` (stores, composables, components) that this
   feature extends, reuses, or must not break. Use Glob/Grep to locate relevant existing files — do not
   assume structure that isn't there yet.

Whenever the plan requires using a library or API (PixiJS, Pinia, GSAP, the `pathfinding` package,
SQLite/WASM, Tailwind, etc.) and you need current usage details beyond what you already know, use the
Context7 MCP (`resolve-library-id` then `query-docs`) rather than relying on memory, per the global
Context7 instructions. Do this proactively whenever the plan's instructions touch API surface you are
not fully certain of — don't guess at signatures.

## Step 4 — Implement

Follow `plan-<slug>.md`'s implementation sequencing (its "Implementation sequencing" section) step by
step:

- Respect the state/logic/presentation separation from [CLAUDE.md](../../../CLAUDE.md): Pinia stores
  hold data only, composables hold pure combat/game logic and commit results through store actions,
  Pixi rendering and the Vue/Tailwind HUD only read state and react to it.
- Write all code, comments, identifiers, and commit messages in **English**, per this repository's
  language policy.
- This is a time-boxed spike (per CLAUDE.md): prioritize a working, readable implementation of what the
  plan describes over polish, extensibility, or speculative abstraction. Don't add anything the plan
  didn't ask for.
- There is no automated test runner in this project. Validate your work manually against the plan's
  "Manual verification plan" section by running `npm run dev` and exercising the feature yourself as you
  go, not only at the very end.
- If, while implementing, you find the plan is ambiguous, infeasible, or contradicted by the current
  codebase or an ADR, **stop and raise it with the human** before improvising a different design. Small,
  obviously-correct clarifications (e.g. an exact variable name) don't need to block you — material
  design decisions do.
- Commit incrementally on the feature branch as logical units of work complete, with clear, English
  commit messages. Do not push, and do not open a PR, until Step 6.

## Step 5 — Write the dev report

Once the implementation (and manual verification) is complete:

1. Ensure `docs/features/<slug>/reports/` exists (create it if it doesn't).
2. Determine the report version: look for existing `dev-<slug>-*-*.md` files in that folder; the new
   version number is one higher than the highest found, or `1` if none exist.
3. Create `docs/features/<slug>/reports/dev-<slug>-<version>-<YYYY-MM-DD>.md` (today's date), following
   [templates/dev-report-template.md](templates/dev-report-template.md) exactly (same section structure
   and order). Fill every section — do not leave placeholders; write "Not applicable" explicitly where a
   section genuinely doesn't apply.
4. The report's last chapter **must** summarize token usage and approximate cost for this task (model(s)
   used, approximate input/output token counts, estimated cost). Give your best faithful estimate from
   what you can observe about the session; state explicitly if a figure is an approximation.
5. Write the whole document in English, per this repository's language policy.

## Step 6 — Summarize and ask before publishing

Report back to the human in a short summary:

- The slug, the branch used, and the path to the dev report.
- What was implemented, deviations from the plan (if any) and why, and the state of manual verification.
- Any open issues or follow-ups that should be tracked.

Then **explicitly ask**: "Can I commit/push this branch and open a PR to `main`?" Do not push or open a
PR until the human confirms. Once they confirm:

1. Commit any remaining uncommitted work on the feature branch (never on `main`).
2. Push the feature branch.
3. Open a PR from `feature/<slug>` to `main`, describing what was implemented and linking the plan and
   the dev report.

## Step 7 — Move the Trello card to "Done"

After the human confirms and the PR is opened, move the feature's Trello card to **"Done"**, following
the same [How to call Trello](#how-to-call-trello) pattern as Step 2, targeting the "Done" list instead.
If this fails for any reason, tell the human and offer to move the card manually — do not block on it.
