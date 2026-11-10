# Technical Plan: Initial Screen

**Slug:** `02-initial-screen`
**Spec:** [spec-02-initial-screen.md](spec-02-initial-screen.md)
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

This plan implements the application's first screen: a Pinia-backed top-level scene switch in
`App.vue`, and a self-contained `InicialMenuScene.vue` that locally toggles between a main menu
(pulsing title + Start/Options/Exit, only Start enabled) and a blank "Configure Match" placeholder menu
(reached via Start, exited via Back). Everything renders as plain Vue + Tailwind DOM — no Pixi canvas is
created for this screen. New pixel-art assets (background, modal, button states) are produced by a
separate `graphic-designer` subagent and consumed as static image files; a local Press Start 2P
`.woff2` font file is added for all UI text except the title.

## 2. Source documents reviewed

| Document | Key takeaways for this plan |
| --- | --- |
| `spec-02-initial-screen.md` | Defines scope precisely: main menu (Start/Options/Exit, only Start enabled), Configure Match placeholder with Back, Pinia-driven top-level scene switch, local state for the inner menu switch, GSAP pulse (scale ~1.0→1.05-1.08, sine.inOut, infinite yoyo, ~2-3s cycle), Press Start 2P font, 1280x720 fixed desktop target, DOM-only rendering, pixel-art assets via `graphic-designer` delegation. |
| Trello card | No additional context beyond the spec — description and checklist mirror the spec's Definition of Done. |
| `docs/GDD-isometric-battle-prototype.md` | No mention of an initial/main menu screen anywhere in the GDD — this feature introduces new ground, not something constrained by existing gameplay design documentation. |
| `docs/HLD-isometric-battle-prototype.json` | "App Shell (Vue + Vite)" component is documented as responsible for "mounts the configuration screen and the battle screen" and depends on "Battle Store" and "HUD" — this plan's scene store is the concrete mechanism for that documented responsibility, not a deviation from it. |
| Existing ADRs | ADR-0001 (PixiJS), ADR-0002 (pathfinding), ADR-0003 (GSAP for all animation), ADR-0004 (SQLite/WASM) — none require a new decision for this feature; ADR-0003 confirms GSAP must be used for the title pulse instead of CSS transitions. No new ADR needed. |
| Current codebase | `src/App.vue` is an empty shell (`<div />`). `src/main.ts` already registers Pinia (`createPinia()`). `src/stores/`, `src/scenes/`, `src/components/` are empty (only `.gitkeep`). `package.json` confirms `gsap`, `pinia`, `tailwindcss` are already installed; no font or new asset folders exist yet. |

## 3. Architecture fit

This feature is the first concrete use of the "App Shell mounts the configuration screen and the battle
screen" responsibility from the HLD. It introduces the project's first Pinia store (`useSceneStore`),
acting purely as top-level routing state — not battle state — which is a natural, additive extension of
the HLD's "Pinia is the single source of truth" pattern rather than a deviation: the Battle Store
(future) and this Scene Store are separate, independent stores with distinct responsibilities (dynamic
battle data vs. which top-level screen is active).

No composable or combat logic is introduced. No Pixi Renderer, Animation Layer composable, or Static
Data Layer involvement is needed — per the spec, this screen is DOM-only, and GSAP is invoked directly
from a component rather than through a shared composable, since there is a single, specific animation
with no reuse case yet. This is a deliberate, scoped simplification for this feature, not a precedent for
skipping composables on future animated UI — if a second pulsing/animated element appears later, revisit
whether a shared `usePulseAnimation`-style composable is warranted.

## 4. Affected surface

### New files/modules

| Path (relative to `src/`) | Purpose |
| --- | --- |
| `stores/scene.ts` | `useSceneStore` — Pinia store holding which top-level scene is active (`'initial-menu' \| 'battle'`) and the action to change it. |
| `scenes/InicialMenuScene.vue` | Top-level scene component mounted by `App.vue` when the active scene is `'initial-menu'`. Owns local state (`'main' \| 'configure-match'`) selecting which inner menu panel to render. |
| `components/initial-menu/PixelButton.vue` | Reusable pixel-art button: props `label: string`, `disabled?: boolean`; emits `click`. Swaps normal/disabled sprite and applies `cursor: not-allowed` when disabled; suppresses the click handler when disabled. Used for Start, Options, Exit, and Back. |
| `components/initial-menu/PulsingTitle.vue` | Renders the "Turn Based Prototype" title (text or graphic) and drives its GSAP pulse animation directly in `onMounted`, killing the tween in `onUnmounted`. |
| `components/initial-menu/MainMenuPanel.vue` | Renders the pixel-art modal panel containing `PulsingTitle` and the three stacked `PixelButton`s (Start enabled; Options/Exit disabled). Emits a `start` event consumed by `InicialMenuScene.vue`. |
| `components/initial-menu/ConfigureMatchPanel.vue` | Renders the "Configure Match" placeholder modal: title, "Coming soon" text, and a `PixelButton` labeled "Back". Emits a `back` event consumed by `InicialMenuScene.vue`. |
| `assets/ui/` | New asset folder (parallel to `assets/spritesheets/` and `assets/tilemaps/`) holding the pixel-art background, modal panel, and button sprites (normal + disabled states) produced by the `graphic-designer` subagent. |
| `assets/ui/fonts/press-start-2p.woff2` | Local Press Start 2P font file (no external/CDN font loading at runtime). |

### Modified files/modules

| Path (relative to `src/`) | Change |
| --- | --- |
| `App.vue` | Replace the empty `<div />` shell with a `<component :is>` driven by `useSceneStore().activeScene`, currently resolving only to `InicialMenuScene` (the `'battle'` branch is a documented placeholder for a future feature, not implemented here). |
| `style.css` | Add the `@font-face` declaration for the local Press Start 2P file and apply it as the default font for this screen's text (e.g. via a Tailwind utility class or a scoped base style — exact mechanism left to the implementer, consistent with existing Tailwind usage). |

### Out of scope for this plan

- `stores/battle.ts` and anything related to the actual battle scene — the `'battle'` value in
  `activeScene`'s type is reserved but not wired to any component yet.
- Any composable under `src/composables/` — this feature needs none.
- `src/utils/` — no pure combat/utility function is introduced by this feature.

## 5. State design (Pinia)

```
useSceneStore
  activeScene: 'initial-menu' | 'battle'   // which top-level scene App.vue renders; defaults to 'initial-menu'
```

Action: `setActiveScene(scene: 'initial-menu' | 'battle')` — replaces `activeScene`. No other mutation
logic belongs in this store (per CLAUDE.md's state/logic separation, though here the "logic" is trivial
enough that it lives directly as a store action rather than needing a dedicated composable).

The inner main-menu/configure-match switch inside `InicialMenuScene.vue` is **not** Pinia state — it is a
local `ref<'main' | 'configure-match'>('main')`, since it has no meaning or consumer outside that
component in this feature, per the spec's explicit architecture decision.

## 6. Logic design (composables)

Not applicable. This feature contains no pure combat/calculation logic to isolate into a composable —
the only "logic" is trivial UI state transitions (which scene/menu is active), handled directly in the
Pinia store action and in local component state/event handlers.

## 7. Rendering / HUD impact

This entire feature is HUD-only (Vue + Tailwind DOM); there is no Pixi Renderer involvement.

- `App.vue` reads `useSceneStore().activeScene` and renders `InicialMenuScene` accordingly.
- `MainMenuPanel.vue` reads nothing from Pinia battle state (none exists yet); it calls
  `useSceneStore().setActiveScene(...)` indirectly through `InicialMenuScene.vue`'s `start` handler —
  actually, note: Start does **not** change `activeScene` (the battle scene doesn't exist yet); it only
  changes `InicialMenuScene.vue`'s local inner-menu state to `'configure-match'`. `activeScene` stays
  `'initial-menu'` throughout this feature's flow.
- `PulsingTitle.vue` is the only component touching the Animation Layer (GSAP), per ADR-0003: a single
  `gsap.to(...)` tween with `yoyo: true, repeat: -1, ease: 'sine.inOut'`, targeting a scale transform,
  started in `onMounted` and killed in `onUnmounted` to avoid leaking tweens if the component is ever
  unmounted (e.g. a future transition away from the initial menu entirely).
- Visual states for `PixelButton.vue`: normal, hover (if the art supports it), and disabled — sourced
  from the `assets/ui/` sprites. Exact file names/slicing are decided by the `graphic-designer` subagent
  per its own skill, not fixed here.

## 8. Data layer impact

Not applicable. No SQLite/WASM data is read or written by this feature.

## 9. External dependencies

None. `gsap`, `pinia`, and `tailwindcss` are already installed (confirmed in `package.json`); the Press
Start 2P font is added as a static local asset file, not an npm package. No new Context7 lookup was
needed: this feature uses only basic GSAP tweening (`gsap.to` with `yoyo`/`repeat`/`ease`) and basic
Pinia (`defineStore` with state + one action), both already established patterns for this project.

## 10. Implementation sequencing

1. Create `useSceneStore` (`stores/scene.ts`) and wire `App.vue` to render based on `activeScene`,
   initially just mounting an empty `InicialMenuScene.vue` placeholder. Verify the app still boots with
   no console errors.
2. Build `PixelButton.vue` with plain Tailwind styling (no final art yet — solid-color placeholder) and
   the three states (normal/disabled/click-suppressed). Verify disabled styling and no-op clicks in
   isolation (e.g. temporarily rendered directly in `InicialMenuScene.vue`).
3. Build `PulsingTitle.vue` with the GSAP tween, verify the pulse visually in the browser before adding
   any other scaffolding.
4. Build `MainMenuPanel.vue` (title + 3 buttons) and `ConfigureMatchPanel.vue` (title + text + Back
   button), wire both into `InicialMenuScene.vue`'s local `ref` switch. Verify the full Start → Back
   cycle works with placeholder styling.
5. Delegate pixel-art asset creation (background, modal panel, button states) to a new subagent instance
   running the `graphic-designer` skill (Opus model), per CLAUDE.md. Once delivered, swap the
   placeholder styling in `PixelButton.vue`, `MainMenuPanel.vue`, and `ConfigureMatchPanel.vue` for the
   real assets under `assets/ui/`.
6. Add the Press Start 2P `.woff2` file under `assets/ui/fonts/`, declare `@font-face` in `style.css`,
   and apply it to all text in this screen except the title (if the title ends up being a graphic asset
   rather than live text).
7. Full manual verification pass per section 12 below.

## 11. Technical risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Pixel-art asset delivery (step 5) lags behind the component work, leaving placeholders in place longer than expected | Medium/Low | Steps 1-4 are fully verifiable with placeholder styling, so the Vue/Pinia implementation isn't blocked on asset delivery; swapping in real assets (step 5-6) is an isolated, low-risk follow-up change. |
| GSAP tween not cleaned up on unmount could leak if `InicialMenuScene.vue` is ever torn down (e.g. future transition into the battle scene) | Low/Low | `PulsingTitle.vue` explicitly kills its tween in `onUnmounted`, established now so the pattern is already correct when the battle-scene transition is built later. |
| First Pinia store in the project sets an implicit precedent for later stores (e.g. Battle Store) | Low/Medium | Keep `useSceneStore` deliberately minimal (one field, one action) so it doesn't over-constrain the shape of future, more complex stores. |

No connection to the HLD's tracked risks (pathfinding complexity, runtime performance, SQLite/WASM
integration) — this feature touches none of those areas.

## 12. Manual verification plan

1. Run `npm run dev` and open the app at 1280x720 (or larger). Confirm the initial screen renders
   (main menu), not a blank page — validates step 1.
2. Hover and click Options and Exit: confirm visually disabled styling, "not-allowed" cursor, and no
   action on click — validates step 2.
3. Observe the title for at least one full cycle (~2-3s): confirm it grows and shrinks smoothly, looping
   indefinitely — validates step 3.
4. Click Start: confirm the main menu is replaced by the "Configure Match" panel (title, "Coming soon"
   text, Back button). Click Back: confirm the main menu reappears with the title still pulsing and
   Options/Exit still disabled. Repeat 2-3 times to confirm stability — validates step 4.
5. After asset delivery: confirm the background spans the full screen width, the modal panel and buttons
   show the intended pixel-art style (including a visually distinct disabled button state), and all text
   (except possibly the title) renders in Press Start 2P — validates steps 5-6.
6. Check the browser console throughout for errors or warnings (missing assets, Vue reactivity warnings,
   GSAP target warnings).

## 13. Open technical questions

None. No item here requires a dedicated ADR — the only new architectural element (`useSceneStore`) is a
direct, uncontroversial implementation of an already-documented HLD responsibility.

## 14. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | Shape of the top-level scene store? | `useSceneStore` with `activeScene: 'initial-menu' \| 'battle'` (string union) and a `setActiveScene` action. |
| 2 | File organization for scenes/components? | `scenes/InicialMenuScene.vue` orchestrates; reusable pieces (button, panels, title) live under `components/initial-menu/`. |
| 3 | Should the GSAP pulse be a reusable composable? | No — implemented directly in `PulsingTitle.vue`'s `onMounted`/`onUnmounted`, since it's a single specific animation with no current reuse case. |
| 4 | Where does Press Start 2P load from, and where do new UI assets live? | Local `.woff2` file (no external/CDN font loading), under a new `assets/ui/` folder (parallel to `assets/spritesheets/` and `assets/tilemaps/`). |
| 5 | Should the pixel-art button be one reusable component or several? | One reusable `PixelButton.vue` (label/disabled/click), used for Start, Options, Exit, and Back. |

## 15. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this planning session.
