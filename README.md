# Sixth Route — landing page

Vite + React + TypeScript. 3D hero in Three.js (React Three Fiber), scroll motion with GSAP
ScrollTrigger + Lenis, and two [ThreeUI](https://threeui.com) effects recoloured to the brand.

```bash
npm install
npm run dev      # http://localhost:5173  (?nointro skips the opening, ?intro replays it, ?poster shows the low-power hero)
npm run build    # production build in dist/
```

Pages: `/` (landing), `/contact/` (brief form), `/404.html` (mascot page; static hosts serve it
for unknown routes).

### Environment (optional)

| Variable | Effect |
| --- | --- |
| `VITE_AGENTATION_ENDPOINT` | Set to `http://localhost:4747` in `.env.development`; syncs Agentation notes to the `agentation-mcp` server. |

### Brief delivery

The contact form posts to the same-origin `/api/brief` Cloudflare Worker route. The Worker
validates the brief, limits requests to five per minute per visitor/location, and sends a plain-text
email through Resend. The recipient and sender come only from server settings; the visitor's
address is used as Reply-To. The site confirms submission only after Resend accepts the email.
Failed attempts preserve the form and reuse an idempotency key on retry to avoid duplicate emails.

Configure these server secrets in the target Cloudflare Worker environment (previews are isolated):

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend sending key. Never use a `VITE_` variable or put it in source. |
| `RESEND_FROM_EMAIL` | Sender at a domain verified in Resend, such as `Sixth Route <briefs@sixthroute.com>`. |
| `BRIEF_TO_EMAIL` | Receiving inbox for project briefs. |

For Git-connected preview builds, store these three values as encrypted build secrets on that
preview and use `npm run deploy:preview` as its preview command. The script passes a private
temporary secrets file to Wrangler and removes it afterward. It refuses to deploy if a value is
missing. Production promotion needs the same runtime secrets in the production environment.

The sending domain must have Resend's verification records. This does not require changing the
domain's incoming mail routing. An accepted email is not proof of inbox delivery; check Resend's
delivery status and the receiving inbox when verifying a release.

For local development, copy `.dev.vars.example` to ignored `.dev.vars` and fill in the settings.
Run `npm run build`, then `npm run dev:worker` and `npm run dev` in separate terminals. Vite
forwards `/api` to the local Worker. `npm test` exercises validation, routing, quota protection,
provider acknowledgement, failure handling, and the server-controlled recipient without sending email.

### Agentation (dev only)

The [Agentation](https://agentation.com) toolbar appears bottom-right in `npm run dev`: click it,
click any element, write a note. It is excluded from production builds.

Notes sync to Claude Code through the `agentation` MCP server (registered for this project with
`claude mcp add agentation -- npx -y agentation-mcp server`). Claude Code starts it — and its HTTP
server on `localhost:4747` — whenever a session opens in this folder; `.env.development` points the
toolbar at it. Leave notes, then ask Claude to "check my Agentation notes"
(`agentation_get_all_pending`). Run `npx agentation-mcp doctor` if notes don't arrive. Without a
running server the toolbar still works locally — use its copy button.

**Brand rules live in [design.md](design.md)** — colours, type, logo, motion, voice, and the mobile
and touch rules (§10: tiers, phone versions of each module, performance budget, how to test on a
real phone). Read it before changing anything visual.

## Structure

| Path | What it is |
| --- | --- |
| `src/content.ts` | Every word on the page, from the client brief. Edit copy here. |
| `src/styles/tokens.css` | Design tokens (matches design.md). |
| `src/brand/` | Logo geometry traced from the Figma master, `Mark` / `Wordmark` / `Lockup`. |
| `src/three/` | Hero scene: the mark as a sphere with the route ribbon, plus silk ribbons (`SilkRibbon.tsx`). |
| `src/components/Loader.tsx` | Opening ribbon sequence (`src/brand/ribbons.ts`) → logo flies to the nav. |
| `src/components/*` | One component + stylesheet per section (phone/tablet variants live in the same file). |
| `src/lib/media.ts` | Layout tiers (`PHONE`, `COMPACT`, `DESKTOP`, `TOUCH`, `LANDSCAPE_PHONE`), `useMedia`, low-power check. |
| `src/pages/` + `src/entries/` | `Home`, `Contact`, `NotFound`; one entry per HTML page (`src/mount.tsx` bootstraps). |

Sections: Loader · Nav · Hero · Disciplines ticker · About + name story · Manifesto (reroutes) ·
What We Do (dial) · Featured Projects · The Sixthroute difference (ThreeUI Constellation Field) ·
Process (sticky staircase) · The Work Speaks for Itself · FAQ · Final CTA (ThreeUI Ribbon Field) · Footer.

## Before launch

- Replace the five project concepts in `PROJECTS` (content.ts) with real case studies and imagery.
  The first card (the Sixth Route identity) is the studio's own work; the rest are labelled
  "Self-initiated concept" as the brief requires.
- Confirm the "Why Sixth Route" name story copy with the client.
- Confirm the public contact email (`EMAIL`), social profile URLs, and Resend delivery settings.
- Build the Privacy Policy and Terms of Service pages (footer links point at `/privacy`, `/terms`).
- Fonts load from Google Fonts; self-host them if offline/privacy requirements apply.
