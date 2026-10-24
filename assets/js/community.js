/* ============================================================
   PayPause Community — Reddit-style community app
   All data is local (localStorage); nothing is sent anywhere.
   ============================================================ */
(function () {
  "use strict";
  window.PP = window.PP || {};
  const { ui } = window.PP;
  const STORE_KEY = "paypause_community_v1";
  const MINUTE = 60000;
  const HOUR = 60 * MINUTE;
  const ME = "u/you";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

  /* ---------------- communities ---------------- */
  const COMMUNITIES = [
    {
      id: "SubscriptionTrap",
      name: "r/SubscriptionTrap",
      members: 84200,
      color: ["#ff5d7d", "#8f2440"],
      desc: "Field reports on dark patterns, cancellation mazes and sneaky renewals — and how people escaped them.",
    },
    {
      id: "PauseWins",
      name: "r/PauseWins",
      members: 61700,
      color: ["#43e0a2", "#177a55"],
      desc: "Screenshots and stories of charges you blocked with PayPause. Every declined renewal is a win.",
    },
    {
      id: "CancelWarStories",
      name: "r/CancelWarStories",
      members: 42900,
      color: ["#ffb547", "#a3640d"],
      desc: "The hold music, the guilt trips, the chatbots that suddenly can't help. Share your cancellation battles.",
    },
    {
      id: "PauseCards",
      name: "r/PauseCards",
      members: 38100,
      color: ["#8473ff", "#3d348f"],
      desc: "Burner-card setups, cap strategies and clever lock schedules for every kind of free trial.",
    },
    {
      id: "AskPayPause",
      name: "r/AskPayPause",
      members: 27400,
      color: ["#3ee2d4", "#1a7a72"],
      desc: "Questions about trials, renewals, refunds and shielding — answered by the community.",
    },
    {
      id: "ZombieSubs",
      name: "r/ZombieSubs",
      members: 19800,
      color: ["#b18cff", "#5b3fd4"],
      desc: "Hunt down subscriptions that refuse to die. Post the zombie, get help killing it.",
    },
  ];
  const commById = (id) => COMMUNITIES.find((c) => c.id === id) || COMMUNITIES[0];
  const commInitials = (id) =>
    id
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const FLAIRS = ["Win", "Warning", "Story", "Question", "Guide", "Discussion"];

  /* ---------------- seed data ---------------- */
  const ago = (ms) => Date.now() - ms;
  function seed() {
    const posts = [
      {
        id: uid("po"),
        community: "PauseWins",
        author: "u/maya_r",
        initials: "MR",
        avatarClass: "avatar--1",
        flair: "Win",
        title: "Blocked a $59.99 Adobe renewal while I slept. Best email I've woken up to.",
        body: "My 7-day Creative Cloud trial ended at 2am. The Pause Card was capped at $0, so the conversion charge just… bounced. Woke up to a declined-charge notification instead of a $60 bill. I used the app maybe 90 seconds total. This is what financial self-defense feels like.",
        ts: ago(26 * MINUTE),
        score: 1284,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/devon_k", initials: "DK", avatarClass: "avatar--2",
            body: "Same thing happened to me with a $49 AI writing tool. The decline email is honestly my favorite genre now.",
            ts: ago(18 * MINUTE), liked: false,
            replies: [
              { id: uid("rp"), author: "u/maya_r", initials: "MR", avatarClass: "avatar--1", body: "Right?! Decline emails > renewal receipts forever.", ts: ago(15 * MINUTE), liked: false },
            ],
          },
          {
            id: uid("cm"), author: "u/priya_s", initials: "PS", avatarClass: "avatar--3",
            body: "Did you set the cap at zero manually or use the trial preset?",
            ts: ago(11 * MINUTE), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "SubscriptionTrap",
        author: "u/devon_k",
        initials: "DK",
        avatarClass: "avatar--2",
        flair: "Warning",
        title: "That AI tool's '7-day free trial' silently switched to yearly billing. Read the fine print.",
        body: "Signed up for an AI video editor trial at $19/month teaser. Buried in paragraph 11 of the terms: the trial converts to a $228 ANNUAL plan, not monthly. I only caught it because my Pause Card declined the lump sum. If I'd used my real card, that money would be gone and I'd be fighting support for weeks.",
        ts: ago(2 * HOUR),
        score: 2471,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/aisha_m", initials: "AM", avatarClass: "avatar--4",
            body: "The yearly switcheroo should be illegal without a separate checkbox. Saving this post.",
            ts: ago(95 * MINUTE), liked: false, replies: [],
          },
          {
            id: uid("cm"), author: "u/you", initials: "YO", avatarClass: "avatar--2",
            body: "Pro tip: always cap the card at the monthly teaser price. If they try the annual lump sum, it declines automatically.",
            ts: ago(70 * MINUTE), liked: true, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "CancelWarStories",
        author: "u/aisha_m",
        initials: "AM",
        avatarClass: "avatar--4",
        flair: "Story",
        title: "Gym membership required cancellation by certified mail in 2026. I'm not joking.",
        body: "Tried to cancel a boutique gym chain I haven't visited in 4 months. App: no cancel button. Chat support: 'an agent will call you within 48 hours.' Phone: endless hold. Finally found in the contract: cancellation ONLY by certified letter to a PO box in another state. PayPause's Kill the Bill generated the letter and script — $39.99/month, gone in two clicks. How is this legal?",
        ts: ago(5 * HOUR),
        score: 1893,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/marcus_t", initials: "MT", avatarClass: "avatar--5",
            body: "Certified mail is such a classic moat. They count on 90% of people giving up.",
            ts: ago(4 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "PauseCards",
        author: "u/priya_s",
        initials: "PS",
        avatarClass: "avatar--3",
        flair: "Guide",
        title: "My setup: one Pause Card per trial, every single time. Here's the exact schedule I use.",
        body: "Rule 1: never reuse a burner card across two merchants.\nRule 2: cap at $0 for pure trials, $1 for freemium converts.\nRule 3: set the auto-lock to the trial end date MINUS one day, so timezone games can't sneak a charge through.\nRule 4: if I love the product after day 5, I extend the lock — I never decide on the final day.\nThis has blocked 11 charges this year. Zero false declines on things I actually kept.",
        ts: ago(9 * HOUR),
        score: 3102,
        userVote: 0,
        saved: true,
        comments: [
          {
            id: uid("cm"), author: "u/elena_v", initials: "EV", avatarClass: "avatar--6",
            body: "The minus-one-day rule is genius. Got bitten by a midnight-before-expiry charge once.",
            ts: ago(8 * HOUR), liked: false,
            replies: [
              { id: uid("rp"), author: "u/priya_s", initials: "PS", avatarClass: "avatar--3", body: "Exactly why I do it. Their servers run on their timezone, not yours.", ts: ago(7.5 * HOUR), liked: false },
            ],
          },
          {
            id: uid("cm"), author: "u/noah_p", initials: "NP", avatarClass: "avatar--1",
            body: "Do you keep the cards around afterward or destroy them?",
            ts: ago(6 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "ZombieSubs",
        author: "u/marcus_t",
        initials: "MT",
        avatarClass: "avatar--5",
        flair: "Warning",
        title: "Found a $14.99/mo meal kit I've been paying for since 2023. Never used it once.",
        body: "Audit weekend. Found a meal-kit subscription I signed up for during a Thanksgiving promo. Last actual delivery: never. I paused it in the app in December 2023 — 'paused' apparently means 'bill forever, ship nothing.' Killed it today and reclaimed $180/year. Go check your statements, people. The zombies are real.",
        ts: ago(14 * HOUR),
        score: 967,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/zara_k", initials: "ZK", avatarClass: "avatar--4",
            body: "\"Paused\" doing more billing than \"active\" is the grift of the decade.",
            ts: ago(12 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "AskPayPause",
        author: "u/elena_v",
        initials: "EV",
        avatarClass: "avatar--6",
        flair: "Question",
        title: "Merchant says my virtual card 'isn't a valid payment method.' Has anyone hit this?",
        body: "A streaming service rejected my Pause Card at signup saying they only accept cards from major banks. Every other merchant has been fine. Is there a workaround, or do I just skip this trial? Not handing over my real debit card on principle.",
        ts: ago(20 * HOUR),
        score: 412,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/you", initials: "YO", avatarClass: "avatar--2",
            body: "A few merchants do BIN filtering. Try a fresh card with a $1 cap instead of $0 — some reject zero-limit cards at validation. If it still fails, the trial isn't worth the exposure.",
            ts: ago(18 * HOUR), liked: true, replies: [],
          },
          {
            id: uid("cm"), author: "u/liam_o", initials: "LO", avatarClass: "avatar--5",
            body: "Happened to me with one telecom. Everything else works fine. Vote with your wallet and skip them.",
            ts: ago(16 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "PauseWins",
        author: "u/zara_k",
        initials: "ZK",
        avatarClass: "avatar--4",
        flair: "Win",
        title: "Yearly savings counter just crossed $1,200. I am genuinely annoyed at past me.",
        body: "Six months on PayPause: 9 blocked trial conversions, 4 canceled zombies, 1 gym escape. Total kept: $1,204. Past me was burning roughly $200/month on pure autopilot. Current me has a vacation fund instead. Keep your cards capped, friends.",
        ts: ago(26 * HOUR),
        score: 1556,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/grace_l", initials: "GL", avatarClass: "avatar--3",
            body: "The savings counter is dangerously motivating. I treat it like a game now.",
            ts: ago(24 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "SubscriptionTrap",
        author: "u/rohan_d",
        initials: "RD",
        avatarClass: "avatar--1",
        flair: "Discussion",
        title: "Why do cancellation buttons always know EXACTLY where to hide?",
        body: "Subscribe: one giant green button above the fold. Cancel: Profile → Settings → Billing → Subscription → Manage → 'Are you sure?' → guilt screen → chatbot → callback request. That's nine taps vs one. It's not incompetence, it's an engineered funnel of exhaustion. What's the worst cancellation maze you've seen?",
        ts: ago(31 * HOUR),
        score: 2087,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/nina_f", initials: "NF", avatarClass: "avatar--6",
            body: "A news site made me cancel by replying to a support email with a specific subject line. In 2026.",
            ts: ago(29 * HOUR), liked: false, replies: [],
          },
          {
            id: uid("cm"), author: "u/tyler_b", initials: "TB", avatarClass: "avatar--5",
            body: "The guilt screen with the crying mascot. I felt bad for a robot for half a second.",
            ts: ago(27 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "PauseCards",
        author: ME,
        initials: "YO",
        avatarClass: "avatar--2",
        flair: "Guide",
        title: "Student budget hack: I use $0-cap cards for every AI trial during exam season",
        body: "Every semester I trial 4–5 AI study tools, keep the best one, and let the cards die on the rest. Zero accidental conversions, zero spreadsheet of renewal dates. My laptop is basically a trial-testing lab now and my bank account doesn't even know.",
        ts: ago(2 * 24 * HOUR),
        score: 743,
        userVote: 0,
        saved: false,
        comments: [
          {
            id: uid("cm"), author: "u/ivy_chen", initials: "IC", avatarClass: "avatar--4",
            body: "Doing this for midterms right now. The auto-lock timer doubles as a study deadline.",
            ts: ago(40 * HOUR), liked: false, replies: [],
          },
        ],
      },
      {
        id: uid("po"),
        community: "CancelWarStories",
        author: "u/sofia_r",
        initials: "SR",
        avatarClass: "avatar--3",
        flair: "Story",
        title: "Support agent offered me THREE discounts before finding the cancel button",
        body: "Called to cancel a cloud storage plan I don't use. 10% off → 25% off → two free months. Each one required 'just a moment while I check.' I held the line, and suddenly the cancel option existed. The whole call was a 22-minute discount gauntlet. The app's Kill the Bill wizard would've taken 30 seconds.",
        ts: ago(3 * 24 * HOUR),
        score: 1340,
        userVote: 0,
        saved: false,
        comments: [],
      },
    ];
    return { version: 1, posts };
  }

  /* ---------------- persistence ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.posts)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }
  let state = load() || seed();
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* in-memory fallback */
    }
  }

  /* ---------------- helpers ---------------- */
  function relTime(ts) {
    const d = Date.now() - ts;
    if (d < MINUTE) return "just now";
    if (d < HOUR) return Math.floor(d / MINUTE) + "m ago";
    if (d < 24 * HOUR) return Math.floor(d / HOUR) + "h ago";
    return Math.floor(d / (24 * HOUR)) + "d ago";
  }
  const fmtMembers = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));
  const fmtScore = (n) => (Math.abs(n) >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const countComments = (p) =>
    p.comments.reduce((n, c) => n + 1 + (c.replies ? c.replies.length : 0), 0);

  const ICONS = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    comment:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    share:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4M12 2v13"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    award:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    flame:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    trophy:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    bookmark:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>',
    reply:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>',
  };

  /* ---------------- view state ---------------- */
  let view = { scope: "home", sort: "hot", query: "", openPost: null };

  function visiblePosts() {
    let list = state.posts.slice();
    if (view.scope === "saved") list = list.filter((p) => p.saved);
    else if (view.scope !== "home") list = list.filter((p) => p.community === view.scope);
    if (view.query.trim()) {
      const q = view.query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q)
      );
    }
    const ageH = (p) => (Date.now() - p.ts) / HOUR;
    if (view.sort === "new") list.sort((a, b) => b.ts - a.ts);
    else if (view.sort === "top") list.sort((a, b) => b.score - a.score);
    else list.sort((a, b) => b.score / Math.pow(ageH(b) + 2, 1.4) - a.score / Math.pow(ageH(a) + 2, 1.4));
    return list;
  }

  /* ---------------- render: left rail ---------------- */
  function renderRail() {
    const el = $("#c-rail");
    if (!el) return;
    const links = [
      { id: "home", label: "Home", icon: ICONS.home, extra: "" },
      { id: "saved", label: "Saved", icon: ICONS.bookmark, extra: state.posts.filter((p) => p.saved).length },
    ];
    el.innerHTML =
      links
        .map(
          (l) => `
        <button class="c-side-link ${view.scope === l.id ? "active" : ""}" data-scope="${l.id}">
          ${l.icon}<span>${l.label}</span>${l.extra ? `<small>${l.extra}</small>` : ""}
        </button>`
        )
        .join("") +
      `<div class="c-card__title" style="padding:14px 11px 4px">Communities</div>` +
      COMMUNITIES.map(
        (c) => `
        <button class="c-side-link ${view.scope === c.id ? "active" : ""}" data-scope="${c.id}">
          <span class="c-comm-ico" style="background:linear-gradient(135deg,${c.color[0]},${c.color[1]})">${commInitials(c.id)}</span>
          <span>${c.name}</span><small>${fmtMembers(c.members)}</small>
        </button>`
      ).join("") +
      `<button class="c-reset" id="c-reset">Reset community demo data</button>`;
  }

  /* ---------------- render: comments ---------------- */
  function commentHtml(c, postId, depth) {
    return `
      <div class="c-comment" data-comment-id="${c.id}">
        <span class="avatar ${c.avatarClass}">${esc(c.initials)}</span>
        <div>
          <div class="c-comment__head"><b>${esc(c.author)}</b><span>·</span><span>${relTime(c.ts)}</span></div>
          <div class="c-comment__body">${esc(c.body)}</div>
          <div class="c-comment__foot">
            <button class="${c.liked ? "liked" : ""}" data-likecomment="${postId}|${c.id}">
              ${ICONS.up} ${c.liked ? "Liked" : "Like"}
            </button>
            <button data-reply="${postId}|${c.id}">${ICONS.reply} Reply</button>
          </div>
          <form class="c-reply-form" data-replyform="${postId}|${c.id}">
            <input type="text" placeholder="Write a reply…" maxlength="240" />
            <button class="btn btn--primary btn--sm" type="submit">Reply</button>
          </form>
          ${
            c.replies && c.replies.length
              ? `<div class="c-comment__thread">${c.replies
                  .map((r) => `
                <div class="c-comment">
                  <span class="avatar ${r.avatarClass}">${esc(r.initials)}</span>
                  <div>
                    <div class="c-comment__head"><b>${esc(r.author)}</b><span>·</span><span>${relTime(r.ts)}</span></div>
                    <div class="c-comment__body">${esc(r.body)}</div>
                  </div>
                </div>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </div>`;
  }

  /* ---------------- render: feed ---------------- */
  function renderFeed() {
    const feed = $("#c-feed");
    if (!feed) return;
    const list = visiblePosts();
    if (!list.length) {
      feed.innerHTML = `
        <div class="c-empty">
          <b>No posts here yet</b>
          Try another community, clear the search, or be the first to post.
        </div>`;
      return;
    }
    feed.innerHTML = list
      .map((p, i) => {
        const c = commById(p.community);
        const open = view.openPost === p.id;
        const voteCls = p.userVote === 1 ? "up" : p.userVote === -1 ? "down" : "";
        return `
        <article class="c-post" data-post-id="${p.id}" style="animation-delay:${Math.min(i * 45, 270)}ms">
          <div class="c-vote ${voteCls}">
            <button data-vote="1" data-post="${p.id}" class="${p.userVote === 1 ? "active" : ""}" aria-label="Upvote">${ICONS.up}</button>
            <span class="c-vote__score">${fmtScore(p.score)}</span>
            <button data-vote="-1" data-post="${p.id}" class="${p.userVote === -1 ? "active" : ""}" aria-label="Downvote">${ICONS.down}</button>
          </div>
          <div class="c-post__main">
            <div class="c-post__meta">
              <span class="c-comm-ico" style="background:linear-gradient(135deg,${c.color[0]},${c.color[1]})">${commInitials(c.id)}</span>
              <b>${c.name}</b><span class="dot-sep"></span><span>${esc(p.author)}</span><span class="dot-sep"></span><span>${relTime(p.ts)}</span>
              <span class="c-flair c-flair--${p.flair.toLowerCase()}">${p.flair}</span>
            </div>
            <h3>${esc(p.title)}</h3>
            <div class="c-post__body">${esc(p.body)}</div>
            <div class="c-post__actions">
              <button class="c-action" data-togglecomments="${p.id}">
                ${ICONS.comment} ${countComments(p)} comment${countComments(p) === 1 ? "" : "s"}
              </button>
              <button class="c-action" data-share="${p.id}">${ICONS.share} Share</button>
              <button class="c-action ${p.saved ? "saved" : ""}" data-savepost="${p.id}">
                ${ICONS.save} ${p.saved ? "Saved" : "Save"}
              </button>
              <button class="c-action" data-award="${p.id}">${ICONS.award} Award</button>
            </div>
            <div class="c-comments ${open ? "open" : ""}">
              ${p.comments.map((cm) => commentHtml(cm, p.id)).join("")}
              <form class="c-comment-form" data-commentform="${p.id}">
                <input type="text" placeholder="Add a comment…" maxlength="280" />
                <button class="btn btn--primary btn--sm" type="submit">Comment</button>
              </form>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  /* ---------------- render: right rail ---------------- */
  function renderRight() {
    const about = $("#c-about");
    if (about) {
      const c = view.scope !== "home" && view.scope !== "saved" ? commById(view.scope) : null;
      if (c) {
        about.innerHTML = `
          <div class="c-card__title">About community</div>
          <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
            <span class="c-comm-ico" style="width:40px;height:40px;font-size:13px;background:linear-gradient(135deg,${c.color[0]},${c.color[1]})">${commInitials(c.id)}</span>
            <b style="font-size:15px">${c.name}</b>
          </div>
          <p>${c.desc}</p>
          <div class="c-about__stats">
            <div><b>${fmtMembers(c.members)}</b><small>members</small></div>
            <div><b>${fmtMembers(Math.round(c.members / 22))}</b><small>online now</small></div>
          </div>
          <button class="btn btn--primary btn--block btn--sm" data-openpost>Create a post</button>`;
      } else {
        about.innerHTML = `
          <div class="c-card__title">About PayPause Community</div>
          <p>A support network for people fighting subscription dark patterns. Share trap reports, celebrate blocked charges, and learn burner-card strategies.</p>
          <div class="c-about__stats">
            <div><b>${fmtMembers(COMMUNITIES.reduce((s, c) => s + c.members, 0))}</b><small>total members</small></div>
            <div><b>${state.posts.length}</b><small>posts this week</small></div>
          </div>
          <button class="btn btn--primary btn--block btn--sm" data-openpost>Create a post</button>`;
      }
    }
    const trending = $("#c-trending");
    if (trending) {
      const top = state.posts.slice().sort((a, b) => b.score - a.score).slice(0, 5);
      trending.innerHTML =
        `<div class="c-card__title">Trending today</div>` +
        top
          .map(
            (p, i) => `
          <div class="c-trending-row" data-gotopost="${p.id}">
            <span class="c-trending-row__rank">${i + 1}</span>
            <div>
              <div class="c-trending-row__title">${esc(p.title)}</div>
              <small>${commById(p.community).name} · ${fmtScore(p.score)} points</small>
            </div>
          </div>`
          )
          .join("");
    }
  }

  function renderKarma() {
    const el = $("#c-karma");
    if (!el) return;
    const mine = state.posts.filter((p) => p.author === ME);
    const karma = 482 + mine.reduce((s, p) => s + p.score, 0);
    el.textContent = fmtScore(karma) + " karma";
  }

  function renderAll() {
    renderRail();
    renderFeed();
    renderRight();
    renderKarma();
  }

  /* ---------------- voting ---------------- */
  function vote(postId, dir) {
    const p = state.posts.find((x) => x.id === postId);
    if (!p) return;
    if (p.userVote === dir) {
      p.score -= dir;
      p.userVote = 0;
    } else {
      p.score += dir - p.userVote;
      p.userVote = dir;
    }
    save();
    renderFeed();
  }

  /* ---------------- create post ---------------- */
  function openPostModal(prefillCommunity) {
    const modal = $("#modal-post");
    if (!modal) return;
    const sel = $("#cp-community");
    sel.innerHTML = COMMUNITIES.map(
      (c) => `<option value="${c.id}" ${prefillCommunity === c.id ? "selected" : ""}>${c.name}</option>`
    ).join("");
    $("#cp-title").value = "";
    $("#cp-body").value = "";
    $("#cp-flair").value = "Discussion";
    if (window.PP.ui) window.PP.ui.openModal("modal-post");
  }

  function submitPost(e) {
    e.preventDefault();
    const title = $("#cp-title").value.trim();
    const body = $("#cp-body").value.trim();
    if (title.length < 8) {
      if (ui) ui.toast("Title too short", "Give your post at least 8 characters.", "warn");
      return;
    }
    const community = $("#cp-community").value;
    const post = {
      id: uid("po"),
      community,
      author: ME,
      initials: "YO",
      avatarClass: "avatar--2",
      flair: $("#cp-flair").value,
      title,
      body: body || " ",
      ts: Date.now(),
      score: 1,
      userVote: 1,
      saved: false,
      comments: [],
    };
    state.posts.unshift(post);
    save();
    view.scope = community;
    view.sort = "new";
    view.openPost = post.id;
    if (window.PP.ui) window.PP.ui.closeModal("modal-post");
    renderAll();
    if (ui) ui.toast("Posted", `Your story is live in ${commById(community).name}.`, "ok");
  }

  /* ---------------- event delegation ---------------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.vote) return vote(btn.dataset.post, parseInt(btn.dataset.vote, 10));

    if (btn.dataset.scope) {
      view.scope = btn.dataset.scope;
      view.query = "";
      const search = $("#c-search");
      if (search) search.value = "";
      return renderAll();
    }

    if (btn.dataset.sort) {
      view.sort = btn.dataset.sort;
      $$(".c-tab").forEach((t) => t.classList.toggle("active", t === btn));
      return renderFeed();
    }

    if (btn.dataset.togglecomments) {
      const id = btn.dataset.togglecomments;
      view.openPost = view.openPost === id ? null : id;
      return renderFeed();
    }

    if (btn.dataset.savepost) {
      const p = state.posts.find((x) => x.id === btn.dataset.savepost);
      if (!p) return;
      p.saved = !p.saved;
      save();
      renderFeed();
      renderRail();
      if (ui) ui.toast(p.saved ? "Post saved" : "Removed from saved", p.saved ? "Find it under Saved in the left rail." : "", p.saved ? "ok" : "info");
      return;
    }

    if (btn.dataset.share) {
      if (ui) ui.toast("Link copied", "Demo only — a share link would be copied to your clipboard.", "info");
      return;
    }
    if (btn.dataset.award) {
      if (ui) ui.toast("Awards coming soon", "This demo doesn't move real money or coins.", "info");
      return;
    }
    if (btn.dataset.likecomment) {
      const [postId, commentId] = btn.dataset.likecomment.split("|");
      const p = state.posts.find((x) => x.id === postId);
      const c = p && p.comments.find((x) => x.id === commentId);
      if (!c) return;
      c.liked = !c.liked;
      save();
      return renderFeed();
    }
    if (btn.dataset.reply) {
      const [postId, commentId] = btn.dataset.reply.split("|");
      const form = $(`[data-replyform="${postId}|${commentId}"]`);
      if (form) form.classList.toggle("open");
      return;
    }
    if (btn.dataset.gotopost) {
      view.openPost = btn.dataset.gotopost;
      view.scope = "home";
      renderAll();
      const postEl = $(`[data-post-id="${view.openPost}"]`);
      if (postEl) postEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (btn.hasAttribute("data-openpost") || btn.id === "c-open-composer") return openPostModal(view.scope !== "home" && view.scope !== "saved" ? view.scope : null);
    if (btn.id === "c-reset") {
      if (!btn.dataset.confirm) {
        btn.dataset.confirm = "1";
        btn.textContent = "Click to confirm reset";
        setTimeout(() => {
          delete btn.dataset.confirm;
          btn.textContent = "Reset community demo data";
        }, 3000);
        return;
      }
      state = seed();
      save();
      view = { scope: "home", sort: "hot", query: "", openPost: null };
      renderAll();
      if (ui) ui.toast("Community reset", "Fresh seed posts and votes restored.", "info");
    }
  });

  /* form submissions (comments, replies, new post) */
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.dataset.commentform) {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      const p = state.posts.find((x) => x.id === form.dataset.commentform);
      if (!p) return;
      p.comments.push({
        id: uid("cm"), author: ME, initials: "YO", avatarClass: "avatar--2",
        body: text, ts: Date.now(), liked: false, replies: [],
      });
      save();
      view.openPost = p.id;
      renderFeed();
      if (ui) ui.toast("Comment added", "", "ok");
      return;
    }
    if (form.dataset.replyform) {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      const [postId, commentId] = form.dataset.replyform.split("|");
      const p = state.posts.find((x) => x.id === postId);
      const c = p && p.comments.find((x) => x.id === commentId);
      if (!c) return;
      c.replies = c.replies || [];
      c.replies.push({ id: uid("rp"), author: ME, initials: "YO", avatarClass: "avatar--2", body: text, ts: Date.now(), liked: false });
      save();
      renderFeed();
      return;
    }
    if (form.id === "post-form") return submitPost(e);
  });

  /* search */
  const search = $("#c-search");
  if (search) {
    search.addEventListener("input", (e) => {
      view.query = e.target.value;
      renderFeed();
    });
  }

  /* composer card click (the input itself is non-interactive) */
  const composer = $("#c-composer");
  if (composer) composer.addEventListener("click", () => openPostModal(view.scope !== "home" && view.scope !== "saved" ? view.scope : null));

  /* boot */
  renderAll();
  window.PP.community = { state, COMMUNITIES };
})();
