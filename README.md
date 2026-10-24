# ⏸️ PayPause — privacy-first subscription shield

> *Free trials are financial traps disguised as convenience. PayPause is the shield.*

PayPause is a hackathon concept product that gives consumers financial self-defense against
dark-pattern subscriptions: renewal-date hiding, buried cancellation flows, and "zombie"
recurring charges. It combines a subscription/trial tracker with **single-use virtual Pause
Cards** that lock to `₹0.00` the moment a free trial ends — **without ever asking for a bank
login or card number**.

All money is displayed in **Indian Rupees (₹)** with `en-IN` digit grouping (e.g. ₹1,07,200),
using realistic Indian subscription price points. The live network feed only ever shows small,
relatable savings — every individual event is capped below ₹500.

## Visual identity

The UI uses the official PayPause logo (`assets/img/paypause-logo-full.png`, with a compact
`paypause-mark-sm.png` for navs and favicons) and a cream-and-green light theme sampled
directly from the logo: cream `#fbf9f4` canvas, deep green `#0e6c50` primary, mint `#8ed5a4`
accents. The landing hero uses a human-centric photo (`assets/img/hero-people.jpg`) with the
content column cast to the left and floating proof cards — including blocked charges in
rupees — layered over the photo.

## What's inside

### Marketing site (`index.html`)
- Dark, fintech-grade landing page with animated hero, floating live countdown and stats
- Problem breakdown (the three dark patterns), three solution pillars, 3-step explainer
- **Interactive Pause Card generator** — mint a Luhn-valid burner card right in the browser
- **Live network savings** — a scrolling ticker, real-time feed of members blocking charges,
  animated network counters, and social-proof popups (simulated in-browser, clearly labeled)
- Pricing tiers, human testimonials, FAQ accordion (including an honest "this is a demo" note)

### Reddit-style community (`community.html`)
A standalone community app with the familiar Reddit layout, re-themed for PayPause:
- Six themed communities (r/SubscriptionTrap, r/PauseWins, r/CancelWarStories…), Home and Saved scopes
- Post feed with **Hot / New / Top** ranking, flairs, live search, and a left community rail
- Full **upvote/downvote** voting (Reddit-style toggle math, persisted), save, share and award actions
- Expandable comment threads with nested replies, likes, and inline comment/reply forms
- Create-post modal (community + flair + title + body) with validation, karma counter in the nav
- All posts, votes and comments persist in `localStorage`, with a one-click demo reset

### Live app demo (`dashboard.html`)
A fully interactive single-page dashboard, no backend — all state persists in `localStorage`.

- **Command center** — monthly recurring spend, trials at risk, active cards, yearly savings,
  category donut chart, 6-month spend bars, and a compact live network-savings panel
- **Subscriptions** — search + category filters, risk badges ("Rarely used", "Renews soon"),
  one-click *Protect* (mint a card) and **Kill the Bill** cancellation wizard with a
  pre-written cancellation script, progress animation and projected yearly savings
- **Free trials** — live per-second countdowns, trial progress bars, extend-lock and
  cancel-trial actions that immediately arm the linked Pause Card
- **Pause Cards** — merchant-locked burner cards with hard spend caps, auto-lock dates,
  lock/unlock/destroy (two-step confirm), generated with valid Luhn checksums
- Activity feed, notification bell, onboarding toast, and a one-click demo-data reset

## Tech stack

Zero build step, zero framework, zero network dependencies at runtime.

- Vanilla HTML / CSS / JavaScript (ES2020+)
- Custom design system in CSS (design tokens, dark theme, responsive, reduced-motion support)
- Inter + JetBrains Mono, self-hosted as WOFF2 under `assets/fonts/`
- [jsdom](https://github.com/jsdom/jsdom) smoke tests that load both pages and exercise the
  card-minting, filtering, cancellation wizard, trial-kill, live-feed and reset flows

## Run it

```bash
# any static file server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Test it

```bash
npm test
```

The test boots all three pages in jsdom, asserts the rendered DOM, simulates clicks through
every major flow (including community voting, sorting, comments and post creation), verifies
the live savings feed updates on its timer, and fails on any uncaught page error. A separate
chaos sweep double-clicks every control and submits every form to prove the apps throw zero
runtime errors under malformed input.

## Deploy to Render (free, sharable public URL)

This repo is a pure static site — no build command and no server needed. A `render.yaml`
Blueprint is included, so the configuration is automatic.

### Option A — Blueprint (recommended, one screen)

1. Push this branch to GitHub and open **https://dashboard.render.com/blueprints**
2. Click **New Blueprint Instance**
3. Choose the **paypause** repository (authorise Render on GitHub if prompted)
4. Render reads `render.yaml` and shows a `paypause` **Static Site** on the **free** plan —
   click **Apply** / **Create Resources**
5. Wait for the deploy to finish, then open the generated URL, e.g.
   `https://paypause.onrender.com` — that link is your sharable website

### Option B — manual static site

1. In the Render dashboard choose **New + → Static Site**
2. Connect the **paypause** repository, branch `arena/a59ab55a-paypause`
3. Set **Build Command** to empty (leave blank) and **Publish Directory** to `.`
4. Under **Redirects/Rewrites** add rewrites so clean URLs work:
   `/dashboard → /dashboard.html` and `/community → /community.html`
5. Create the site — Render issues a public `https://<name>.onrender.com` URL

Notes:

- Render static sites are **free and always on** (unlike free web services, they do not
  spin down from inactivity).
- Every `git push` to the connected branch triggers an automatic redeploy;
  pull requests also get preview URLs (enabled in the Blueprint).
- Unknown paths automatically serve the branded `404.html`, and the Blueprint adds
  security headers plus sensible caching for HTML vs. assets.

## Project structure

```
├── index.html              # marketing site
├── dashboard.html          # interactive app demo
├── community.html          # Reddit-style community app
├── 404.html                # branded not-found page
├── render.yaml             # Render Blueprint (free static-site deploy config)
├── robots.txt              # crawl allowlist + sitemap pointer
├── sitemap.xml             # all public pages
├── site.webmanifest        # installable PWA manifest (theme color, icon)
├── assets/
│   ├── css/
│   │   ├── styles.css      # design system + landing page
│   │   ├── dashboard.css   # app shell, panels, modals
│   │   ├── live.css        # live ticker, feed, proof popups
│   │   └── community.css   # Reddit-style feed, vote rails, comments
│   ├── js/
│   │   ├── data.js         # seed data, state, localStorage, Luhn card engine
│   │   ├── ui.js           # shared toasts + modal helpers
│   │   ├── live.js         # simulated live network savings engine
│   │   ├── landing.js      # landing interactions + card generator
│   │   ├── dashboard.js    # app rendering and all user flows
│   │   └── community.js    # community feed, voting, comments, persistence
│   ├── fonts/              # self-hosted WOFF2 fonts
│   └── img/                # PayPause logo marks + human hero photo
└── test/smoke.mjs          # jsdom end-to-end smoke tests
```

## Quality & accessibility

- **Zero runtime errors**: every page passes a jsdom chaos sweep that clicks every
  button, link, chip and form control across multiple rounds with a 5-second live
  engine window; all `localStorage` access is try/catch guarded with in-memory fallback.
- **WCAG-minded contrast**: text-grade accent tokens (`--mint-ink`, `--cyan-ink`,
  darkened rose/amber/faint) keep small text at or above 4.5:1 on the cream canvas.
- **Keyboard & screen readers**: skip-to-content links, visible `:focus-visible` rings,
  one `h1` per page, labelled inputs, `role="dialog"`/`aria-modal` modals with focus
  capture and restoration, `aria-expanded` menu buttons, Escape-to-close for menus
  and dialogs.
- **Web hygiene**: PNG favicon + apple-touch-icon, Open Graph/Twitter cards,
  `theme-color`, PWA manifest, `robots.txt`, `sitemap.xml`, branded 404, lazy-loaded
  below-fold images and intrinsic width/height on every image to prevent layout shift.

## Important disclaimer

PayPause is a **hackathon concept demo**. No real cards are issued, no money moves, and no
data ever leaves the browser — card numbers are valid-*format* test data generated on your
device, the "live network" feed is simulated locally, and everything else is stored in
`localStorage`. A production version would require a licensed card-issuing partner and a
regulated entity.
