# Sixth Route Design System

The single reference for the Sixth Route brand and website. Everything here comes from the Figma
file "Outstir-working" (only the frames chosen by the client) and the website brief PDF. Use this
document instead of reopening Figma. When something isn't covered here, extend this file first and
then build it.

> **Tagline:** Beyond the obvious.
> **Brand line:** Ideas. Design. Technology. On a bigger route.

---

## 1. Colour

Five colours. Nothing else is introduced. Tints are only these colours at reduced opacity.

| Token             | Hex       | Role                                                                  |
| ----------------- | --------- | --------------------------------------------------------------------- |
| `--sr-orange`     | `#FF8221` | Primary brand colour. The mark's circle, accents, CTAs, highlights.   |
| `--sr-maroon`     | `#420D0F` | The route stroke in the mark. Deep panels, text on light/orange.      |
| `--sr-cream`      | `#FFFCF4` | Light page background ("paper").                                      |
| `--sr-night`      | `#140101` | Dark page background, dark text.                                      |
| `--sr-white`      | `#FEFFFF` | Cards on cream, text on night.                                        |

> ⚠️ **Figma label mismatch.** In Figma the orange swatch is labelled `#403CD3` and the maroon
> swatch `#71FFE2`. Those are leftover placeholder labels (a blue and a mint). The real fill values,
> sampled from the swatches and the logo artwork, are **`#FF8221`** and **`#420D0F`**. Always use
> the sampled values.

### Approved tints (opacity only)

| Use                          | Value                         |
| ---------------------------- | ----------------------------- |
| Hairline on cream            | `rgba(66, 13, 15, 0.12)`      |
| Muted text on cream          | `rgba(20, 1, 1, 0.62)`        |
| Hairline on night            | `rgba(254, 255, 255, 0.10)`   |
| Muted text on night          | `rgba(254, 255, 255, 0.58)`   |
| Orange glow (halo, ambience) | `rgba(255, 130, 33, 0.35 → 0)` radial |
| Corner ember (dark poster)   | `rgba(255, 130, 33, 0.28 → 0)` radial in opposite corners |

### Pairings

- **Night + orange + white**: hero, process, CTA, footer (dark "poster" mood).
- **Cream + maroon + orange**: brand story, services, projects, FAQ (light editorial mood).
- **Orange + maroon**: process cards, the mark, orange highlight panels.
- Never put orange text on orange, or maroon text on night (contrast too low).

---

## 2. Typography

| Role         | Family          | Weight     | Notes                                                    |
| ------------ | --------------- | ---------- | -------------------------------------------------------- |
| Headings     | **Montserrat**  | 600–800    | Display sizes use letter-spacing `-0.04em`, line-height ~1.0 |
| Body         | **Urbanist**    | 400–600    | 16–20px, line-height 1.55                                |
| Eyebrow      | Montserrat      | 600        | Uppercase, 11–12px, letter-spacing `0.2em`, followed by a 24×2px orange dash |
| Tagline      | Montserrat      | 400        | Uppercase, letter-spacing `0.35em` ("BEYOND THE OBVIOUS.") |
| Wordmark     | Montserrat      | 800 + 300  | `SIXTH` heavy + `ROUTE` light, uppercase                  |

Google Fonts: `Montserrat:wght@300;400;500;600;700;800` and `Urbanist:wght@400;500;600;700`.

Type scale (fluid, clamp min → max): display `clamp(2.9rem, 7.2vw, 7.6rem)`, h2 `clamp(2.3rem, 4.8vw, 4.6rem)`,
h3 `clamp(1.25rem, 1.7vw, 1.6rem)`, lead `clamp(1.15rem, 1.5vw, 1.4rem)`, body `1.0625rem`, small `0.875rem`.
Phones use a smaller scale and a 12px floor (§10).

Highlight pattern from the board: the last line or phrase of a headline goes orange
("A full-stack creative agency **for what's next.**", "Ideas. Design. Technology. **On a bigger route.**").

---

## 3. Logo

### The mark

An orange circle (`#FF8221`) with a single maroon route stroke (`#420D0F`) that draws a "6". The
stroke is **clipped by the circle**: it runs off the top edge and leaves as a tail through the
lower-left edge. The stroke is calligraphic: thicker on the spine and the right of the bowl, thinner
across the bar.

- Master vector: `public/sixth-route-mark.svg` (viewBox `0 0 100 100`, r = 50).
- Geometry in code: `src/brand/logoData.ts`
  - `ROUTE_OUTLINE`: filled outline of the stroke.
  - `ROUTE_CENTERLINE`: centreline path (top end → tail), used for draw-on animation masks.
  - `ROUTE_POINTS` / `ROUTE_HALF_WIDTH`: sampled centreline + width, used for the 3D route.

**Construction (from the "Symmetry & Construction" frame):** base circle grid → route curve
construction → shape refinement → final mark. The guides are a circumscribed circle, 60° angle
references, and lockup proportions of mark height `1x`, wordmark width `3.6x`, clear space `0.5x`
on each side.

### Variants

| Variant         | Use                                                                            |
| --------------- | ------------------------------------------------------------------------------ |
| Flat            | Default everywhere.                                                            |
| Glow            | **Dark backgrounds only.** Soft orange halo `0 0 40px rgba(255,130,33,.55)`. Poster, hero, loader. |

### Lockups

| Lockup          | Background   | SIXTH          | ROUTE          |
| --------------- | ------------ | -------------- | -------------- |
| Horizontal dark | Night        | White, 800     | White, 300     |
| Horizontal light| Cream        | Maroon, 800    | Maroon, 300    |
| Poster / stacked| Night        | Orange, 700    | White, 300     |
| Board / light   | Cream        | Orange, 600    | Maroon, 400 (with space) |
| Co-brand        | Night        | Lockup `×` lockup, thin cross in muted white |

### Don'ts

Don't recolour the mark, outline it, rotate it, unclip the stroke, add effects other than the glow,
put the glow on light backgrounds, or set the wordmark in any other typeface.

---

## 4. Graphic language

- **The route line.** The brand's signature device: one continuous line that "takes a different
  route". Use it as an SVG path that draws on, connects things, or moves along a curve. Five
  ordinary routes in muted hairlines + one orange route = "the sixth route".
- **Orange glow / embers.** Dark compositions get a soft orange halo behind the hero object and
  ember glows in opposite corners (top-right + bottom-left), as on the poster.
- **Flowing surfaces.** Glossy orange, silk-like 3D folds lit from within on night (the
  "Ideas. Design. Technology." visual). Implemented as a shader in `SilkRibbon`.
- **Brand pattern.** A grid of square tiles, each holding a quarter circle, half circle or diagonal
  split in orange / maroon / night / cream. Implemented in `BrandPattern`.
- **Iconography.** Simple geometric icons in orange + white on night: dot grid, asterisk spark,
  arrow ↗, stacked diamonds (layers), overlapping circles, offset squares, plus, radial dashes.
  Strokes ~2px, round caps. Implemented in `Icon`.
- **Accent dash.** A 24×2px orange dash under eyebrows and after short statements.

## 5. UI components

- **Primary button:** pill, cream/white fill, night text, ends in a 44px orange circle holding a
  `→` arrow ("Let's Talk" on the phone mockup; 36px in the nav). On hover the circle expands to
  fill the pill **behind** the label and arrow (the circle is the button's `::before`), so text never
  disappears. Orange variant: night circle, label turns cream on hover.
- **Secondary button:** pill, 1px hairline border, text + `↗`.
- **Radius:** swatches and cards 14px. Large media cards 22px. Pills fully rounded.
- **Cards on cream:** white fill, hairline border, no heavy shadows.
- **Section header:** eyebrow + dash, then heading (left) and an intro paragraph aligned to the
  right column on desktop.

## 6. Layout

- Max content width 1320px, gutters `clamp(20px, 4vw, 56px)`.
- Three tiers: phone ≤ 600px, tablet 601–1024px, desktop ≥ 1025px (§10). Sections stack to one
  column on compact screens; About and Proof stay two columns on tablets.
- Section padding `clamp(96px, 12vw, 180px)` vertical (`72px` on phones).
- Dark and light sections alternate for rhythm (night hero → cream story → cream services →
  cream projects → night process → cream FAQ → night CTA + footer).

## 7. Motion

| Token          | Value                              | Use                              |
| -------------- | ---------------------------------- | -------------------------------- |
| `--ease-out`   | `cubic-bezier(0.16, 1, 0.3, 1)`    | Reveals, entrances               |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)`   | Transforms, morphs, FLIP moves   |
| Fast / base / slow | 240ms / 600ms / 1200ms         |                                  |

Signature animations (desktop; on phones and tablets several take a different form, see §10):

1. **Opening (loader) — ribbons, no construction lines.** Each ribbon is anchored to a screen edge
   and unrolls from it. An orange ribbon unrolls from the **left edge** and threads the 6 tail-first
   (tail → bar → loop → spine → off the top); once the 6 is drawn its tail lets go of the edge and
   slides in. A wider ribbon unrolls from the **bottom edge**, runs one full lap exactly on the rim
   (so its outline is the logo's own circle, r = 50) and then coils inward to fill the disc, while
   the 6 darkens to maroon. A circular trim tucks the ribbon ends into the circle (as the logo
   clips its stroke), the exact mark crossfades in and glows, the wordmark rises, and the lockup
   FLIPs to the top-left nav slot as the night curtain dissolves. Edges are computed from the
   viewport, so this works on any screen. Geometry: `src/brand/ribbons.ts`.
2. **Hero 3D mark + silk ribbons (no orbit rings — the logo has none).** The mark is a real 3D
   sphere with the route as a raised maroon ribbon on its surface; it spins into alignment, tilts
   toward the cursor and turns with scroll. Behind it, two glossy silk ribbons (one wide and deep,
   one narrow and bright) flow across the full width inside the sphere's band, growing in from the
   left to continue the opening ribbon. They never sit behind the headline. `src/three/SilkRibbon.tsx`.
3. **Manifesto as linked pairs.** A pinned scene: the premise "What if we took a different route?"
   stays up while six "Let's make X → Y" pairs take the stage. For each, one orange route
   underlines the first word, U-turns round its end and underlines the second right-to-left as it
   rises in orange — joining the two. Both words matter: nothing is crossed out or dimmed. Finale: "something we create." is underlined out to the glowing mark, then
   the closers and "Welcome to Sixthroute."
4. **What We Do as a dial.** The brand circle cut into eight segments around the mark. The dial
   turns so the active discipline meets an orange pointer (and pops out, orange); the panel shows
   number, title, description and service chips; a legend lists all eight as tabs. It comes alive
   as soon as the dial is on screen — one full greeting spin, then it auto-advances every ~3.6s
   (a thin timer ring shows it). Pauses only while the pointer is over the dial or its legend;
   arrow keys work.
5. **Process:** four orange cards in a staircase. Each is `position: sticky` and locks into a row as
   you scroll (the marketinglab.framer.ai pattern).
6. **Footer:** columns fade up in a left-to-right stagger, and the giant `SIXTHROUTE` wordmark
   rises from behind the bottom edge with an orange-to-night gradient.
7. **Page changes:** every page paints night first (inline style in each HTML file) and
   cross-document view transitions fade between pages — never a white flash.

Always honour `prefers-reduced-motion`: skip the loader, show final states, and disable
scroll-scrubbing.

## 8. Voice & copy

Confident, curious, short sentences. Contrast pairs ("The ordinary innovative. The static dynamic.").

**Manifesto (Figma "Writing" frame):**
What if we took a different route? / Let's make ideas meaningful. / Experiences accessible. /
Possibilities limitless. / Let's make the unexpected official. / The ordinary innovative. /
The static dynamic. / And the future… something we create. / Different thinking. /
A better direction. / This is just the beginning. / Welcome to Sixthroute.

**Name story (site copy, written from the brand line; confirm with the client):** most problems
have five obvious routes: the safe one, the familiar one, the expected one, the copied one, the
trending one. Sixth Route exists for the one nobody has taken yet.

Testimonials: none are published until real ones exist (the brief rules out fabricated quotes).
Use the proof-based "The Work Speaks for Itself" block instead.

## 9. Pages

Multi-page site (Vite): `index.html` (landing), `contact/index.html` (`/contact/`), `404.html`
(served by static hosts for unknown routes). All pages share the nav, footer and these tokens.
In-page anchors from other pages go to `/#section`; arriving with a hash skips the opening animation.

### Contact Us (`/contact/`)

- Night hero band ("Have a vision? **Let's give it direction.**") with an orange route line that
  draws across it and drops into the form card, which overlaps the band's bottom edge.
- Left column: "What happens next" (3 steps), email, social pills. Right column: the brief form.
  On phones the steps become a strip above the form and a "Send brief" bar stays within reach (§10).
- **The form is a route:** three numbered nodes (01 About you · 02 Your project · 03 Send). A
  section's node fills orange and its stretch of line draws down once that section is valid.
- Fields: cream input fill, 12px radius, orange focus ring `0 0 0 4px rgba(255,130,33,.18)`.
  Choices are pill chips (night fill + orange dot when selected). Errors are maroon, specific and
  calm ("Enter an email address like name@company.com.").
- Submit: posts JSON to `VITE_FORM_ENDPOINT` when set; otherwise opens the visitor's email app
  with the brief pre-filled, and says so honestly in the success state.

### 404 + mascot "Route"

- Giant `4 [Route] 4` in cream Montserrat 800 on night, embers in opposite corners.
- **Route the mascot is the mark itself**: the loop of the 6 is its face (cream eyes with night
  pupils at `(51,63)` and `(69,63)`, small maroon "o" mouth), maroon feet, a soft shine. A dashed
  orange route curls into a question mark above its head.
- Behaviour: idle bob, blink every ~4.6s, pupils follow the cursor (on touch screens: the last tap,
  plus an idle glance). Hovering or focusing a way out
  (Back to Home, Start a Project, popular routes) makes it smile, blush and hop, and the question
  mark disappears.
- Copy: "This route doesn't go anywhere." + what happened and what to do, never an apology.

## 10. Mobile and touch

A phone is narrow, held in one hand and driven by a thumb, so the site doesn't squeeze the desktop
layouts onto it. Several modules have their own phone version: same idea, same brand parts, a
different form. (The working plan and its history: `docs/mobile-plan.md`.)

**Rules for anything new:**

- One idea per screen. Keep a section to about 1–1.5 phone screens.
- Vertical scroll drives the story. A sideways swipe may turn a control (the wheel); it never
  hides content off to the side.
- Pin only where the scroll animation is the content, and never for more than about 1.5 screens.
  Nothing pins on a phone on its side.
- Every hover effect has a touch equivalent. No effect may depend on a cursor.
- A "Start a Project" button is always within reach, but only one is on screen at a time.
- Only the brand parts in this document. Phones get no new colours, type or shapes.

### Tiers

| Tier | Query | What it gets |
| --- | --- | --- |
| Phone | `(max-width: 600px)` | The phone version of every module (table below). |
| Tablet | 601–1024px | The touch modules: project index (preview and list side by side), route timeline, wheel. About and Proof keep two columns, the Sixthroute difference three. |
| Desktop | `(min-width: 1025px)` | The layouts described in §7. |
| Touch | `(hover: none)` | Press states and 44px tap areas, at any width. |
| Phone on its side | `(orientation: landscape) and (max-height: 500px) and (hover: none)` | No pins: the hero sits side by side, the name-story map is shown fully drawn, the manifesto is the list. |

CSS can't read custom properties inside `@media`, so stylesheets repeat these exact values. In
code, use `src/lib/media.ts`: `PHONE`, `COMPACT` (≤ 1024px), `DESKTOP`, `TOUCH`, `LANDSCAPE_PHONE`
and the `useMedia()` hook. A module that changes *structure* renders a separate variant chosen with
`useMedia` (for example `Manifesto` → `ManifestoList` / `ManifestoScene`). A module that only
changes *layout* stays in CSS.

### Sizing

- **Viewport units.** Pinned and sticky heights use `svh`, the menu and sheets use `dvh`. Never use
  `vh`: it changes as the iOS address bar shows and hides, and pinned sections jump.
  `ScrollTrigger.config({ ignoreMobileResize: true })` is set in `src/lib/motion.ts`.
- **Type on phones** (overridden in `tokens.css`): display `clamp(2.4rem, 11.5vw, 3.2rem)`, h2
  `clamp(2rem, 9vw, 2.6rem)`, lead `1.05rem`, body `1rem`, eyebrow `0.75rem` with `0.16em`
  tracking. Nothing is smaller than 12px: tiny labels use `max(<size>, var(--fs-floor))`, and
  `--fs-floor` is `0.75rem` on phones and `0` elsewhere.
- **Tap targets.** At least 44px tall. Small inline links get an invisible hit area (`.tap`, or
  `.text-link`'s `::after`) so their visible size doesn't change. Footer links are full 44px rows.
- **Spacing.** Section padding is `72px` on phones.
- **Safe areas.** Anything fixed to the bottom edge adds `env(safe-area-inset-bottom)`.

### Touch behaviour

- Hover effects live inside `@media (hover: hover)`. Touch gets the same effect on `:active` while
  the finger is down: the button fill, the card "+", proof rows. iOS only applies `:active` once a
  touch listener exists, so `src/mount.tsx` registers an empty one.
- Effects that follow the cursor ignore touch pointers. For example, the hero tilt would otherwise
  freeze wherever the last tap landed.
- **Thumb CTA** (`ThumbCta`, phones, home page): a floating orange "Start a Project" pill at the
  bottom centre. It steps aside whenever another contact CTA is visible
  (`a.btn[href="/contact/"]`, the last project card or row), the closing CTA section or the footer
  is on screen, or anything marked `data-thumb-clear` is. That attribute is for controls that live
  at the bottom edge themselves, like the wheel. The menu sheet and dialogs sit above it.
- **Contact "Send brief" bar** (phones): the same pill, shown while the form is on screen and its own
  send button isn't. It hides while a text field is focused, so it never sits over the keyboard.

### Menu (compact screens)

Full-screen night sheet: numbered links `01`–`06` (Montserrat 700, line-height 1.15), the orange
CTA, then the email and social pills.

- The links start right under the bar. The contact row (email, socials) drops to the bottom of the
  screen when there's room (`margin-top: auto` on that row), and the sheet scrolls when there isn't.
- Never bottom-align the whole sheet with `justify-content: flex-end`. On real phones the browser's
  own bars take height that DevTools doesn't show, so the menu overflowed, and flex-end pushed the
  overflow up under the logo, out of reach. When it did fit, bottom-aligning left an empty band
  under the logo.
- While the menu is open the bar gets a solid night backing, so a scrolled menu passes cleanly
  under it.
- It locks the page (Lenis too), closes on Escape, and is hidden once the window is wider than
  1024px.
- Links restart Lenis *before* their anchor scroll starts. A restart from the effect cleanup would
  cancel that scroll.

### The modules on phones

| Module | On a phone | Tablet / on its side |
| --- | --- | --- |
| Opening | Same ribbon sequence. The mark draws at 40% of the screen width (30% of the shorter side on desktop), "Tap to skip", runs 12% faster. Plays once per tab on every device (`?intro` replays it, `?nointro` skips it). | Same as desktop. |
| Hero | A poster that fits exactly one screen: headline, sphere and "It creates one." as one centred stack (the sphere is a square up to 76vw that shrinks first on short screens), one CTA, "Explore our work" as a quiet text cue. The intro paragraph moves into the About fold. **Drag sideways to spin the sphere**; it coasts, then eases round so the 6 faces front. | On its side: headline on the left, sphere on the right. |
| About | Headline and lead. The rest ("More about how we work") opens in a fold that also holds the hero's intro line. | Two columns on tablets. |
| Name story | The copy is shown in full. A **portrait map** (viewBox 400×660): the brief at the top, five grey routes falling to "Somewhere crowded", the orange sixth route breaking right, looping and landing on the mark. Each route carries one word (SAFE, FAMILIAR…) on the line with a cream halo. **No pin**: the map draws as it scrolls up the screen. | Tablet: copy above the wide map, pinned as on desktop. On its side: the map fully drawn beside the copy. |
| Manifesto | **The reroute list.** All six pairs in one list; each one reroutes (first word in, the route underlines it, U-turns at the edge, underlines the second) as it moves up the screen, and stays. The question sticks only while the pairs scroll, with a night strip above it so passed rows never show through the see-through nav bar. The finale's underline ends on the glowing mark. | Tablet: the pinned scene. On its side: the list, nothing sticky. |
| What We Do | **The wheel.** The dial sits half off the bottom edge with the pointer at 12 o'clock; only the top third shows (width `min(128vw, 760px, 120svh)`). A sideways swipe turns it: it follows the finger, then snaps (a short flick is one step). Tapping a segment selects it, and auto-advance continues. The tab list is a row of 8 dots, so keyboard and screen-reader users keep it. | Tablets get the wheel too. |
| Featured projects | **Index + live preview.** A preview window sticks at the top; the titles scroll up beneath it, and the one crossing the line just under the window (62% of the screen) takes over the preview. Tap a title for its case study, which opens as a **bottom sheet** (92dvh, handle on top). Drag it down past 120px, or flick it, to close. | Tablets: preview and list side by side; the case study is the centred dialog. |
| Sixthroute difference | Three rows with the icon on the left and hairline dividers, no boxes. The background is a static SVG star map (`StarMap`); the WebGL constellation isn't loaded on phones. | Three columns on tablets. |
| Process | **The route timeline.** One orange line runs down the page and draws with the scroll (its head rides the 62% line); each step's node lights as the line reaches it, and its step art draws in, redrawn for night (orange route, cream points). | Tablets get the timeline too, with larger art. |
| Proof | Slim rows (icon, title, two-line description, arrow) with dividers, no card boxes. | Two columns on tablets. |
| FAQ | A two-line heading (the accent sentence becomes a smaller line under it). The first four questions show, then "Show all 8 questions"; the rest stay in the page. "Ask us directly" comes after the list. One answer is open at a time. | Single column. |
| Final CTA | Unchanged. The ribbon field ignores the pointer on touch screens. | Same. |
| Footer | Link groups as closed accordions (52px headers, orange "+"), Social as a row of pills. The rising wordmark stays. | Three columns on tablets. |
| Contact | "What happens next" becomes a three-step strip in the hero, just above the form; the full list is dropped. The "Send brief" bar is described above. Fields carry `autocomplete`, `inputmode` and "next" keyboard hints. | Same as desktop. |
| 404 | The mascot's eyes follow the last tap and glance somewhere new after a few quiet seconds. | Same. |

Reduced motion: every phone variant shows its finished state. The map is fully drawn, every pair is
shown, every timeline node is lit.

### Performance budget (phones)

- **Hero scene:** pixel ratio ≤ 1.5 (1.8 on desktop), one silk ribbon instead of two, mesh 160×12
  (desktop 360×20), 80 dust points (desktop 220).
- **ThreeUI effects** mount only while near the viewport (`BrandTint`). The constellation is replaced
  by `StarMap` on phones.
- **Low power** (data saver, a reported `deviceMemory` ≤ 4 GB, or no WebGL): the hero shows
  `public/hero-sphere.webp`, a still of the sphere, instead of the 3D scene. `?poster` forces it for
  testing. If the sphere's look changes, re-render the still from the live scene: ribbons and dust
  hidden, transparent background, cropped square, 640px WebP.

### Testing on phones

- DevTools device mode doesn't include the browser's own bars, so real phones have less height
  (about 412×780 visible on a typical Android phone). Check anything full-screen (menu, sheets,
  one-screen sections) at 412×780, 412×720, 390×664, 360×620 and on its side at 844×360.
- Anything sticky under the see-through nav bar needs a strip of section colour above it (as in the
  project index and the manifesto), or content scrolled past it shows behind the bar.
- Every pushed branch builds a Cloudflare preview at
  `https://<branch>-sixth-route.honeygautam0.workers.dev` (slashes become dashes, e.g.
  `mobile-redesign`). Open it on a real iPhone and Android phone before merging.
- Measured length of the phone home page at 390×844: 22.4 screens before the mobile work,
  13.3 after.

---

## 11. Landing page map

1. Loader → 2. Nav (logo, Home, Services, Work, About, FAQ, Contact, "Start a Project") →
3. Hero ("The future doesn't follow a route. It creates one.") → 4. Brand intro + name story +
manifesto → 5. Capabilities (eight disciplines) → 6. Featured projects ("Ideas in action.") →
7. The Sixthroute difference ("Less juggling. More connected thinking.") → 8. Process (4 sticky cards) →
9. The Work Speaks for Itself → 10. FAQ (8 questions) → 11. Final CTA
("Have a Vision? Let's Give It Direction.") → 12. Footer.

## 12. Where it lives in code

- Tokens: `src/styles/tokens.css` (CSS custom properties matching this document, phone overrides
  at the end).
- Layout tiers and device checks: `src/lib/media.ts` (`useMedia`, `prefersLowPower`).
- Logo geometry: `src/brand/logoData.ts`. React mark and lockup: `src/brand/Logo.tsx`.
- Content: `src/content.ts` (all copy from the brief in one place).
- Pages: `src/pages/` (`Home`, `Contact`, `NotFound`); form `src/components/BriefForm.tsx`;
  mascot `src/components/Mascot.tsx`.
- Phone-only pieces: `ThumbCta.tsx` (thumb button), `StarMap.tsx` (static constellation),
  `public/hero-sphere.webp` (low-power still). Phone and tablet module variants live beside their
  desktop versions in the same file (`ManifestoList`, `ProjectIndex`, `ProcessTimeline`, the wheel in
  `Capabilities`, the portrait map in `BrandIntro`).
