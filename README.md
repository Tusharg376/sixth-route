# Sixth Route — landing page

Vite + React + TypeScript. 3D hero in Three.js (React Three Fiber), scroll motion with GSAP
ScrollTrigger + Lenis, and two [ThreeUI](https://threeui.com) effects recoloured to the brand.

```bash
npm install
npm run dev      # http://localhost:5173  (add ?nointro to skip the opening animation)
npm run build    # production build in dist/
```

Pages: `/` (landing), `/contact/` (brief form), `/404.html` (mascot page; static hosts serve it
for unknown routes).

### Environment (optional)

| Variable | Effect |
| --- | --- |
| `VITE_FORM_ENDPOINT` | URL that accepts the contact brief as JSON (Formspree, Basin, your API). Without it the form opens the visitor's email app pre-filled. |
| `VITE_AGENTATION_ENDPOINT` | Set to `http://localhost:4747` in `.env.development`; syncs Agentation notes to the `agentation-mcp` server. |

### Agentation (dev only)

The [Agentation](https://agentation.com) toolbar appears bottom-right in `npm run dev`: click it,
click any element, write a note. It is excluded from production builds.

Notes sync to Claude Code through the `agentation` MCP server (registered for this project with
`claude mcp add agentation -- npx -y agentation-mcp server`). Claude Code starts it — and its HTTP
server on `localhost:4747` — whenever a session opens in this folder; `.env.development` points the
toolbar at it. Leave notes, then ask Claude to "check my Agentation notes"
(`agentation_get_all_pending`). Run `npx agentation-mcp doctor` if notes don't arrive. Without a
running server the toolbar still works locally — use its copy button.

**Brand rules live in [design.md](design.md)** — colours, type, logo, motion, voice. Read it before
changing anything visual.

## Structure

| Path | What it is |
| --- | --- |
| `src/content.ts` | Every word on the page, from the client brief. Edit copy here. |
| `src/styles/tokens.css` | Design tokens (matches design.md). |
| `src/brand/` | Logo geometry traced from the Figma master, `Mark` / `Wordmark` / `Lockup`. |
| `src/three/` | Hero scene: the mark as a sphere with the route ribbon, plus silk ribbons (`SilkRibbon.tsx`). |
| `src/components/Loader.tsx` | Opening ribbon sequence (`src/brand/ribbons.ts`) → logo flies to the nav. |
| `src/components/*` | One component + stylesheet per section. |
| `src/pages/` + `src/entries/` | `Home`, `Contact`, `NotFound`; one entry per HTML page (`src/mount.tsx` bootstraps). |

Sections: Loader · Nav · Hero · Disciplines ticker · About + name story · Manifesto (reroutes) ·
What We Do (dial) · Featured Projects · Why Sixthroute (ThreeUI Constellation Field) ·
Process (sticky staircase) · The Work Speaks for Itself · FAQ · Final CTA (ThreeUI Ribbon Field) · Footer.

## Before launch

- Replace the five project concepts in `PROJECTS` (content.ts) with real case studies and imagery.
  The first card (the Sixth Route identity) is the studio's own work; the rest are labelled
  "Self-initiated concept" as the brief requires.
- Confirm the "Why Sixth Route" name story copy with the client.
- Set the real email (`EMAIL`), social profile URLs, and a form backend (`VITE_FORM_ENDPOINT`).
- Build the Privacy Policy and Terms of Service pages (footer links point at `/privacy`, `/terms`).
- Fonts load from Google Fonts; self-host them if offline/privacy requirements apply.
