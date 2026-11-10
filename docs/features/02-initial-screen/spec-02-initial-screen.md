# Spec: Initial Screen

**Slug:** `02-initial-screen`
**Status:** Draft
**Author:** Human + Claude
**Date:** 2026-11-10

## 1. Summary

This feature adds the game's initial screen, the first thing the player sees when the application
starts. It shows a slowly pulsing title ("Turn Based Prototype") above a vertically stacked main menu
with three options — Start, Options, Exit — of which only Start is active for now. Selecting Start opens
a second, currently blank "Configure Match" menu (a placeholder for future match-setup options) with a
Back button that returns to the main menu. The goal is purely structural: prove the screen-switching
shell (driven by Pinia) and establish the pixel-art/monospace visual language the rest of the prototype's
UI will reuse, so the player can exercise the full "launch app → Start → Back" loop.

## 2. Daemon System grounding

Not applicable. This feature is a UI/navigation shell with no combat, attribute, or Sistema Daemon
mechanic involved.

## 3. Goal and value

- **Goal:** validate that the application can present a navigable pre-match menu shell — initial
  screen → match-configuration menu → back — as the entry point players will use to eventually launch a
  battle. It also establishes the first screen-switching mechanism (Pinia-driven) that the future battle
  scene will plug into.
- **Value:** gives the prototype a real entry point so future USs (match setup, battle scene) have
  somewhere to be wired in, and lets the human start validating visual direction (pixel art + monospace
  UI) early.

## 4. Scope

### In scope

- A Pinia store holding which top-level "scene" is active (initial menu vs. future game scene), read by
  `App.vue` to pick which component to render via `<component :is>`.
- `InicialMenuScene.vue`: owns, via local component state, which of its two internal menus is shown
  (main menu vs. "Configure Match" placeholder). No Pinia store needed for this inner switch.
- Main menu: pulsing title graphic/text "Turn Based Prototype", and three vertically stacked buttons in
  order Start, Options, Exit.
- Start is enabled and switches to the "Configure Match" placeholder menu.
- Options and Exit are visually disabled (dimmed) and show a "not-allowed" cursor; clicking them does
  nothing. They will be wired up in future USs.
- "Configure Match" placeholder menu: title "Configure Match", text "Coming soon", and a "Back" button
  that returns to the main menu.
- Pixel-art visual assets: full-width background image, menu modal panel, and button sprites (all
  states: normal/disabled), produced via the `graphic-designer` skill per CLAUDE.md's graphic asset
  delegation rule.
- Press Start 2P (Google Fonts) applied to all on-screen text except the title, which may itself be a
  graphic asset.
- Title pulse animation via GSAP: scale oscillating roughly 1.0 → 1.05–1.08, `sine.inOut` easing,
  infinite yoyo/repeat, full cycle ~2–3 seconds.
- Fixed target resolution/layout: 1280x720 desktop. No responsive/mobile support in this US.
- Rendering via Vue + Tailwind (DOM) only — no Pixi canvas for this screen.

### Out of scope

- Any functionality behind Options or Exit (settings, quitting the app).
- Actual match-configuration options inside "Configure Match" (difficulty, team setup, map choice,
  etc.) — only the placeholder shell and Back navigation.
- The battle scene itself and any transition into it.
- Sound/music.
- Responsive layout or support for resolutions other than 1280x720.
- Save/restore of menu state across page reloads.

## 5. Functional requirements

1. On application launch, the player sees the initial screen with the main menu (title + Start/Options/
   Exit), not a blank page or the future game scene.
2. The title text/graphic "Turn Based Prototype" continuously pulses (grows and shrinks slowly, looping)
   for as long as the main menu is visible.
3. The three main menu buttons are stacked vertically, in this exact top-to-bottom order: Start, Options,
   Exit.
4. Options and Exit render in a visually disabled state and show a "not-allowed" cursor on hover; clicking
   either produces no state change and no console error.
5. Clicking Start replaces the main menu with the "Configure Match" placeholder menu (title "Configure
   Match", text "Coming soon", and a "Back" button). The pulsing title and the Start/Options/Exit buttons
   are no longer visible while this second menu is shown.
6. Clicking "Back" on the "Configure Match" menu returns to the main menu, exactly as it was (title
   pulsing, Start/Options/Exit visible, Options/Exit still disabled).
7. The player can repeat the Start → Back cycle indefinitely without the app entering a broken state.
8. The top-level scene-switching mechanism is implemented as a Pinia store read by `App.vue`, so a future
   feature can add a second scene (the battle scene) alongside the initial screen without restructuring
   this store.

## 6. Non-functional requirements

- Rendering: plain Vue 3 components styled with Tailwind CSS (DOM), consistent with CLAUDE.md's decision
  to keep Pixi reserved for the battle canvas. No Pixi `Application` is created for this feature.
- Animation: the title pulse must use GSAP, per CLAUDE.md's rule that all animation (canvas and DOM)
  goes through GSAP rather than CSS transitions.
- State: the active top-level scene lives in a Pinia store (data only); the inner main-menu/placeholder-
  menu switch inside `InicialMenuScene.vue` is local component state, not Pinia, since it has no value
  outside that component in this US.
- Fonts: Press Start 2P (Google Fonts) loaded for all UI text in this screen; the title may be a graphic
  asset instead of live text.
- Assets: all pixel art (background, modal panel, button states) must be produced by delegating to a new
  subagent instance running the `graphic-designer` skill (Opus model), per CLAUDE.md — not drawn directly
  by the implementing agent.
- Layout: fixed 1280x720 desktop target; no responsive breakpoints required.

## 7. Edge cases

| Edge case | Expected behavior |
| --- | --- |
| Rapid repeated clicks on Start/Back | Each click is processed as a discrete, idempotent transition; no duplicate menus stack up or flicker. |
| Clicking Options or Exit | No-op: no visual state change beyond the existing disabled styling, no error thrown. |
| Window/viewport smaller or larger than 1280x720 | Not handled in this US (no responsive requirement); visual overflow/cropping is acceptable. |
| Reloading the page while on the "Configure Match" menu | App restarts at the main menu (no persisted state) — this is expected, not a bug. |

## 8. Risks and mitigations

| Risk | Likelihood/Impact | Mitigation |
| --- | --- | --- |
| Pixel-art asset creation (background, modal, buttons incl. disabled states) takes longer than the screen's logic, delaying the US | Medium/Medium | Asset work is delegated to a dedicated `graphic-designer` subagent per CLAUDE.md, decoupled from the Vue/Pinia implementation work, and can proceed in parallel. |
| This is the first Pinia store in the project, setting a precedent for how future scene-switching (battle scene) will work | Low/Medium | Keep the store minimal (just "which top-level scene is active") so it's easy to extend when the battle scene is added, without over-designing now. |
| "Not-allowed" cursor + disabled styling for Options/Exit may be inconsistent with how future USs re-enable them | Low/Low | Keep the disabled-state styling isolated to the button component so re-enabling is a simple prop/state change later. |

## 9. Dependencies

- Depends on `01-project-initial-setup` (base Vite/Vue/TypeScript/Tailwind/Pinia setup), already done.
- Blocks any future US that needs an entry point into the battle scene (that US will extend the
  top-level scene store introduced here).
- Depends on the `graphic-designer` skill/subagent for the pixel-art assets.

## 10. Definition of Done

- [ ] Running `npm run dev` opens directly on the initial screen (main menu), not a blank `App.vue`.
- [ ] The title "Turn Based Prototype" is visible and visibly pulses (grows/shrinks) continuously via GSAP.
- [ ] Three buttons are shown, stacked vertically, top-to-bottom: Start, Options, Exit.
- [ ] Options and Exit are visually disabled, show a "not-allowed" cursor on hover, and do nothing when clicked.
- [ ] Clicking Start hides the main menu and shows the "Configure Match" placeholder menu (title +
      "Coming soon" text + Back button).
- [ ] Clicking Back on the "Configure Match" menu returns to the main menu in its original state.
- [ ] The Start → Back cycle can be repeated multiple times without visual glitches or console errors.
- [ ] Background, menu modal, and button sprites (all states) are pixel art, produced via the
      `graphic-designer` subagent, with transparent backgrounds where applicable per that skill's
      conventions.
- [ ] All on-screen text uses the Press Start 2P font, except possibly the title if implemented as a
      graphic.
- [ ] A Pinia store exists and controls which top-level scene `App.vue` renders.
- [ ] All code, identifiers, comments, and file names are in English, per CLAUDE.md's language policy.

## 11. Manual verification plan

1. Run `npm run dev` and open the app in a browser at 1280x720 (or a window at least that size).
2. Observe the initial screen: confirm the title is present and pulsing, and the three buttons appear in
   the order Start, Options, Exit.
3. Hover over Options and Exit: confirm the cursor shows "not-allowed" and the buttons look visually
   disabled (e.g. dimmed) compared to Start.
4. Click Options, then Exit: confirm nothing happens (no navigation, no console errors).
5. Click Start: confirm the main menu disappears and the "Configure Match" placeholder menu appears, with
   its title, "Coming soon" text, and a "Back" button.
6. Click Back: confirm the main menu reappears exactly as before (title pulsing again, Start/Options/Exit
   visible, Options/Exit still disabled).
7. Repeat steps 5–6 two or three times to confirm the cycle is stable.
8. Visually confirm the background image spans the full width of the screen and that the menu modal and
   buttons use pixel-art styling consistent with the project's intended aesthetic.

## 12. Open questions

None.

## 13. Interview notes

| # | Question | Answer |
| --- | --- | --- |
| 1 | What should the slug be? | ID 02, English short description → `02-initial-screen`. |
| 2 | Should the "Configure Match" placeholder menu have any structure beyond a Back button? | Yes — a title and a "coming soon"-style placeholder text. |
| 3 | How should screen navigation be architected given no routing/stores exist yet? | `App.vue` renders either the initial menu scene or the future game scene via a Pinia-controlled `<component :is>`; `InicialMenuScene.vue` itself manages its two internal menus (main / configure-match) with local component state, not Pinia. |
| 4 | What title/placeholder text for the second menu? | "Configure Match" / "Coming soon" (in English). |
| 5 | What GSAP timing for the title pulse? | Scale ~1.0 → ~1.05–1.08, `sine.inOut` easing, infinite yoyo/repeat, ~2–3s per cycle. |
| 6 | Which monospace font? | Press Start 2P (Google Fonts). |
| 7 | How should disabled buttons (Options, Exit) look/behave? | Visually dimmed, "not-allowed" cursor on hover, clicks do nothing. |
| 8 | Should this screen render via Pixi or DOM? | Vue + Tailwind (DOM) only; Pixi stays reserved for the battle scene. |
| 9 | Target resolution/layout? | Fixed 1280x720 desktop; no responsive requirement in this US. |

## 14. Token usage and estimated cost

| Metric | Value |
| --- | --- |
| Model | Claude Sonnet 5 |
| Input tokens | Not tracked by tooling available in this session |
| Output tokens | Not tracked by tooling available in this session |
| Estimated cost (USD) | Not tracked by tooling available in this session |
| Estimated cost (BRL) | Not tracked by tooling available in this session |

- This environment does not expose per-session token/cost accounting to the agent; figures were not
  tracked during this spec-writing session.
