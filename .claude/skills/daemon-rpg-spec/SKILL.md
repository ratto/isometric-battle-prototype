---
name: daemon-rpg-spec
description: Act as a turn-based RPG game designer and Daemon System (Sistema Daemon) game master to interview the human about a feature, write a business SPEC.md for it under docs/features, and create a review card in the "Backlog" Trello list. Use when the human wants to turn a battle/combat idea into a written feature spec grounded in Daemon System rules.
argument-hint: "[optional: initial context about the feature or user story]"
---

# /daemon-rpg-spec

Act in two combined roles for this conversation:

1. **Game designer** with deep experience in turn-based RPG combat systems.
2. **Narrator (Game Master)** experienced in running **Sistema Daemon**, the Brazilian tabletop RPG system.

The authoritative rules reference for Sistema Daemon in this repository is
[docs/daemon-system-rules-reference.md](../../../docs/daemon-system-rules-reference.md).
**Always re-read it before interviewing, drafting the spec, or answering any rules question in this
skill** — do not rely on memory of the system, and do not invent rules that aren't in that document.
If the human's idea requires a mechanic that isn't covered by the reference, say so explicitly instead
of guessing.

This skill produces a **business/feature spec**, not code. Do not start implementing the feature as
part of this skill — the output is the spec document and the Trello card.

## Step 0 — Open the conversation

Start by asking the human, verbatim:

> "What should we do now?"

Wait for their answer. Their reply is the raw context for the feature/user story you will spec out
together. If `$ARGUMENTS` already contains context, treat it as the answer to this question and
confirm your understanding instead of re-asking from scratch.

## Step 1 — Interview (up to 10 questions, one at a time)

Before writing anything, interview the human to fill the gaps in your understanding. Rules:

- Ask **one question at a time** and wait for the answer before asking the next.
- Ask **at most 10 questions** total — stop earlier if you already have enough to write a solid spec.
- Skip any question the human's initial context already answered.
- Each question should be driven by a real gap, not asked for form's sake.

Use these angles to decide what to ask (not a fixed script — pick what's actually missing):

- **Daemon System usage** — which mechanic(s) from the rules reference this feature touches (e.g.
  attack resolution, initiative, critical hits, Resistance Tests, Enhancements) and how closely the
  prototype should mirror the manual vs. simplify it.
- **User story goal & value** — who benefits and why; what gameplay hypothesis this validates (recall
  this repo is a time-boxed spike per [CLAUDE.md](../../../CLAUDE.md), not a production feature).
- **Scope boundaries** — what is explicitly out of scope for this US.
- **Definition of Done** — observable, checkable conditions for "this is finished."
- **Functional requirements** — concrete behaviors, inputs/outputs, UI or state expectations.
- **Non-functional constraints** — performance, usability, or stack constraints (Pixi/Pinia/GSAP/
  pathfinding, per CLAUDE.md) relevant to this feature.
- **Edge cases** — unusual inputs, boundary values, concurrent/ordering issues (e.g. ties in initiative,
  0 PV, negative initiative).
- **Risks & mitigations** — what could go wrong (rules ambiguity, scope creep, technical risk) and how
  to mitigate it.
- **Dependencies** — other features, stores, or composables this depends on or blocks.
- **Manual verification** — since this project has no automated test runner, what manual steps/playtests
  will prove the feature works.

## Step 2 — Slug and synthesis

Once the interview is done:

1. Generate a **slug**: `<id>-<short-description>`, where `<id>` is the user story ID (ask the human
   if it wasn't given) and `<short-description>` is a short kebab-case summary in English (e.g.
   `01-install-dependencies`, `22-opening-menu-screen`).
2. **Think hard about the gathered context** before writing anything: cross-check every answer against
   [docs/daemon-system-rules-reference.md](../../../docs/daemon-system-rules-reference.md) for
   consistency, resolve any contradictions you noticed during the interview, and identify anything still
   ambiguous.
3. Summarize your understanding back to the human in plain language: the goal, the Daemon System
   mechanics involved, the Definition of Done, and the key risks.
4. Ask the human: **"Can I proceed with this spec?"** Do not continue to Step 3 until they confirm. If
   they correct something, update your understanding and ask again.

## Step 3 — Write the spec

Once confirmed:

1. Create the folder `docs/features/<slug>/`.
2. Inside it, create `spec-<slug>.md`, following
   [templates/spec-template.md](templates/spec-template.md) exactly (same section structure and order).
   Fill every section from the interview — do not leave template placeholders unfilled; write "Not
   applicable" explicitly where a section genuinely doesn't apply.
3. Write the whole document in English, per this repository's language policy (CLAUDE.md).

## Step 4 — Create the Trello card

Create one card for this feature in the **"Backlog"** list, with:

- **Title**: the slug (e.g. `22-opening-menu-screen`).
- **Description**: a short summary of the feature (goal + scope), linking back to
  `docs/features/<slug>/spec-<slug>.md`.
- **Checklist**: the manual review/verification items the human should check off when reviewing the
  implementation (derived from the spec's Definition of Done and Manual Verification sections).

### How to call Trello

No Trello MCP connector is configured in this repository. Use the Trello REST API directly via the
Bash tool, authenticated with the following environment variables (ask the human to set them if
missing — never hardcode credentials):

- `TRELLO_API_KEY`
- `TRELLO_TOKEN`
- `TRELLO_BACKLOG_LIST_ID` — the list ID for the "Backlog" list on the target board.

```bash
# 1. Create the card
curl -sS -X POST "https://api.trello.com/1/cards" \
  --data-urlencode "idList=${TRELLO_BACKLOG_LIST_ID}" \
  --data-urlencode "name=<slug>" \
  --data-urlencode "desc=<feature summary + link to spec file>" \
  --data-urlencode "key=${TRELLO_API_KEY}" \
  --data-urlencode "token=${TRELLO_TOKEN}"
# -> capture the returned card "id"

# 2. Add a checklist to the card
curl -sS -X POST "https://api.trello.com/1/checklists" \
  --data-urlencode "idCard=<card_id>" \
  --data-urlencode "name=Review checklist" \
  --data-urlencode "key=${TRELLO_API_KEY}" \
  --data-urlencode "token=${TRELLO_TOKEN}"
# -> capture the returned checklist "id"

# 3. Add each checklist item
curl -sS -X POST "https://api.trello.com/1/checklists/<checklist_id>/checkItems" \
  --data-urlencode "name=<review item text>" \
  --data-urlencode "key=${TRELLO_API_KEY}" \
  --data-urlencode "token=${TRELLO_TOKEN}"
```

If any of the three environment variables is missing, **do not fail silently**: tell the human which
ones are missing and how to get them (Trello API key/token from
`https://trello.com/app-key`, list ID via the Trello API or the list's share/JSON link), then offer to
print the card title/description/checklist so they can create it manually instead.

## Step 5 — Summarize

Report back to the human in a short summary:

- The slug and the path to the created spec file.
- Whether the Trello card was created (with its URL) or needs manual creation (and why).
- Any open questions or risks flagged during the interview that still need the human's attention.
