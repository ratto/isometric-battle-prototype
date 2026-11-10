# Dev Report: Initial Screen

**Slug:** `02-initial-screen`
**Plan:** [plan-02-initial-screen.md](../plan-02-initial-screen.md)
**Branch:** `feature/02-initial-screen`
**Report version:** 1
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

Implemented the application's initial screen exactly as scoped in the plan: a Pinia-backed top-level
scene store wired into `App.vue`, and a self-contained `InicialMenuScene.vue` that locally switches
between a main menu (pulsing title + Start/Options/Exit, only Start enabled) and a "Configure Match"
placeholder reached via Start and exited via Back. The screen is plain Vue + Tailwind DOM — no Pixi
canvas. Final pixel-art assets (full-width background, reusable modal panel, normal/hover/disabled
button sprites) were produced by a delegated `graphic-designer` subagent and are now wired into the
components, together with a locally-hosted Press Start 2P font.

## 2. Source documents reviewed

| Document | Key takeaways for this implementation |
| --- | --- |
| `plan-02-initial-screen.md` | Primary source of truth: new `useSceneStore`, `InicialMenuScene.vue` with local inner-menu state, reusable `PixelButton`/`PulsingTitle` components, DOM-only rendering, GSAP pulse directly in `PulsingTitle.vue`, assets under a new `assets/ui/` folder, local Press Start 2P font file, 6-step implementation sequencing. |
| `docs/HLD-isometric-battle-prototype.json` | "App Shell" component's documented responsibility to mount "the configuration screen and the battle screen" is exactly what `App.vue`'s new `<component :is>` implements — no deviation needed. |
| Relevant ADRs | ADR-0003 (GSAP for all animation) — followed: the title pulse uses `gsap.to` with `yoyo`/`repeat: -1`/`sine.inOut`, not CSS transitions. ADR-0001/0002/0004 not relevant to this feature. |
| `spec-02-initial-screen.md` | Confirmed functional requirements (button order, disabled states, placeholder content, Press Start 2P, 1280x720 target) match what was built. |
| Existing codebase | `src/main.ts` already registered Pinia; `src/App.vue` was an empty `<div />` shell; `src/stores/`, `src/scenes/`, `src/components/` were empty (`.gitkeep` only) — all removed as those folders gained real content. |

## 3. Branch and Trello

| Item | Value |
| --- | --- |
| Starting branch | `feature/02-initial-screen` (already created and current branch at task start, per explicit human instruction) |
| Branch used for this task | `feature/02-initial-screen` (reused, per explicit human instruction — not re-confirmed via the skill's step-3 question since the human had just explicitly asked to work on it) |
| Trello card | https://trello.com/c/8eYtBtxe |
| Trello card moved to "Ongoing" | Yes |

## 4. What was implemented

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `stores/scene.ts` | `useSceneStore` — Pinia setup store holding `activeScene: 'initial-menu' \| 'battle'` and the `setActiveScene` action. |
| `scenes/InicialMenuScene.vue` | Top-level scene mounted by `App.vue`; owns local `activeMenu: 'main' \| 'configure-match'` state and renders the full-width background. |
| `components/initial-menu/PixelButton.vue` | Reusable pixel-art button (`label`, `disabled` props; `click` emit); swaps normal/hover/disabled sprites and applies `cursor: not-allowed` when disabled. |
| `components/initial-menu/PulsingTitle.vue` | Renders the title text and drives its GSAP pulse tween in `onMounted`, killing it in `onUnmounted`. |
| `components/initial-menu/MainMenuPanel.vue` | Modal panel with `PulsingTitle` and the three stacked buttons (Start enabled; Options/Exit disabled). |
| `components/initial-menu/ConfigureMatchPanel.vue` | Placeholder modal: "Configure Match" title, "Coming soon" text, Back button. |
| `assets/ui/initial-screen-background.svg` | Full-width (1280x720) opaque pixel-art background. |
| `assets/ui/menu-panel.svg` | Reusable transparent modal panel background (main menu and Configure Match). |
| `assets/ui/pixel-button-normal.svg`, `pixel-button-hover.svg`, `pixel-button-disabled.svg` | Button sprite states, identical geometry so swapping never shifts layout. |
| `assets/ui/fonts/press-start-2p.woff2` | Local Press Start 2P font file (latin subset, SIL OFL, from Google Fonts), no external runtime font loading. |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `App.vue` | Replaced the empty `<div />` shell with a `<component :is>` driven by `useSceneStore().activeScene`, currently resolving only `'initial-menu'` → `InicialMenuScene` (`'battle'` has no component yet, as planned). |
| `style.css` | Added the `@font-face` declaration for the local Press Start 2P file and applied it as the default font. |
| `.env.example` | Documented the `TRELLO_BACKLOG_LIST_ID` variable discovered while creating the feature's Trello card in an earlier session (unrelated to the code implementation, carried over from the spec/plan commit). |

### Commits made on this branch

| Commit (short hash) | Message |
| --- | --- |
| `d87c812` | Add spec and technical plan for the initial screen |
| `1655c56` | Implement initial screen navigation shell with placeholder styling |
| `0203f55` | Apply Press Start 2P font to the initial screen |
| `c2d6df4` | Apply pixel-art assets to the initial screen |

## 5. Deviations from the plan

- **Button component also implements a hover sprite** (`pixel-button-hover.svg`), consumed via a local
  `isHovered` ref and `@mouseenter`/`@mouseleave` handlers in `PixelButton.vue`. The plan only required
  normal/disabled states; the `graphic-designer` subagent produced a hover variant as an explicitly
  optional extra, and wiring it in was a small, plan-consistent addition (same component, same props)
  rather than a design change — noted here for transparency, not a scope violation.
- **`background-image` values are built with `JSON.stringify(...)` in a computed property**, not a bare
  template-literal `url(${...})` as originally sketched informally during implementation. This was not a
  plan deviation (the plan didn't specify this level of detail) but is worth recording: Vite inlines
  small SVGs as unencoded (non-base64) data URIs, and the SVGs' own text content (code comments) contain
  literal `(`/`)` characters (e.g. "(used by Options and Exit)"), which silently breaks an **unquoted**
  CSS `url(...)` value. This made every pixel-art layer invisible with no console error until traced
  through the browser's computed styles. `JSON.stringify` wraps the URL in a properly escaped quoted
  string, which is robust regardless of what characters end up in a future asset's data URI.
- **"Configure Match" title uses `text-lg` with `whitespace-nowrap`** instead of the initially-tried
  `text-xl` (which wrapped onto two lines inside the panel at the chosen panel width). Purely a sizing
  fix found during manual verification, not a functional deviation.

## 6. External dependencies / Context7 lookups

| Library | What was looked up | What was confirmed |
| --- | --- | --- |
| GSAP | `gsap.to` tween options for an infinite yoyo pulse (`repeat`, `yoyo`, `ease`) and `.kill()` for cleanup | `repeat: -1` loops indefinitely, `yoyo: true` requires non-zero `repeat` to alternate direction, `ease: 'sine.inOut'` is a valid built-in ease string, and `.kill()` on the returned `Tween` stops it — used exactly this way in `PulsingTitle.vue`. |
| Pinia | Current (`v4`) recommended `defineStore` syntax | Setup-store syntax (`defineStore(id, () => {...})` with `ref`/`function`, returning all state) is the confirmed current pattern — used for `useSceneStore`. |

## 7. Manual verification performed

| # | Step taken | Expected result | Actual result |
| - | --- | --- | --- |
| 1 | Ran `npm run dev`, opened the app in Chrome at 1280x720 | Initial screen renders directly (main menu), not a blank page | Matched — main menu with title and three buttons rendered immediately. |
| 2 | Hovered and clicked Options and Exit | Visually disabled, "not-allowed" cursor, no action on click | Matched — `getComputedStyle(...).cursor` confirmed `not-allowed`; no state change or console activity on click. |
| 3 | Observed the title through a full pulse cycle | Smooth, continuous grow/shrink loop (~2.5s cycle) | Matched — confirmed visually; GSAP tween configured for a 1.25s half-cycle (2.5s full yoyo cycle), within the spec's 2–3s target. |
| 4 | Clicked Start, then Back, repeated the cycle | Main menu ↔ Configure Match panel transitions cleanly, state resets correctly each time | Matched on the first pass with placeholder styling, and again after the pixel-art asset swap; repeated twice with no visual glitches. |
| 5 | After asset integration: visually inspected background, panel, and all three button states at 1280x720 | Full-width pixel-art background, consistent modal panel, visually distinct button states, Press Start 2P font on all text | Matched, after fixing the `url(...)` quoting bug described in Section 5 — confirmed via `getComputedStyle`/DOM inspection that `background-image` was being silently dropped, then confirmed fixed. |
| 6 | Checked the browser console throughout (`read_console_messages`, no pattern filter restricting errors) | No errors or warnings beyond standard Vite HMR connection logs | Matched — only `[vite] connecting...`/`[vite] connected.` debug logs present at every checkpoint. |

## 8. Known issues / follow-ups

- None blocking. The `'battle'` branch of `useSceneStore().activeScene` has no component yet, exactly as
  planned — it is reserved for a future feature, not a gap in this one.
- The modal panel's fixed size (`28rem` × `21rem`) is not nine-sliced; if a future US needs a
  significantly different panel content size, the panel background may need revisiting (noted as an
  assumption in the design report, not a defect here).

## 9. Pull request

| Item | Value |
| --- | --- |
| Human approval to push/PR | Pending |
| PR URL | Not opened yet |
| Trello card moved to "Done" | No (pending PR, per the skill's sequencing — happens after human confirmation and PR creation) |

## 10. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model(s) used | Claude Sonnet 5 (main implementation session); Claude Opus (delegated `graphic-designer` subagent for pixel-art assets) |
| Input tokens (approx.) | Not precisely tracked by tooling available in this session; the subagent reported ~86.4k tokens for its own run (16 tool uses) |
| Output tokens (approx.) | Not precisely tracked by tooling available in this session |
| Estimated cost (USD) | Not computed — no per-session cost figure is exposed to the agent in this environment |
| Estimated cost (BRL) | Not computed, for the same reason |

- The only concrete token figure available is the `graphic-designer` subagent's self-reported usage
  (~86,398 tokens, 16 tool calls, ~6.5 minutes) from its completion notification. All other figures in
  this table are approximations that could not be derived from available tooling and are stated as such
  rather than guessed.
