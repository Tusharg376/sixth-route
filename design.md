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

Type scale (fluid, clamp min → max): display `clamp(3rem, 7.2vw, 7.5rem)`, h2 `clamp(2.2rem, 4.6vw, 4.5rem)`,
h3 `clamp(1.25rem, 1.8vw, 1.6rem)`, body-lg `1.25rem`, body `1.0625rem`, small `0.875rem`.

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
  "Ideas. Design. Technology." visual). Implemented as a shader in `SilkField`.
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
- 12-column grid on desktop, single column under 760px.
- Section padding `clamp(96px, 12vw, 180px)` vertical.
- Dark and light sections alternate for rhythm (night hero → cream story → cream services →
  cream projects → night process → cream FAQ → night CTA + footer).

## 7. Motion

| Token          | Value                              | Use                              |
| -------------- | ---------------------------------- | -------------------------------- |
| `--ease-out`   | `cubic-bezier(0.16, 1, 0.3, 1)`    | Reveals, entrances               |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)`   | Transforms, morphs, FLIP moves   |
| Fast / base / slow | 240ms / 600ms / 1200ms         |                                  |

Signature animations:

1. **Opening (loader) — ribbons, no construction lines.** An orange ribbon flies in from the
   bottom-left corner of the screen and threads the 6 tail-first (tail → bar → loop → spine → off the
   top). A second, wider ribbon sweeps in from the bottom-right and coils inward 3½ turns to build
   the circle behind it while the 6 darkens to maroon. The exact mark takes over, glows, the
   wordmark rises letter by letter, and the lockup FLIPs to the top-left nav slot as the night
   curtain lifts. Lead-ins are computed from the viewport so the ribbons always enter at the screen
   corners. Geometry: `src/brand/ribbons.ts`.
2. **Hero 3D mark + silk ribbons (no orbit rings — the logo has none).** The mark is a real 3D
   sphere with the route as a raised maroon ribbon on its surface; it spins into alignment, tilts
   toward the cursor and turns with scroll. Behind it, two glossy silk ribbons (one wide and deep,
   one narrow and bright) flow across the full width inside the sphere's band, growing in from the
   left to continue the opening ribbon. They never sit behind the headline. `src/three/SilkRibbon.tsx`.
3. **Manifesto as reroutes.** A pinned scene: the premise "What if we took a different route?"
   stays up while six "Let's make X → Y" pairs take the stage. For each, an orange route strikes
   through the obvious word, U-turns round its end and underlines the new word right-to-left as it
   rises in orange. Finale: "something we create." is underlined out to the glowing mark, then
   the closers and "Welcome to Sixthroute."
4. **What We Do as a dial.** The brand circle cut into eight segments around the mark. The dial
   turns so the active discipline meets an orange pointer (and pops out, orange); the panel shows
   number, title, description and service chips; a legend lists all eight as tabs. Auto-advances
   every ~4s while visible (a thin timer ring shows it), pauses on hover/focus, arrow keys work.
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
- Behaviour: idle bob, blink every ~4.6s, pupils follow the cursor. Hovering or focusing a way out
  (Back to Home, Start a Project, popular routes) makes it smile, blush and hop, and the question
  mark disappears.
- Copy: "This route doesn't go anywhere." + what happened and what to do, never an apology.

## 10. Landing page map

1. Loader → 2. Nav (logo, Home, Services, Work, About, FAQ, Contact, "Start a Project") →
3. Hero ("The future doesn't follow a route. It creates one.") → 4. Brand intro + name story +
manifesto → 5. Capabilities (eight disciplines) → 6. Featured projects ("Ideas in action.") →
7. Why Sixthroute ("Less juggling. More connected thinking.") → 8. Process (4 sticky cards) →
9. The Work Speaks for Itself → 10. FAQ (8 questions) → 11. Final CTA
("Have a Vision? Let's Give It Direction.") → 12. Footer.

## 11. Where it lives in code

- Tokens: `src/styles/tokens.css` (CSS custom properties matching this document).
- Logo geometry: `src/brand/logoData.ts`. React mark and lockup: `src/brand/Logo.tsx`.
- Content: `src/content.ts` (all copy from the brief in one place).
- Pages: `src/pages/` (`Home`, `Contact`, `NotFound`); form `src/components/BriefForm.tsx`;
  mascot `src/components/Mascot.tsx`.
