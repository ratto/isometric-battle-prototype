# Dev Report: Combat Scene — Texture Teardown Bug Fix

**Slug:** `05-combat-scene`
**Plan:** [plan-05-combat-scene.md](../plan-05-combat-scene.md)
**Branch:** `feature/05-combat-scene`
**Report version:** 2
**Author:** Human + Claude
**Date:** 2026-11-12

## 1. Summary

This task fixes a bug reported by the human after US 05 was moved out of "Done" back to "Ongoing":
clicking "Back" from the combat scene could leave the main menu's background not rendering, and
starting a new battle a second time could render no tiles at all. Both symptoms traced back to the same
root cause in `usePixiApp.ts`: the Pixi `Application`'s teardown call was destroying the tile textures
themselves (`texture: true, textureSource: true`), but those textures are loaded via `Assets.load` and
cached globally by URL for reuse across every `CombatScene` mount. Destroying them on every "Back"
corrupted that shared cache — confirmed directly in the browser console via Pixi's own warning
(`[Assets] A TextureSource managed by Assets was destroyed instead of unloaded!`) — leaving the next
"Start Battle" with dead texture references. The fix stops destroying texture/textureSource on
Application teardown; only display objects (`children: true`) are torn down, which is sufficient to
avoid leaking sprites/containers across repeated Start Battle -> Back cycles.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-05-combat-scene.md` | §9 ("External dependencies") had documented and "confirmed" the exact faulty destroy call (`texture: true, textureSource: true`) as the full-cleanup pattern — this was the incorrect assumption being corrected. Updated in place to document the real constraint (Assets-managed resources must not be destroyed directly). |
| `docs/HLD-isometric-battle-prototype.json` | No deviation needed — this is a bug fix within the existing "Pixi Renderer" component, not an architecture change. |
| Relevant ADRs | None newly relevant; ADR-0006 (composite stacked-column rendering) is unaffected by this fix. |
| `spec-05-combat-scene.md` | Confirms the spec's non-functional requirement of "no leaked canvases/listeners across repeated Start Battle -> Back cycles," which the original destroy call was over-aggressively trying (and failing) to satisfy. |
| Existing codebase | `src/composables/usePixiApp.ts` (the faulty teardown), `src/composables/useBattlefieldRenderer.ts` (confirms `Assets.load` is used with stable URL keys, i.e. the shared-cache contract the fix now respects), `src/composables/useBattlefieldCamera.ts` (reviewed, no related issue found — its listeners are correctly scoped and detached per instance). |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/05-combat-scene` (already checked out) |
| Branch used for this task | `feature/05-combat-scene` (reused — already the current branch, matches the slug) |
| Trello card | `05-combat-scene`, on the "Turn based prototype" board |
| Trello card moved to "Ongoing" | No — the human had already moved it to "Ongoing" themselves before invoking this task (confirmed via the Trello API: the card was already in the "Ongoing" list) |

## 4. What was implemented

### New files/modules

None.

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `composables/usePixiApp.ts` | Changed `app.value?.destroy({ removeView: true }, { children: true, texture: true, textureSource: true })` to `app.value?.destroy({ removeView: true }, { children: true })`. Added a comment explaining why `texture`/`textureSource` must stay `false` (they're `Assets`-cache-owned, shared across mounts, not owned by this one `Application` instance). |

Also modified outside `src/`: `docs/features/05-combat-scene/plan-05-combat-scene.md` §9, updating the
"Application teardown" bullet to reflect the corrected destroy call and the confirmed repro, instead of
leaving the plan documenting the buggy behavior as the agreed design.

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `3d6568b` | `Fix Pixi Application teardown destroying Assets-managed textures` |

## 5. Deviations from the plan

The plan's §9 "External dependencies" section had asserted the full `texture: true, textureSource: true`
destroy call as "confirmed" correct via Context7 lookup against PixiJS v8.22.0 docs. In practice this
call is technically valid PixiJS API usage, but incompatible with this codebase's own pattern of loading
textures through `Assets.load` with stable, reused URLs (`useBattlefieldRenderer.ts`) — `Assets` expects
to own and reuse those `TextureSource` objects across the app's lifetime, not have them destroyed by
whichever `Application` happens to tear down first. This is a correction to the plan's documented
assumption, not a new design decision, so it was applied directly and the plan was updated to match
reality rather than raised as an open question.

## 6. External dependencies / Context7 lookups

None performed for this task. The original plan had already done a Context7 lookup on `pixi.js` v8.22.0's
`Application.destroy()` signature (recorded in plan §9); this fix doesn't change the destroy call's
signature or introduce new API surface, only which destroy options are passed, based on a runtime console
warning rather than a documentation gap.

## 7. Manual verification performed

Performed via `npm run dev` (http://localhost:5175) using browser automation, both before and after the
fix.

| # | Step taken | Expected result | Actual result |
| - | --- | --- | --- |
| 1 | Before fix: Start -> Configure Match -> Start Battle -> Back, repeated 2-3 times, watching the console | No warnings; main menu background and combat tilemap render correctly every cycle | Combat tilemap and menu background both visually rendered correctly in this environment/GPU, but the console showed `PixiJS Warning: [Assets] A TextureSource managed by Assets was destroyed instead of unloaded!` and `[Cache] already has key: ...` on every cycle — confirming the resource-corruption bug even though this particular browser/GPU didn't visibly break on every run (consistent with the human's report being intermittent/GPU-dependent) |
| 2 | Applied the fix in `usePixiApp.ts` | — | — |
| 3 | After fix: reloaded the page, repeated Start -> Configure Match -> Start Battle -> Back 2 full cycles, watching the console | No `[Assets]`/`[Cache]` warnings; tilemap and background render correctly every cycle | Confirmed — zero warnings across both cycles, tilemap rendered fully both times, main menu background rendered correctly after "Back" both times |

## 8. Known issues / follow-ups

None. The fix directly addresses the console-confirmed root cause for both reported symptoms (missing
menu background after "Back", missing tiles on a second "Start Battle"), and repeated manual cycles after
the fix show no warnings and consistently correct rendering.

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No — pending human confirmation before opening a PR, per this skill's workflow |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 |
| Input tokens (approx.) | Not tracked by tooling available in this session |
| Output tokens (approx.) | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this task.
- No pricing basis was applied since no token counts are available to multiply against a rate card.
