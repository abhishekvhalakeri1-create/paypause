/* ============================================================
   PayPause — live network savings engine
   Simulated, in-browser social-proof feed. No network calls:
   events are generated locally to demonstrate the live product.
   ============================================================ */
(function () {
  "use strict";
  window.PP = window.PP || {};

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FIRST_NAMES = [
    "Maya", "Devon", "Priya", "Jordan", "Aisha", "Marcus", "Elena", "Noah", "Zara",
    "Liam", "Sofia", "Ethan", "Amara", "Lucas", "Mei", "Omar", "Grace", "Kai",
    "Ivy", "Rohan", "Nina", "Tyler", "Lena", "Jonas", "Hannah", "Felix",
  ];
  const INITIALS = "ABCDEFGHJKLMNPRSTVW";
  const CITIES = [
    "Austin, TX", "Toronto, ON", "London, UK", "Brooklyn, NY", "Chicago, IL",
    "Mumbai, MH", "Berlin, DE", "Sydney, AU", "Seattle, WA", "Denver, CO",
    "Miami, FL", "Dublin, IE", "San Diego, CA", "Portland, OR", "Atlanta, GA",
  ];
  const MERCHANTS = [
    { name: "Adobe Creative Cloud", amounts: [59.99, 54.99], short: "Adobe CC" },
    { name: "ChatGPT Plus", amounts: [20.0], short: "ChatGPT Plus" },
    { name: "Notion AI", amounts: [10.0, 8.0], short: "Notion AI" },
    { name: "Equinox+", amounts: [29.99], short: "Equinox+" },
    { name: "Figma Professional", amounts: [15.0, 12.0], short: "Figma" },
    { name: "YouTube Premium", amounts: [13.99], short: "YouTube Premium" },
    { name: "Canva Pro", amounts: [14.99], short: "Canva Pro" },
    { name: "Spotify", amounts: [11.99, 9.99], short: "Spotify" },
    { name: "Headspace", amounts: [12.99], short: "Headspace" },
    { name: "Duolingo Max", amounts: [30.0], short: "Duolingo Max" },
    { name: "Blue Apron", amounts: [11.99], short: "Blue Apron" },
    { name: "NordVPN", amounts: [12.99], short: "NordVPN" },
    { name: "GitHub Copilot", amounts: [19.0, 10.0], short: "GitHub Copilot" },
    { name: "Peloton App", amounts: [12.99], short: "Peloton" },
    { name: "iCloud+", amounts: [9.99, 2.99], short: "iCloud+" },
  ];
  const ACTIONS = [
    { kind: "block", weight: 5, verb: (m) => `blocked a charge from ${m}` },
    { kind: "cancel", weight: 3, verb: (m) => `canceled ${m} before renewal` },
    { kind: "save", weight: 2, verb: (m) => `stopped a ${m} renewal` },
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const money = (n) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  const compact = (n) =>
    n >= 1000 ? n.toLocaleString("en-US") : String(n);

  function relTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 45 * SECOND) return "just now";
    if (diff < MINUTE) return Math.floor(diff / SECOND) + "s ago";
    if (diff < 60 * MINUTE) return Math.floor(diff / MINUTE) + "m ago";
    const h = Math.floor(diff / (60 * MINUTE));
    return h + "h ago";
  }

  function makePerson() {
    const first = pick(FIRST_NAMES);
    const last = pick(INITIALS);
    return { name: `${first} ${last}.`, initials: (first[0] + last).toUpperCase() };
  }

  function makeEvent(ts) {
    const merchant = pick(MERCHANTS);
    const amount = pick(merchant.amounts);
    const totalWeight = ACTIONS.reduce((s, a) => s + a.weight, 0);
    let roll = Math.random() * totalWeight;
    let action = ACTIONS[0];
    for (const a of ACTIONS) {
      roll -= a.weight;
      if (roll <= 0) {
        action = a;
        break;
      }
    }
    const person = makePerson();
    return {
      id: "lv_" + Math.random().toString(36).slice(2, 10),
      name: person.name,
      initials: person.initials,
      city: pick(CITIES),
      merchant: merchant.name,
      short: merchant.short,
      amount,
      kind: action.kind,
      text: action.verb(merchant.name),
      avatarClass: "avatar--" + (1 + Math.floor(Math.random() * 6)),
      ts: ts || Date.now(),
    };
  }

  /* ---------- live state ---------- */
  const state = {
    saved: 214930.18,
    blocks: 14208,
    members: 31402,
    feed: [],
  };

  // seed the feed with believable staggered history
  let seedTs = Date.now();
  for (let i = 0; i < 9; i++) {
    seedTs -= (28 + Math.random() * 30) * SECOND;
    state.feed.push(makeEvent(seedTs));
  }

  /* ---------- rendering ---------- */
  function rowHtml(ev) {
    return `
      <div class="live-row" data-live-id="${ev.id}">
        <span class="avatar ${ev.avatarClass}">${ev.initials}</span>
        <div class="live-row__body">
          <b>${ev.name}</b>
          <small>${ev.text} · ${ev.city}</small>
        </div>
        <div class="live-row__meta">
          <b>${money(ev.amount)}</b>
          <small data-age="${ev.ts}">${relTime(ev.ts)}</small>
        </div>
      </div>`;
  }

  function renderFeeds() {
    document.querySelectorAll("[data-live-feed]").forEach((feed) => {
      const limit = parseInt(feed.dataset.liveLimit || "7", 10);
      const wasAtTop = feed.scrollTop < 24;
      feed.innerHTML = state.feed.slice(0, limit).map(rowHtml).join("");
      if (!wasAtTop) feed.scrollTop = 0;
    });
  }

  const displayed = new WeakMap();
  function tween(el, to, formatter) {
    const from = displayed.get(el) || 0;
    if (from === to) return;
    const start = performance.now();
    const dur = 800;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
      else displayed.set(el, to);
    };
    requestAnimationFrame(step);
  }

  function renderCounters() {
    document.querySelectorAll("[data-live-counter]").forEach((el) => {
      const key = el.dataset.liveCounter;
      if (key === "saved") tween(el, state.saved, (v) => money(v));
      else if (key === "blocks") tween(el, state.blocks, (v) => compact(Math.round(v)));
      else if (key === "members") tween(el, state.members, (v) => compact(Math.round(v)));
    });
  }

  function refreshAges() {
    document.querySelectorAll("[data-age]").forEach((el) => {
      el.textContent = relTime(parseInt(el.dataset.age, 10));
    });
  }

  /* ---------- ticker (built once, CSS loops it) ---------- */
  function buildTicker() {
    const track = document.getElementById("ticker-track");
    if (!track) return;
    const items = state.feed
      .slice(0, 10)
      .map(
        (ev) =>
          `<span class="ticker__item"><span class="ticker__dot"></span><b>${ev.name}</b> ${ev.text.replace(
            ev.merchant,
            ev.short
          )} <em>${money(ev.amount)}</em></span>`
      )
      .join("");
    track.innerHTML = `<div class="ticker__group">${items}</div><div class="ticker__group">${items}</div>`;
  }

  /* ---------- proof popups ---------- */
  function showProof(ev) {
    const wrap = document.getElementById("proof-wrap");
    if (!wrap || reducedMotion) return;
    const toast = document.createElement("div");
    toast.className = "proof-toast";
    toast.innerHTML = `
      <span class="avatar ${ev.avatarClass}">${ev.initials}</span>
      <span class="proof-toast__body">
        <b>${ev.name} · ${ev.city.split(",")[0]}</b>
        <small>${ev.text}</small>
      </span>
      <span class="proof-toast__amount">${money(ev.amount)}</span>`;
    wrap.appendChild(toast);
    while (wrap.children.length > 3) wrap.firstElementChild.remove();
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 550);
    }, 7800);
  }

  /* ---------- event loop ---------- */
  let tickCount = 0;
  function ingest(ev) {
    state.feed.unshift(ev);
    state.feed = state.feed.slice(0, 30);
    state.saved += ev.amount;
    state.blocks += 1;
    if (Math.random() < 0.65) state.members += 1;
    renderFeeds();
    renderCounters();
  }

  function tick() {
    const ev = makeEvent();
    ingest(ev);
    // first event always surfaces a popup so the feature reads instantly;
    // afterwards popups appear ~60% of the time
    if (tickCount === 0 || Math.random() < 0.6) showProof(ev);
    tickCount += 1;
  }

  /* ---------- boot ---------- */
  function init() {
    renderFeeds();
    renderCounters();
    buildTicker();
    setInterval(tick, 5000);
    setInterval(refreshAges, 20000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.PP.live = { state, makeEvent, ingest, relTime, money };
})();
