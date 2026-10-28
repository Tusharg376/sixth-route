# Mobile plan — Sixth Route

The desktop site works because it uses width: wide maps, side-by-side panels, a sideways project
row, a four-column staircase. On a phone, width is the one thing we don't have. Squeezing those
layouts in or stacking them gives a page that is long, mostly empty and hard to read. This plan
redesigns each module for a narrow screen held in one hand, keeping each idea and changing how it's
shown.

Audit: headless Chrome at 390×844 (iPhone 15), 360×740 (small Android) and 844×390 (landscape),
on the current `feedback/intro-ribbons-and-sections` build.

---

## 1. What's wrong today

**It's too long.** The home page is **18,942 px = 22.4 phone screens**. Where the length comes from:

| Section | Now (px) | Screens | Problem on a phone |
| --- | ---: | ---: | --- |
| Hero | 844 | 1.0 | At 360 px, "It creates one." collides with the body copy and the sphere overlaps the text. |
| About | 812 | 1.0 | A whole screen of two paragraphs. |
| Name story | 2,026 | 2.4 | The map is a wide 1000×620 drawing shrunk to 350 px, so the routes are hairlines. **The body copy explaining the name is hidden under 560 px**, so phone visitors never learn where the name comes from. |
| Manifesto | 5,165 | **6.1** | Six pinned beats at 64vh each. The words sit in the top third and the rest of the screen is empty. The U-turn route crowds the second word. |
| What We Do (dial) | 1,576 | 1.9 | Dial, detail and an 8-row legend are stacked. Tapping a legend row scrolls the dial off screen, and the dial and legend do the same job. |
| Featured projects | 975 | 1.2 | A sideways swipe row, the "make it horizontal" fallback we want to avoid. Only 1.2 cards are visible and nothing hints that it scrolls. |
| Sixthroute difference | 1,168 | 1.4 | Three boxed cards stacked, plus a full WebGL constellation behind them. |
| Process | 2,253 | 2.7 | The staircase collapses to four 400 px orange cards in a column, so the staircase idea is lost. |
| Proof | 888 | 1.05 | OK. |
| FAQ | 1,477 | 1.75 | Eight accordions plus a four-line heading. |
| Final CTA | 586 | 0.7 | OK. |
| Footer | 1,104 | 1.3 | Seven link groups in two columns. Every link is 24 px tall. |

**System issues**

- **Eight different breakpoints** (560, 640, 680, 760, 860, 900, 960, 1080), so sections switch
  layout at different widths and tablets get a mix.
- **`100vh` everywhere.** On iOS Safari, `vh` changes as the address bar shows and hides, which
  makes the pinned sections (Manifesto, Name story, Process) jump.
- **Hover-only details have no touch equivalent**: the card "+" turning to ×, the button fill, the
  dial pausing on hover, the hero sphere's pointer tilt, the 404 mascot's eyes. On a phone these are
  either missing or get stuck on after a tap.
- **Tap targets**: 24 footer links are 24 px tall and the text links are 29 px. The minimum
  should be 44 px.
- **Tiny text**: eyebrows are 11.5 px and card labels 10.9 px.
- **No visible action**: below 680 px the nav's "Start a Project" button is hidden. Unless a
  visitor opens the menu, the only CTAs are in the hero and at the very end of the page.
- **GPU load**: the 3D hero (DPR up to 1.8, two 360×20-segment silk ribbons, 220 dust points), the
  ThreeUI constellation and the ThreeUI ribbon field all run on a phone GPU, with nothing scaled
  down for mobile.
- **Landscape phone**: the hero headline and sphere don't fit, and the sticky name-story header
  covers its own copy.

What already works: the opening ribbon animation (it enters from the left and bottom edges and
looks good in portrait), the full-screen menu, Proof, the Final CTA, the Contact form and the 404
page. These only need small fixes.

---

## 2. Principles for the phone version

1. **One idea per screen.** Each module gets one screenful and one interaction, never a squeezed
   copy of the desktop.
2. **Scroll is the main input. Swipe and tap come second.** Vertical scroll drives the story.
   Horizontal swipe is only for turning a control (the dial), never for hiding content.
3. **Pin less.** Pins of 6 screens feel broken on touch. Pin only where the scroll-driven
   animation is the content, and then for 1.5 screens at most.
4. **Make every hover usable by touch.** Each hover effect gets a tap or scroll equivalent.
5. **Keep a CTA within reach.** A thumb-reach "Start a Project" pill is always available.
6. **Respect the GPU budget.** 3D on phones is capped, simplified, or replaced by a still image.
7. **Same brand.** Only the existing design-system parts (five colours, Montserrat/Urbanist, the
   mark, the route line, the pill button, the cards). No new visual language.

**Target: about 14.5 screens (−35%)** with nothing important cut. The copy is all still there; the
lower-priority parts are folded away rather than deleted.

---

## 3. Foundations (applies to the whole site)

| Item | Change |
| --- | --- |
| Breakpoints | Three tiers in `tokens.css` and one `useMedia()` hook: **phone ≤ 600**, **tablet 601–1024**, **desktop ≥ 1025**. Plus `(hover: none)` for touch behaviour at any width, and `(orientation: landscape) and (max-height: 500px)` for landscape phones. Existing media queries move onto these. |
| Viewport units | `100vh` becomes `100svh` for pinned and sticky heights (stable, no jump) and `100dvh` for the menu and sheets. `ScrollTrigger.config({ ignoreMobileResize: true })`. |
| Type (phone) | Eyebrow 12 px with 0.16em tracking. Body 16 px. h2 `clamp(2rem, 9vw, 2.6rem)`. Display `clamp(2.4rem, 11.5vw, 3.2rem)`. Nothing below 12 px. |
| Tap targets | 44 px minimum height on every link and button (footer links, text links, chips, FAQ rows). |
| Touch states | `:hover` effects only under `(hover: hover)`. Touch gets `:active` (button fill flashes in, card "+" rotates on press). No stuck hovers. |
| Thumb CTA | A floating "Start a Project" pill (the existing `.btn--orange`), bottom centre with safe-area inset. It appears once the hero CTA scrolls away and hides near the Final CTA, the footer, in the open menu and in sheets. Phones only. |
| Menu | Numbered links (01–06, Montserrat 700), the CTA, then email and social pills at the bottom. Uses `100dvh`, locks the scroll behind it and closes when a link is tapped. |
| GPU budget | Phones: DPR capped at 1.5, one silk ribbon (not two) with 160×12 segments, 80 dust points, the constellation replaced by a static brand-tinted SVG star map, and the CTA ribbon field paused when off screen. Low-end devices (`deviceMemory ≤ 4` or `saveData`) get a still poster image of the sphere instead of WebGL. |
| Intro | Uses the same ribbon sequence. On phones the mark draws at 40vw (was 30vw), "Click to skip" becomes "Tap to skip", the sequence runs 12% faster (about 0.6 s shorter), and it plays once per tab (`sessionStorage`; `?intro` replays it). |

---

## 4. Section by section

### Hero: "poster in one screen"
Exactly `100svh`, in this order: eyebrow, two headline lines, the sphere in its slot, "It
creates one.", **one** primary CTA. The body paragraph moves into the About section (it repeats the
same message), and "Explore Our Work" becomes a small scroll cue. The slot gets a fixed aspect ratio,
so the 360 px overlap can't happen.
**Touch:** drag the sphere to spin it (with inertia) instead of the pointer tilt. It auto-rotates
slowly when idle.

```
┌──────────────────┐
│ ◉ SIXTHROUTE   ≡ │
│ CREATIVE·STRATEGY│
│  The future      │
│  doesn't follow  │
│     a route.     │
│      ( ◉ )  ~~~  │  ← drag to spin
│ It creates one.  │
│ [Let's Build  →] │
│        ↓         │
└──────────────────┘
```

### About: "short opener"
Headline, the lead paragraph (now including the line moved from the hero), then the "Beyond the
obvious" signature and link. The second paragraph is folded behind "More about how we work". About
0.8 screen.

### Name story: "the map turns vertical"
The story of the name is the core of the brand, so on phones it is **shown, not hidden**.
- The copy comes first and is fully visible, including the body text that is hidden today.
- Below it is a **portrait** version of the map (new 400×640 viewBox drawn for phones). "Your brief"
  is at the top. Five grey routes fan *downward* and all reach "Somewhere crowded" near the bottom.
  The orange sixth route breaks away, loops and ends at the mark on the right edge.
- The labels are 13–14 px and readable. One short pin of about 1.4 screens: the map draws as you
  scroll, the same animation as desktop with a different layout.

```
┌──────────────────┐
│ WHY "SIXTH ROUTE"│
│ Every brief…     │
│ We take the sixth│
│ (body copy)      │
│      ● YOUR BRIEF│
│    ╱ ╱ │ ╲ ╲  ╮  │
│   │ │  │  │ │ ◠╯ │  ← sixth route
│    ╲╲ │ ╱╱    ◉  │    peels off
│   ●●● crowded    │
└──────────────────┘
```

### Manifesto: "reroute list" (6.1 → about 2.6 screens)
No long pin. The six pairs become a **vertical list**, one pair per row, with large type
(`11vw`). Each row "reroutes" as it scrolls into the middle of the screen: the first word slides
in, the orange route underlines it, makes the U-turn at the right edge and underlines the second
word. Every pair ends up visible together, so the section reads as a whole manifesto instead of
six disappearing slides.
"What if we took a different route?" stays as a small CSS-sticky header for the length of the
section. The finale ("And the future… something we create.", closers, "Welcome to Sixthroute.",
the endmark) arrives on one final screen.

```
┌──────────────────┐
│ What if we took a│  ← sticky
│ different route? │
│ Let's make       │
│ experiences ───╮ │
│  memorable. ───╯ │
│ possibilities ─╮ │
│    limitless. ─╯ │
│ the unexpected ╮ │
│      official. ╯ │
└──────────────────┘
```

### What We Do: "thumb wheel" (1.9 → 1 screen)
The dial stays and is designed for the thumb.
- The section is one screen. The **dial is half-hidden off the bottom edge** as a large wheel
  (about 130vw across), with the pointer at 12 o'clock. Only the top arc of segments is visible,
  like a rotary control under the thumb.
- Above it: "01 / 08", the discipline title, the copy and the chips, which change with the dial.
- **Swipe left or right on the wheel turns it** (`touch-action: pan-y`, so vertical scroll still
  works). Tapping a segment selects it. Auto-advance with the timer ring stays, and touching the
  wheel pauses it.
- The 8-row legend is removed on phones because the wheel is the legend. The tab semantics move
  onto the segments, so screen-reader behaviour stays the same.

```
┌──────────────────┐
│ Eight disciplines│
│ 03 / 08          │
│ Social Media     │
│ Strategy, content│
│ [chip][chip]     │
│    ▼             │
│  ╭─┬──┬──┬─╮     │
│ ╱ ✱│◉ │ ⊕│ ╲    │  ← swipe to turn
└──────────────────┘
```

### Featured projects: "index + live preview" (no sideways row)
A vertical, editorial pattern replaces the horizontal row:
- A **sticky preview window** (about 45svh, the card art with its label and "+") sits at the top of
  the section.
- Under it, the **six project titles as large rows** (title, discipline tags, number). As each row
  crosses the middle of the screen, the preview crossfades to that project.
- Tapping a row (or the preview) opens the case study as a **bottom sheet** (92dvh, art on top;
  drag down or tap the backdrop to close) instead of the centred dialog.
- The "Your project could be next" end card becomes the last row and opens /contact/.
About 1.6 screens, with every project visible and none hidden off to the side.

```
┌──────────────────┐
│ ┌──────────────┐ │
│ │ STUDIO   (+) │ │  ← sticky preview
│ │   ( art )    │ │
│ └──────────────┘ │
│ 01 Sixth Route ● │  ← active row
│    identity      │
│ 02 Ember product │
│    renders       │
│ 03 …             │
└──────────────────┘
```

### Sixthroute difference: "three lines, not three cards"
Headline and copy, then the three points as a **list with icons on the left**: no card boxes, with
thin dividers. The background is a static SVG constellation in brand tint, with no WebGL on phones.
About 0.9 screen.

### Process: "the route timeline" (2.7 → about 1.5 screens)
On a phone the desktop staircase becomes a **vertical route**.
- One orange route line runs down the left side and connects four step nodes. It **draws with
  scroll** (scrubbed), and each node lights up as the line reaches it.
- Each step: number, title, body, and its small "six dots" drawing to the right (the same art that
  evolves from step to step on desktop: found, planned, drawn, launched).
- No pin. It flows with normal scroll.

```
┌──────────────────┐
│ How We Make      │
│ Things Happen    │
│ ●─ 01 Discover   │
│ │   & Understand │ ⋰
│ ●─ 02 Strategise │ ⋱⋰
│ │   & Align      │
│ ○  03 Create     │  ← line draws on
│ ┆   & Execute    │
│ ○  04 Launch     │
└──────────────────┘
```

### Proof
Kept as it is, a little tighter: the rows are icon, title and arrow, with a one-line description.

### FAQ: "four, then the rest"
The heading drops to two lines. The **first four questions** are shown and a "Show all 8 questions"
button reveals the rest. Only one answer is open at a time. "Ask us directly" follows the list.
About 1.1 screens.

### Final CTA
Kept, with the thumb CTA hidden here. The ribbon field pauses when off screen and runs at lower
density on phones.

### Footer: "fold the link columns"
- Main pages, Services, Utility and Legal become **accordion groups** (closed by default) with 48 px
  rows.
- The social links become a row of pills.
- The big "SIXTHROUTE" wordmark rising from the bottom stays.
About 0.9 screen.

### Contact page
Mostly fine already. Changes: the "Send brief" button stays pinned to the bottom of the form while
the form is on screen; chips get 44 px height; `autocomplete`/`inputmode` on the fields;
"What happens next" folds into a three-step strip above the form. Inputs are already 16 px, so iOS
won't zoom on focus.

### 404 page
Fine on phones. On touch, the mascot's eyes follow the last tap and look around when idle, instead
of following the pointer.

### Tablet (601–1024) and landscape phones
- **Tablet** uses the phone modules (index projects, route timeline, thumb wheel) wherever the
  desktop layout needs more than 1025 px, but keeps two columns for About, Why, Proof and the footer.
- **Landscape phones** get a compact hero (headline and sphere side by side) and skip the pinned
  sections: the Name-story map is shown fully drawn.

---

## 5. Length budget (390×844)

| Section | Now | Target |
| --- | ---: | ---: |
| Hero + ticker | 1.1 | 1.1 |
| About | 1.0 | 0.8 |
| Name story | 2.4 | 1.6 |
| Manifesto | 6.1 | 2.6 |
| What We Do | 1.9 | 1.0 |
| Projects | 1.2 | 1.6 |
| Sixthroute difference | 1.4 | 0.9 |
| Process | 2.7 | 1.5 |
| Proof | 1.05 | 0.8 |
| FAQ | 1.75 | 1.1 |
| Final CTA | 0.7 | 0.8 |
| Footer | 1.3 | 0.9 |
| **Total** | **22.4** | **≈ 14.7** |

---

## 6. How it will be built

- **Desktop stays untouched.** Modules whose *structure* changes (Name story, Manifesto, What We
  Do, Projects, Process) get a phone variant next to the desktop one in the same file, chosen with
  `useMedia()`. For example, `Manifesto` renders `<ManifestoPhone/>` at 600 px or less. Modules
  that only change *layout* are done in CSS. All copy still comes from `content.ts`.
- Scroll timelines per tier go through `gsap.matchMedia()`, so resizing or rotating the phone
  rebuilds them cleanly.
- Reduced motion: every phone variant has a static state (the map fully drawn, all pairs shown, all
  timeline nodes lit).
- Work happens on a new branch (`mobile/redesign`) so Cloudflare builds a separate preview URL to
  open on a real phone and compare with `main`.

### Phases

1. ✅ **Foundations** (done on `mobile/redesign`): breakpoints, svh/dvh, phone type scale, tap targets, touch states, thumb CTA,
   menu, GPU budget, intro tweaks.
2. ✅ **Rebuilt modules** (done on `mobile/redesign`): Hero, Name story (vertical map), Manifesto
   (reroute list), What We Do (thumb wheel), Projects (index + preview + sheet), Process (route
   timeline). Two changes from the sketches above: the name-story map doesn't pin on phones (copy
   plus a tall map can't share one screen, so the map draws as it scrolls up instead), and the dial
   keeps its tab list as a row of dots, so keyboard and screen-reader users still have it. The
   phone home page measured 15.3 screens after this phase (from 22.4).
3. **Trims**: About, Sixthroute difference, Proof, FAQ, Footer, Contact, 404, tablet and landscape.
4. **QA + docs**: an automated audit at 360/390/430/768 px and landscape (overflow, tap targets,
   text size, page length), a check on a real iPhone (Safari) and Android phone (Chrome) through the
   preview URL, and a "Mobile" chapter in `design.md`.

### Decisions to confirm

- **Thumb CTA pill**: recommended. It is the only element that isn't on desktop.
- **Projects as index + preview** rather than a stacked deck of cards. The index is shorter and
  shows all six titles at once. A stacked deck is the alternative if you prefer big imagery.
- **Low-end fallback** to a still sphere image instead of WebGL. This needs one exported
  poster image of the hero sphere.
