# ⏸️ PayPause — privacy-first subscription shield

> *Free trials are financial traps disguised as convenience. PayPause is the shield.*

PayPause is a hackathon concept product that gives consumers financial self-defense against
dark-pattern subscriptions: renewal-date hiding, buried cancellation flows, and "zombie"
recurring charges. It combines a subscription/trial tracker with **single-use virtual Pause
Cards** that lock to `$0.00` the moment a free trial ends — **without ever asking for a bank
login or card number**.

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

## Project structure

```
├── index.html              # marketing site
├── dashboard.html          # interactive app demo
├── community.html          # Reddit-style community app
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
│   └── fonts/              # self-hosted WOFF2 fonts
└── test/smoke.mjs          # jsdom end-to-end smoke tests
```

## Important disclaimer

PayPause is a **hackathon concept demo**. No real cards are issued, no money moves, and no
data ever leaves the browser — card numbers are valid-*format* test data generated on your
device, the "live network" feed is simulated locally, and everything else is stored in
`localStorage`. A production version would require a licensed card-issuing partner and a
regulated entity.
