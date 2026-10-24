# 👻 GhostSub — privacy-first subscription shield

> *Free trials are financial traps disguised as convenience. GhostSub is the shield.*

GhostSub is a hackathon concept product that gives consumers financial self-defense against
dark-pattern subscriptions: renewal-date hiding, buried cancellation flows, and "zombie"
recurring charges. It combines a subscription/trial tracker with **single-use virtual Ghost
Cards** that lock to `$0.00` the moment a free trial ends — **without ever asking for a bank
login or card number**.

## What's inside

### Marketing site (`index.html`)
- Dark, fintech-grade landing page with animated hero, floating live countdown and stats
- Problem breakdown (the three dark patterns), three solution pillars, 3-step explainer
- **Interactive Ghost Card generator** — mint a Luhn-valid burner card right in the browser
- Pricing tiers, human testimonials, FAQ accordion (including an honest "this is a demo" note)

### Live app demo (`dashboard.html`)
A fully interactive single-page dashboard, no backend — all state persists in `localStorage`.

- **Command center** — monthly recurring spend, trials at risk, active cards, yearly savings,
  category donut chart and 6-month spend bars
- **Subscriptions** — search + category filters, risk badges ("Rarely used", "Renews soon"),
  one-click *Protect* (mint a card) and **Kill the Bill** cancellation wizard with a
  pre-written cancellation script, progress animation and projected yearly savings
- **Free trials** — live per-second countdowns, trial progress bars, extend-lock and
  cancel-trial actions that immediately arm the linked Ghost Card
- **Ghost Cards** — merchant-locked burner cards with hard spend caps, auto-lock dates,
  lock/unlock/destroy (two-step confirm), generated with valid Luhn checksums
- Activity feed, notification bell, onboarding toast, and a one-click demo-data reset

## Tech stack

Zero build step, zero framework, zero network dependencies at runtime.

- Vanilla HTML / CSS / JavaScript (ES2020+)
- Custom design system in CSS (design tokens, dark theme, responsive, reduced-motion support)
- Inter + JetBrains Mono, self-hosted as WOFF2 under `assets/fonts/`
- [jsdom](https://github.com/jsdom/jsdom) smoke tests that load both pages and exercise the
  card-minting, filtering, cancellation wizard, trial-kill and reset flows

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

The test boots both pages in jsdom, asserts the rendered DOM, simulates clicks through every
major flow, and fails on any uncaught page error.

## Project structure

```
├── index.html              # marketing site
├── dashboard.html          # interactive app demo
├── assets/
│   ├── css/
│   │   ├── styles.css      # design system + landing page
│   │   └── dashboard.css   # app shell, panels, modals
│   ├── js/
│   │   ├── data.js         # seed data, state, localStorage, Luhn card engine
│   │   ├── ui.js           # shared toasts + modal helpers
│   │   ├── landing.js      # landing interactions + card generator
│   │   └── dashboard.js    # app rendering and all user flows
│   └── fonts/              # self-hosted WOFF2 fonts
└── test/smoke.mjs          # jsdom end-to-end smoke tests
```

## Important disclaimer

GhostSub is a **hackathon concept demo**. No real cards are issued, no money moves, and no
data ever leaves the browser — card numbers are valid-*format* test data generated on your
device, and everything is stored locally. A production version would require a licensed
card-issuing partner and regulated entity.
