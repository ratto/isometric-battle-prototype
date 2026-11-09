# Design Report: <Asset/Deliverable Title>

**Slug:** `<slug>`
**Report version:** <n>
**Author:** <human name / "Human + Claude (Opus)">
**Date:** <YYYY-MM-DD>

## 1. Summary

One or two paragraphs describing, in plain language, what was designed in this task and why, for someone
who has not read the original request.

## 2. Request and scope

| Item                      | Value                                                    |
| -------------------------- | --------------------------------------------------------- |
| Original request           | <human's request, verbatim or closely paraphrased>       |
| Deliverable type           | Sprite / Spritesheet / Tilemap / Tileset / Other (<which>) |
| In scope for this report   | <what was actually produced>                              |
| Explicitly out of scope    | <anything related but deliberately not covered here>     |

## 3. Source documents reviewed

What was read before designing, and anything relevant found in each.

| Document                                     | Key takeaways for this deliverable                     |
| ---------------------------------------------- | --------------------------------------------------------- |
| `docs/PRD-isometric-battle-prototype.json`     | <relevant context, e.g. "visual quality not a priority"> |
| `docs/GDD-isometric-battle-prototype.md`       | <relevant class/terrain/ability details represented>    |
| `docs/HLD-isometric-battle-prototype.json`     | <existing size/style conventions found, or "None found"> |
| Relevant ADRs                                  | <relevant rendering constraints, or "None found">       |
| Existing `src/assets/spritesheets` / `tilemaps`| <conventions reused, or "No prior assets existed">       |

## 4. Stylistic research

Describe how Final Fantasy Tactics (GBA) and Breath of Fire III (SNES) informed this deliverable's
**style** (silhouette readability, palette size/contrast, level of detail, isometric angle/perspective
conventions) — as inspiration only. Explicitly confirm that no artwork from either game was traced,
copied, or closely reproduced.

| Reference                        | What was taken as inspiration                        | What was deliberately NOT copied          |
| ---------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Final Fantasy Tactics (GBA)        | <e.g. isometric tile angle, unit proportions>         | <specific designs, color schemes, assets>  |
| Breath of Fire III (SNES)          | <e.g. palette depth, shading approach>                | <specific designs, color schemes, assets>  |

## 5. Design decisions

| Decision                         | Value                                     | Rationale                                   |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Pixel dimensions                   | `<width>x<height>px` (multiple of 4)         | <why this size>                               |
| Isometric projection details       | <tile diamond ratio, facing/direction conventions> | <why>                                   |
| Color palette                      | <number of colors, notes>                    | <why>                                         |
| Grid layout (if spritesheet/tilemap) | <rows x cols, cell size, frame/tile order> | <why>                                          |
| Other                               | <anything else fixed for this deliverable>  | <why>                                          |

Note any assumption made because the request or existing docs were silent on a point (e.g. which
animation frames, which terrain variants), and why that assumption was reasonable.

## 6. Deliverables produced

| File path                                      | Description                               |
| ------------------------------------------------ | -------------------------------------------- |
| `src/assets/spritesheets/<file>.svg`              | <what it contains>                         |
| `src/assets/tilemaps/<file>.svg`                  | <what it contains>                         |

Confirm for each file: SVG format, transparent background, pixel-grid-aligned shapes, English
identifiers/comments.

## 7. How to consume these assets

Brief notes for whoever wires this into the game later (e.g. `game-dev-js`): grid cell size, frame
order/naming inside the sheet, any expected `viewBox`/scaling behavior. State "Not applicable" if the
asset is a single, non-gridded sprite.

## 8. Known issues / follow-ups

Anything left incomplete, any visual inconsistency noticed but out of scope for this task, or anything
that should become its own request (e.g. additional animation frames, additional terrain variants).
State "None" if nothing is open.

## 9. Token usage and estimated cost

| Metric                   | Value              |
| --------------------------- | --------------------- |
| Model(s) used               | <ai model(s) used> |
| Input tokens (approx.)      | <input tokens>       |
| Output tokens (approx.)     | <output tokens>      |
| Estimated cost (USD)        | <cost in US$>        |
| Estimated cost (BRL)        | <cost in R$>          |

- Note which figures are exact vs. approximated, and how the approximation was derived.
- Pricing basis used for the estimate (e.g. published per-model rate card and date checked), if any.
