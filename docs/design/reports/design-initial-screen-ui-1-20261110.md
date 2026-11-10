# Design Report: Initial Screen UI Chrome (Background, Menu Panel, Button States)

**Slug:** `initial-screen-ui`
**Report version:** 1
**Author:** Human + Claude (Opus)
**Date:** 2026-11-10

## 1. Summary

This task produced the final pixel-art visual assets for the game's initial (main menu) screen, feature
`02-initial-screen`. The screen's Vue/Tailwind implementation already existed and worked with solid-colour
placeholder styling; what was missing was the art itself. Three kinds of asset were delivered: a full-screen
opaque background scene for the 1280x720 target resolution, a reusable ornate modal panel that sits behind the
title and buttons (shared by both the main menu and the "Configure Match" placeholder menu), and a set of
button sprites for the reusable `PixelButton.vue` component covering the normal, hover, and disabled states.

All five assets are SVG drawn on an explicit logical pixel grid that is then upscaled 4x by the `viewBox`
(e.g. the background is authored at 320x180 logical pixels and rendered at 1280x720), with
`shape-rendering="crispEdges"` so edges stay hard and the result reads as genuine pixel art rather than smooth
vector graphics. The palette is deliberately small (23 colours in total across every asset) and shared across
all five files, so the background, panel, and buttons read as one visual system. Per the PRD, visual quality is
explicitly not a priority for this spike, so the work was kept legible and consistent rather than elaborate.

**Scope deviation (deliberate and explicit):** this deliverable is **UI chrome for a flat, non-isometric 2D
menu screen**, not the isometric sprites/spritesheets/tilemaps that the `graphic-designer` skill describes as
its default scope. It was delegated here under CLAUDE.md's broader rule that "a sprite, spritesheet, tile,
tilemap, **or any other graphic asset** needed for the prototype" goes to this skill. Consequently two of the
skill's conventions were intentionally set aside — the output folder (`src/assets/ui/` instead of
`src/assets/spritesheets/` or `src/assets/tilemaps/`) and the isometric-projection requirement (no diamond tile
footprint, no character facing directions, no shared isometric horizon), neither of which has any meaning for a
menu background, a modal window frame, or a rectangular button. Every other convention of the skill was
followed: SVG output, transparency where compositing requires it, pixel-grid-aligned flat-colour shapes, a small
deliberate palette, dimensions as multiples of 4, kebab-case English file names, English in-file identifiers and
comments, FFT/BoF III inspiration without copying, and this report.

## 2. Request and scope

| Item                      | Value                                                    |
| -------------------------- | --------------------------------------------------------- |
| Original request           | Produce the final pixel-art visual assets for feature `02-initial-screen` to replace the existing solid-colour placeholder styling: (1) a full-width background image at the 1280x720 target resolution, (2) a menu modal panel background usable by both the main menu and the "Configure Match" menu, and (3) button sprites for `PixelButton.vue` covering at minimum a normal/enabled state and a disabled state (hover optional). Output to a new `src/assets/ui/` folder; skip the isometric-projection convention; write no Vue/TypeScript application code. |
| Deliverable type           | Other (**UI chrome** — screen background, modal panel frame, and button state sprites; not a sprite, spritesheet, tilemap, or tileset) |
| In scope for this report   | Five SVG assets under `src/assets/ui/`: one background scene, one modal panel, and three button-state sprites (normal, hover, disabled). |
| Explicitly out of scope    | Any application code — nothing under `src/components/`, `src/scenes/`, `src/stores/`, or elsewhere was created or edited, and no placeholder styling was swapped out (that wiring belongs to `game-dev-js`, plan step 5). Also out of scope: a title graphic (the title stays live DOM text driven by the GSAP pulse), the Press Start 2P `.woff2` font file (plan step 6, not an art asset), pressed/active and keyboard-focus button states, any battle-screen art, and audio. |

## 3. Source documents reviewed

| Document                                     | Key takeaways for this deliverable                     |
| ---------------------------------------------- | --------------------------------------------------------- |
| `docs/PRD-isometric-battle-prototype.json`     | Time-boxed spike to validate a FFT-like tactical combat hypothesis on a JS stack. Its `dependencies` section states visual quality is **explicitly not a priority** and that assets may be AI-generated or sourced from free packs — so this work was kept simple, flat, and legible with no over-investment. Also fixed the context: desktop-only (latest Chrome/Firefox/Edge), client-side static site, and an "Initial match configuration screen" as in-scope product surface. The 30 FPS floor applies to combat, not this static DOM screen, but reinforced keeping assets lightweight. |
| `docs/GDD-isometric-battle-prototype.md`       | Confirms the battle grid is "24x24 tiles, isometric projection" and defines classes, terrain (variable height, one impassable rock-formation type), and the configuration-screen flow. **No class, terrain, or combat content needs to be represented in this deliverable** — a menu background/panel/button carries no gameplay semantics — so the GDD informed only the general fantasy-tactics mood (a dusk battlefield vista with a stone courtyard) rather than any specific asset content. |
| `docs/HLD-isometric-battle-prototype.json`     | Searched for an existing tile size, sprite size, or isometric projection ratio: **none found** — consistent with CLAUDE.md's note that these are expected to be fixed in future user stories. The HLD's only directly relevant constraint is the rendering split (Pixi owns the battle canvas; the HUD/menus are Vue + Tailwind DOM), which confirms these assets are consumed as plain DOM images, not as Pixi textures. |
| Relevant ADRs                                  | `0001-pixijs-as-rendering-engine.md` — Pixi is reserved for the battle canvas, so no spritesheet packing or power-of-two texture constraint applies to these files; they load as ordinary DOM/CSS images. `0003-gsap-for-all-animation.md` — all animation goes through GSAP, which is why no animation was baked into the assets (notably, the background's brazier flames are deliberately static single frames and the title pulse is GSAP-driven DOM scaling, not art). `0002` (pathfinding) and `0004` (SQLite/WASM) have no bearing on UI chrome. |
| Existing `src/assets/spritesheets` / `tilemaps`| **No prior assets existed** — both folders contained only `.gitkeep`. There was therefore no established size, palette, or naming convention to reuse; the conventions recorded in section 5 are set by this deliverable and should be reused (or deliberately superseded) by later UI art. |
| `docs/features/02-initial-screen/spec-02-initial-screen.md` and `plan-02-initial-screen.md` | Fixed the exact asset list (background, modal panel, button states incl. disabled), the fixed 1280x720 non-responsive desktop layout, DOM-only rendering, Press Start 2P for all text except possibly the title, and the `src/assets/ui/` output folder. The plan also confirms `PixelButton.vue` takes `label` + `disabled` props and swaps the normal/disabled sprite, that hover art is optional ("hover (if the art supports it)"), and that one panel asset serves both menus. |

## 4. Stylistic research

Both references were used as *stylistic* inspiration only, drawn from general recollection of their UI
conventions and era-typical constraints. **No artwork from either game was traced, copied, sampled, or closely
reproduced**, and no reference image was opened or consulted while drawing: every shape and every colour value
in these five files was authored from scratch as original pixel art. The resemblance is intended to be a family
resemblance of era and genre — flat colours, hard edges, low colour counts, a gold-on-deep-blue menu idiom —
and nothing more specific than that.

| Reference                        | What was taken as inspiration                        | What was deliberately NOT copied          |
| ---------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Final Fantasy Tactics (GBA)        | The general *idiom* of a tactical-RPG menu window: an ornate but very low-colour-count frame (a narrow metallic band with a light top/left bevel and dark bottom/right bevel) around a deep, desaturated field dark enough to keep small light text readable; small discrete corner ornaments instead of continuous filigree; and buttons as narrow horizontal plates with a bevelled body. Also the broad mood of the background — a dusk/twilight sky over layered mountain silhouettes framing a stone courtyard. | Its actual window/border artwork and corner motifs, its specific frame geometry and thickness ratios, its exact palette values, its logo/title treatment, its cursor and menu-selection graphics, its fonts and letterforms, and anything resembling its characters, job sprites, maps, or named locations. |
| Breath of Fire III (SNES)          | The shading approach for small flat elements: a very shallow ramp per material (typically one base, one highlight, one shadow) rather than smooth gradients, letting one well-chosen mid-tone carry the shape; and a warm-accent-over-cool-field colour relationship for UI (warm gold/amber ornament against a cool blue-violet window) to make interactive chrome pop without extra colours. Its skies also informed using a handful of discrete horizontal bands to suggest a dusk gradient instead of a true gradient. | Its window frames, menu layouts, and dialogue-box art; its specific palettes and ramps; its character, monster, and town art; and any identifiable location, logo, or iconography. |

## 5. Design decisions

| Decision                         | Value                                     | Rationale                                   |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Pixel dimensions — background      | Authored `320x180` logical px, rendered `1280x720` (4x). Both pairs are multiples of 4. | 320x180 is exactly 1/4 of the plan's fixed 1280x720 target, so the scene fills the screen with no fractional scaling. A 4x factor keeps individual "pixels" 4 screen px wide — chunky enough to read unmistakably as pixel art at desktop viewing distance, while 320x180 still leaves room for a layered vista (sky, two mountain ranges, two hill layers, a terrace, two pillars). |
| Pixel dimensions — menu panel      | Authored `128x96` logical px, rendered `512x384` (4x). All multiples of 4. | Same 4x factor as the background, so panel "pixels" and background "pixels" are the same size on screen — essential for the composite to read as one coherent image. 512x384 at 1280x720 leaves generous margin around a centred modal holding a title plus three stacked buttons. The 4:3 ratio suits a vertical menu stack better than a wide panel. |
| Pixel dimensions — buttons         | Authored `64x16` logical px, rendered `256x64` (4x). All multiples of 4. | Again 4x, consistent with the other two assets. A 4:1 plate is wide enough for the longest label ("Options") in Press Start 2P without crowding, and three 64px-tall buttons plus gaps fit comfortably inside the 384px-tall panel. 64x16 keeps the frame at a 1-logical-px (4 screen px) weight, matching the panel's frame weight. |
| Isometric projection details        | **Not applicable — deliberately skipped.** No diamond tile footprint, no facing directions, no shared isometric horizon or light angle. | This is a flat 2D menu screen rendered as DOM, not grid content: a screen background, a modal window frame, and rectangular buttons have no tile footprint and no facing. The skill's isometric requirement was waived for this request by the invoker, and is recorded here as an explicit, intentional deviation (see section 1). The background scene *is* drawn with a consistent implied light source (the moon, upper right) and a consistent single horizon line, which is the spirit of the convention as far as it can apply. |
| Color palette                       | **23 colours total**, shared across all five files and grouped into five deliberate ramps. **Sky/night (9):** `#10132a`, `#1b1f3b`, `#262c52`, `#343b66`, `#4a4f8c`, `#6b5f96`, `#9a6f8e`, `#c88a6a`, `#e0a878`. **Moon/flame/light (5):** `#f0e8c8`, `#d4c8a0`, `#f4e0a0`, `#f0c060`, `#e08a3a`. **Terrain/stone (8):** `#2a2446`, `#6e6ea0`, `#1d1930`, `#22361f`, `#2c4a2a`, `#262633`, `#3c3c4e`, `#1a1a24` (plus pillar tones `#2e2e3c`, `#3e3e50`, `#1c1c26`, `#3a3a4a`, `#32323f` reusing the same stone family). **Gold accent (4):** `#e8d8a0`, `#c8a860`, `#a98a46`, `#7a5c28`. **UI blue + grey (7):** `#8fb0e0`, `#6f8fc4`, `#5878ab`, `#3f5e8c`, `#2c3e60`, `#22324f`, `#171c33`/`#1e2440`/`#39406b` field tones, and the disabled greys `#6a6a72`, `#565b6e`, `#3a3e4c`, `#22242e`. A single near-black `#0a0c18` outlines every UI element. | A small, reused palette is what makes separately authored assets read as one system, and it is characteristic of 16-bit-era sprite work. Each material gets a shallow three-step ramp (base/highlight/shadow) rather than a gradient. Crucially, the panel field (`#171c33`) and button bodies are dark and desaturated while the gold accents are warm and light: this gives high contrast for the light Press Start 2P text that will sit on top, and keeps the menu readable against the busiest part of the background. The disabled button swaps the whole warm/cool scheme for neutral grey so it reads as inert from its colour alone, without depending on CSS `opacity` (which would wash out the dark outline too). |
| Grid layout (if spritesheet/tilemap) | **Not applicable.** Each state is a separate single-image file, not a packed sheet. | These are DOM/CSS images loaded individually by `PixelButton.vue` and the panel components, not Pixi textures — there is no draw-call budget to justify atlasing, and separate files make the Vue-side swap a trivial `:src`/background-image change. Keeping the three button states as separate files with **identical geometry** (same `viewBox`, same chamfer, same bevel positions) also guarantees that swapping them never shifts the layout by a pixel. |
| Format and rendering                | SVG with an explicit integer logical grid in `viewBox`, flat-filled `<rect>`/`<polygon>` only, and `shape-rendering="crispEdges"` on every root element. All coordinates are integers. | `crispEdges` disables anti-aliasing, so the 4x upscale produces hard pixel blocks instead of soft vector edges — this is what keeps the output reading as pixel art. Flat fills with integer coordinates mean every shape lands on the logical grid. Diagonals (mountain ridges, chamfered corners) are rendered as hard aliased stair-steps by `crispEdges`, which is the desired pixel-art look. No gradients, no filters, no `opacity`, no blur, no embedded raster, no external references — the files are self-contained, tiny, and deterministic across browsers. |
| Transparency                        | Background: **opaque**, no alpha (it is the bottommost layer). Panel and all three buttons: **transparent** outside their chamfered shells; their interior fields are opaque. | Per the invoker's adaptation: the panel and buttons must composite cleanly over the background, so their chamfered corners must be genuinely transparent (not filled with a guessed background colour, which would show as wrong-coloured corner wedges). Their interiors are opaque so text stays readable over the busy scene. |
| Chamfered corners over square       | 2 logical px chamfer on buttons, 4 logical px on the panel. | A 45° corner cut is a cheap, era-appropriate way to make a rectangle read as a crafted window/plate rather than a plain CSS box — and it is the main reason the panel and buttons genuinely need alpha. The chamfer is scaled with the asset so both read as the same "bevel" visually. |
| Background composition              | Lower third is a dark, visually quiet stone terrace; a brazier pillar frames each side; the centre is kept uncluttered. | The modal panel sits centred, so the background was composed to *support* it: detail and contrast are pushed to the edges and the lower band, leaving the centre calm enough that the panel and its text never fight the scene. The two pillars frame the panel and give the composition a stable symmetry. |
| Hover state                         | **Included** (not required by the request). `pixel-button-hover.svg`. | It was nearly free: identical geometry with a brightened body and frame, so it is three colour swaps rather than new art. The plan explicitly anticipates it ("hover (if the art supports it)"), and it gives the only enabled button on the screen (Start, plus Back) real affordance feedback. Using it is optional — the screen is complete and correct with only the normal and disabled sprites. |
| Title stays live text               | No title graphic was produced. | The spec allows the title to be either live text or a graphic, and the plan's GSAP pulse scales a `PulsingTitle` element. Live Press Start 2P text scaled by GSAP stays crisp at any scale, whereas a raster-feel pixel-art title graphic would either blur or shimmer against the 4x grid while pulsing between 1.0 and 1.08. Keeping it as text is both better-looking and less work. |

### Assumptions made

The request and the existing docs were silent on several points. Each was decided rather than escalated, since
these are low-stakes spike assets:

1. **One shared 4x scale factor and a 320x180 authoring grid.** Nothing in the HLD, GDD, or ADRs fixes a pixel
   size or scale for any asset. 4x was chosen because it divides the plan's fixed 1280x720 target exactly.
   Reasonable because the screen is explicitly non-responsive at a fixed resolution, so no other factor would
   ever be needed — and because a single shared factor is what makes the three assets composite coherently.
2. **Background subject matter.** No document specifies what the initial screen should depict. A dusk
   battlefield vista with a stone courtyard was chosen as the safest fit: it signals "fantasy tactics" in
   keeping with the GDD, contains no characters or classes (so it cannot contradict unit art drawn later, and
   needs no rework when classes change), and its dark, low-contrast centre serves the menu panel. Reasonable
   because it is thematically neutral and composition-first.
3. **One panel asset reused for both menus, at one fixed size.** The invoker allowed reuse; a single
   non-nine-sliced 128x96 panel was produced rather than a nine-slice set. Reasonable because both menus in
   this feature hold a similar amount of content at a fixed resolution, so a stretchable frame would be
   unnecessary machinery. Noted as a follow-up in section 8 for when panels of differing sizes are needed.
4. **Button sizing and label handling.** The sprite leaves its centre field flat and carries no baked-in text,
   on the assumption that `PixelButton.vue` centres its `label` prop as DOM text over the sprite — which is what
   the plan's `label: string` prop implies. Reasonable because baking text into art would require one sprite
   per label and would break the single reusable component.
5. **No pressed/active or focus state.** Not requested, and the spec defines no click-feedback or
   keyboard-navigation behaviour (the PRD puts accessibility and full keyboard navigation out of scope). Noted
   as a follow-up.
6. **Disabled state uses colour, not opacity.** The spec says "visually dimmed". A dedicated desaturated grey
   sprite was produced instead of relying on a CSS `opacity` reduction, because CSS opacity would also fade the
   near-black outline and let the background bleed through, muddying the shape. The implementer can still layer
   opacity on top if more dimming is wanted.

## 6. Deliverables produced

| File path                                      | Description                               |
| ------------------------------------------------ | -------------------------------------------- |
| `src/assets/ui/initial-screen-background.svg`     | Full-screen background scene for the initial screen. Authored 320x180, rendered 1280x720. Opaque dusk vista: nine stepped sky bands from near-black to a warm horizon, 18 scattered star specks, a 16px stepped pixel moon with craters (upper right, the scene's implied light source), flat cloud streaks, two mountain ranges (far range with snow caps, nearer darker range), two hill layers, a two-course stone terrace with offset block seams across the bottom third, and a symmetrical brazier pillar at each side with a three-tone static flame. Composed so the centre stays visually quiet beneath the menu panel. |
| `src/assets/ui/menu-panel.svg`                    | Reusable modal window panel for **both** the main menu and the "Configure Match" menu. Authored 128x96, rendered 512x384. Transparent outside a 4px-chamfered shell; layered near-black outline, a gold frame band with a light top/left and dark bottom/right bevel, an inner dark separation line, a deep blue opaque field (`#171c33`), a thin inset accent line, four small gold corner gems, and a gold gem ornament straddling the frame at top and bottom centre. |
| `src/assets/ui/pixel-button-normal.svg`           | `PixelButton.vue` normal/enabled state (Start, Back). Authored 64x16, rendered 256x64. Transparent outside a 2px-chamfered shell; near-black outline, 1px gold frame, inner dark line, bevelled blue body (`#3f5e8c` with `#6f8fc4` highlight / `#22324f` shadow), and a small gold notch at each end. Centre field intentionally flat and uncluttered for the DOM text label. |
| `src/assets/ui/pixel-button-hover.svg`            | Optional hover/focus state. **Geometry identical** to the normal sprite — only the body, bevel, frame, and notch colours are brightened (`#5878ab` body, `#8fb0e0` highlight, `#f0e0a8` gold) — so swapping it in on hover cannot shift the layout. |
| `src/assets/ui/pixel-button-disabled.svg`         | `PixelButton.vue` disabled state (Options, Exit). **Geometry identical** to the normal sprite. The gold frame and notches become neutral grey (`#6a6a72`) and the blue body a dim slate (`#3a3e4c` with a flattened `#565b6e`/`#22242e` bevel), so the button reads as inert from its own colours without depending on CSS opacity. |

**Confirmed for each file:** single self-contained `.svg`; flat-filled `<rect>`/`<polygon>` shapes only on an
integer logical pixel grid with `shape-rendering="crispEdges"` (no gradients, filters, opacity, blur, embedded
raster, or external references); all widths/heights and all `viewBox` dimensions are multiples of 4; transparent
background on the panel and all three buttons (opaque by design on the background scene only, as it is the
bottommost layer); kebab-case English file names; and all in-file identifiers, `<title>` elements, and comments
written in English per the repository's language policy. All five files were verified to parse as well-formed
XML.

## 7. How to consume these assets

For whoever wires this in (`game-dev-js`, plan step 5). **No grid slicing, no atlas, no nine-slicing** — each
file is a single standalone image.

- **Scale is the one rule that matters.** Every asset is authored at a 4x factor and each file's `width`/`height`
  attributes already state its intended on-screen size: background 1280x720, panel 512x384, buttons 256x64.
  Render each at its natural size (or an integer multiple) so the pixel grids stay aligned with each other.
  Avoid non-integer scaling, which will blur or shimmer the hard edges. These are vector files, so `crispEdges`
  keeps them sharp at integer multiples without needing `image-rendering: pixelated`; adding that property is
  harmless but does nothing for SVG.
- **Background:** use as a CSS `background-image` (or an `<img>`) on the screen's root element at
  `background-size: 1280px 720px` / `cover`, centred. The SVG already carries
  `preserveAspectRatio="xMidYMid slice"`, so if the viewport differs from 1280x720 it crops from the centre
  rather than distorting — the spec accepts cropping/overflow at other sizes. The scene's centre is deliberately
  low-contrast, so the panel can be centred over it without a scrim; no extra overlay is needed.
- **Menu panel:** place as the background of the modal container in both `MainMenuPanel.vue` and
  `ConfigureMatchPanel.vue` at 512x384. Content should be inset by at least **16 logical px (64 screen px)** on
  every side to clear the frame, the inner accent line, and the corner gems — the usable interior field runs from
  logical 14,14 to 114,86. Note the top and bottom centre gem ornaments extend to the very edge of the artwork
  (and the top one is intentionally clipped by the `viewBox` by one logical px), so do not crop or `overflow:
  hidden` the panel's own bounds.
- **Buttons:** all three states share identical geometry, so `PixelButton.vue` can swap the image source on
  `:hover` / `disabled` with zero layout shift. Render at 256x64. The sprite carries **no text** — centre the
  `label` prop as DOM text in Press Start 2P on top of it. For the normal and hover states, a light off-white
  (`#e8e4d8`) label reads well on the `#3f5e8c`/`#5878ab` body; for the disabled state, a mid grey such as
  `#8a8a94` on the `#3a3e4c` body keeps it legible but clearly inert. Keep the label clear of the small gold end
  notches (roughly logical x 6-8 and 56-58, i.e. the outer ~32 screen px on each side).
- **Hover is optional.** Wiring only `pixel-button-normal.svg` and `pixel-button-disabled.svg` fully satisfies
  the spec; `pixel-button-hover.svg` is an extra.
- **Disabled styling:** the sprite handles the dimming. The spec's `cursor: not-allowed` is a CSS concern, not
  baked into the art. Layering additional CSS `opacity` on top is unnecessary and will soften the outline.
- **Title:** no title graphic exists by design — keep "Turn Based Prototype" as live Press Start 2P text and
  apply the GSAP pulse to it, as the plan already does.

## 8. Known issues / follow-ups

- **Panel is fixed-size, not nine-sliced.** `menu-panel.svg` is a single 128x96 frame. It serves both menus in
  this feature at one size, but a future screen needing a differently proportioned panel (the real match-setup
  UI, a battle HUD window, a victory/defeat dialog) will either stretch it — which would distort the corner
  gems and the frame's 1px weight — or need a nine-slice variant. Splitting the frame into corner/edge/centre
  pieces, or deriving a CSS `border-image` from it, should be its own request when that need appears.
- **No pressed/active or keyboard-focus button state.** Only normal, hover, and disabled exist. A click-feedback
  (pressed) state and a focus ring would each be a small colour-swap variant on the same geometry, but neither
  is specified by this feature and full keyboard navigation is out of scope per the PRD.
- **Brazier flames are static.** The background's two flames are single frames. ADR-0003 routes all animation
  through GSAP, so flicker would have to be either additional art frames cycled by GSAP or a GSAP-driven
  transform on a separate flame element. Deliberately not done: the PRD deprioritises visual polish, and the
  spec's only animation requirement for this screen is the title pulse.
- **Palette is set by this deliverable, not by a shared token file.** The 23 colours are repeated literally
  inside each SVG. That is fine at five files, but once battle sprites and tiles arrive, the project should
  consider extracting a documented shared palette (and the 4x scale convention) into a single reference so later
  assets stay consistent instead of drifting. Worth noting that this deliverable's palette was tuned for UI
  chrome against a dusk sky; isometric terrain tiles will likely need to extend it rather than reuse it directly.
- **Not visually verified in the running app.** Per the request's constraints, `npm run dev` was not run and no
  browser screenshot was taken, so the assets have been validated only as well-formed SVG and by their authored
  geometry — not by eye in situ. The composite (panel centred over the background, three buttons stacked inside
  the panel, label text over the sprites) should be checked during plan step 5, specifically for: text contrast
  over the panel field, whether the 16-logical-px content inset is enough for the longest label, and whether
  the disabled grey reads as clearly inert next to the enabled gold at actual size. Minor colour or inset
  tuning may be wanted after that first look.
- **1280x720 only.** No alternative-resolution or high-DPI variants were produced, matching the spec's fixed
  non-responsive target. Being vector SVG, the assets will scale cleanly to integer multiples (e.g. 2560x1440)
  if a larger target is ever adopted.

## 9. Token usage and estimated cost

| Metric                   | Value              |
| --------------------------- | --------------------- |
| Model(s) used               | Claude Opus 5 (single model; this session ran entirely as one `graphic-designer` subagent invocation, with no further delegation) |
| Input tokens (approx.)      | ~105,000 (cumulative across turns, including re-sent conversation context on each turn) |
| Output tokens (approx.)     | ~14,000              |
| Estimated cost (USD)        | ~US$ 2.60            |
| Estimated cost (BRL)        | ~R$ 14.00            |

- **All four figures are approximations, not measured values.** This environment exposes no per-session token or
  cost accounting to the agent, so nothing here was read from tooling.
- **How the approximation was derived.** Input: the session's large reads dominate — the full PRD JSON (~367
  lines), the full `02-initial-screen` spec (~192 lines), the skill body and the report template, plus targeted
  `grep` output from the plan, GDD, and HLD — totalling roughly 25-30k tokens of file content, re-sent as
  conversation context across ~8 turns, which is what produces a cumulative figure several times larger than the
  unique content read. Output: the five SVG files (~11k tokens of markup and comments combined) plus this report
  (~7k tokens), partly offset because some drafting happened in a single pass; ~14k is a mid-range estimate.
  Both figures should be read as order-of-magnitude correct, plausibly off by ±30%.
- **Pricing basis.** Estimated using published Claude Opus-tier API rates of roughly US$ 15 per million input
  tokens and US$ 75 per million output tokens, which gives ~US$ 1.58 input + ~US$ 1.05 output ≈ US$ 2.60. The
  BRL figure applies an assumed rate of ~R$ 5.40 per US$ 1.00. **Neither the rate card nor the exchange rate was
  verified during this session** (no pricing lookup was performed), so both are from recollection and may be out
  of date; treat the currency figures as indicative only. If the session actually ran under a subscription plan
  rather than metered API billing, the real marginal cost is zero and these figures represent equivalent API
  value instead.
