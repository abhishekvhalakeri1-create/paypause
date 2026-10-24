/* ============================================================
   PayPause — data layer: seed data, state, card engine
   Everything lives in the browser. Nothing is sent anywhere.
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "paypause_state_v1";
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;

  /* ---------- small utilities ---------- */
  const uid = (p = "id") =>
    p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

  const money = (n, cents = true) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });

  const addDays = (d, n) => new Date(d.getTime() + n * DAY);

  const fmtDate = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const fmtShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  function humanizeRenewal(date) {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((target - todayMidnight) / DAY);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 30) return `In ${diff} days`;
    const months = Math.round(diff / 30);
    return `In ${months} month${months > 1 ? "s" : ""}`;
  }

  function countdownParts(ms) {
    if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
    const d = Math.floor(ms / DAY);
    const h = Math.floor((ms % DAY) / HOUR);
    const m = Math.floor((ms % HOUR) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { d, h, m, s, over: false };
  }

  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- Luhn-valid card number engine ---------- */
  function luhnChecksum(num15) {
    // num15: string of 15 digits; returns the check digit (0-9)
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let d = parseInt(num15[i], 10);
      // from the right of the full 16-digit number, position of digit i is (16 - i)
      if ((16 - i) % 2 === 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return (10 - (sum % 10)) % 10;
  }

  function generateCardNumber() {
    // PayPause BIN range (fictional, demo-only): 5398 84xx xxxx xxxx
    let prefix = "539884";
    let body = prefix;
    for (let i = 0; i < 9; i++) body += Math.floor(Math.random() * 10);
    const check = luhnChecksum(body);
    const full = body + check;
    return full.match(/.{4}/g).join(" ");
  }

  function generateCVC() {
    return String(Math.floor(100 + Math.random() * 900));
  }

  function generateExpiry(monthsAhead = 24) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return `${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
  }

  function makePauseCard(overrides = {}) {
    const now = Date.now();
    return Object.assign(
      {
        id: uid("gc"),
        number: generateCardNumber(),
        cvc: generateCVC(),
        exp: generateExpiry(),
        merchant: "Generic merchant",
        cap: 0,
        autoLockAt: now + 7 * DAY,
        status: "active", // active | locked | destroyed
        oneTime: false,
        createdAt: now,
        blockedAmount: null,
      },
      overrides
    );
  }

  /* ---------- Category palette ---------- */
  const CATEGORY_COLORS = {
    Streaming: "#8473ff",
    Music: "#1db954",
    AI: "#3ee2d4",
    Design: "#ff5d7d",
    Fitness: "#ffb547",
    Cloud: "#3697f5",
    Shopping: "#ff9900",
    Productivity: "#b18cff",
  };

  /* ---------- Seed data ---------- */
  function seed() {
    const now = new Date();

    const subs = [
      {
        id: uid("sub"),
        merchant: "Netflix",
        plan: "Standard with ads",
        amount: 15.49,
        renewal: addDays(now, 3).toISOString(),
        category: "Streaming",
        status: "active",
        risk: "safe",
        protected: true,
        color: ["#e50914", "#8f0b12"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "Spotify",
        plan: "Premium Individual",
        amount: 11.99,
        renewal: addDays(now, 9).toISOString(),
        category: "Music",
        status: "active",
        risk: "safe",
        protected: false,
        color: ["#1db954", "#0c6b31"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "ChatGPT Plus",
        plan: "Monthly subscription",
        amount: 20.0,
        renewal: addDays(now, 1).toISOString(),
        category: "AI",
        status: "active",
        risk: "risk",
        protected: false,
        color: ["#10a37f", "#0b5f4c"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "Adobe Creative Cloud",
        plan: "All Apps — 20+ apps",
        amount: 59.99,
        renewal: addDays(now, 16).toISOString(),
        category: "Design",
        status: "active",
        risk: "danger",
        protected: false,
        color: ["#fa0f00", "#8a120a"],
        unusedDays: 47,
      },
      {
        id: uid("sub"),
        merchant: "Equinox+",
        plan: "Fitness membership",
        amount: 29.99,
        renewal: addDays(now, 5).toISOString(),
        category: "Fitness",
        status: "active",
        risk: "danger",
        protected: false,
        color: ["#9b5cff", "#4a12a0"],
        unusedDays: 63,
      },
      {
        id: uid("sub"),
        merchant: "iCloud+",
        plan: "50 GB storage",
        amount: 2.99,
        renewal: addDays(now, 21).toISOString(),
        category: "Cloud",
        status: "active",
        risk: "safe",
        protected: true,
        color: ["#3697f5", "#144d85"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "Amazon Prime",
        plan: "Prime monthly",
        amount: 14.99,
        renewal: addDays(now, 12).toISOString(),
        category: "Shopping",
        status: "active",
        risk: "safe",
        protected: false,
        color: ["#ff9900", "#a35f00"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "YouTube Premium",
        plan: "Individual plan",
        amount: 13.99,
        renewal: addDays(now, 8).toISOString(),
        category: "Streaming",
        status: "active",
        risk: "safe",
        protected: false,
        color: ["#ff3355", "#8f001d"],
        unusedDays: null,
      },
      {
        id: uid("sub"),
        merchant: "Canva Pro",
        plan: "Pro — yearly paid monthly",
        amount: 14.99,
        renewal: addDays(now, 19).toISOString(),
        category: "Design",
        status: "active",
        risk: "safe",
        protected: false,
        color: ["#00c4cc", "#006b70"],
        unusedDays: null,
      },
    ];

    const trials = [
      {
        id: uid("tr"),
        merchant: "Notion AI",
        plan: "Plus plan trial",
        chargeAfter: 10.0,
        startedAt: now - 5 * DAY,
        endsAt: now + 38 * HOUR,
        totalDays: 7,
        category: "Productivity",
        color: ["#b18cff", "#5b3fd4"],
      },
      {
        id: uid("tr"),
        merchant: "Figma Professional",
        plan: "Professional trial",
        chargeAfter: 15.0,
        startedAt: now - 12 * DAY,
        endsAt: now + 2 * DAY + 6 * HOUR,
        totalDays: 14,
        category: "Design",
        color: ["#ff7262", "#b23a2d"],
      },
      {
        id: uid("tr"),
        merchant: "Cursor Pro",
        plan: "Pro plan trial",
        chargeAfter: 20.0,
        startedAt: now - 3 * DAY,
        endsAt: now + 10 * DAY + 9 * HOUR,
        totalDays: 14,
        category: "AI",
        color: ["#7b8cff", "#33408f"],
      },
    ];

    const cards = [
      makePauseCard({
        merchant: "Notion AI",
        cap: 1.0,
        autoLockAt: now + 38 * HOUR,
      }),
      makePauseCard({
        merchant: "Figma Professional",
        cap: 0.0,
        autoLockAt: now + 2 * DAY + 6 * HOUR,
      }),
      makePauseCard({
        merchant: "Cursor Pro",
        cap: 0.0,
        autoLockAt: now + 10 * DAY + 9 * HOUR,
      }),
      makePauseCard({
        merchant: "Adobe Creative Cloud",
        cap: 0.0,
        autoLockAt: now - 2 * DAY,
        status: "destroyed",
        blockedAmount: 59.99,
        oneTime: true,
      }),
    ];

    // link trial -> card by merchant
    trials.forEach((t) => {
      const card = cards.find((c) => c.merchant === t.merchant && c.status === "active");
      t.cardId = card ? card.id : null;
    });

    const activity = [
      {
        id: uid("ac"),
        kind: "block",
        title: "Charge blocked · Adobe Creative Cloud",
        sub: "Pause Card self-destructed at trial end",
        amount: "$59.99",
        when: "2 days ago",
      },
      {
        id: uid("ac"),
        kind: "ok",
        title: "Subscription canceled · Blue Apron",
        sub: "Kill the Bill — confirmed by merchant",
        amount: "-$11.99/mo",
        when: "4 days ago",
      },
      {
        id: uid("ac"),
        kind: "card",
        title: "Pause Card created · Notion AI",
        sub: "Hard cap $1.00 · auto-lock armed",
        amount: "",
        when: "Yesterday",
      },
      {
        id: uid("ac"),
        kind: "warn",
        title: "Renewal reminder · ChatGPT Plus",
        sub: "Renews tomorrow — no Pause Card attached",
        amount: "$20.00",
        when: "Today",
      },
      {
        id: uid("ac"),
        kind: "ok",
        title: "Auto-lock armed · Figma trial",
        sub: "Card will decline every charge after lock",
        amount: "",
        when: "2 days ago",
      },
    ];

    const spendSeries = [214, 198, 232, 205, 226, 184.42];

    return {
      version: 1,
      savedAt: now.toISOString(),
      user: { name: "Jordan Avery", plan: "Plus", initials: "JA" },
      savedThisYear: 1284.0,
      subs,
      trials,
      cards,
      activity,
      spendSeries,
      onboarded: false,
    };
  }

  /* ---------- persistence ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  let state = load() || seed();

  function save() {
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage full / unavailable — demo still works in-memory */
    }
  }

  function reset() {
    state = seed();
    window.PP.state = state;
    save();
    return state;
  }

  window.PP = {
    state,
    save,
    reset,
    seed,
    utils: {
      uid,
      money,
      addDays,
      fmtDate,
      fmtShort,
      humanizeRenewal,
      countdownParts,
      pad2,
      generateCardNumber,
      generateCVC,
      generateExpiry,
      makePauseCard,
      CATEGORY_COLORS,
      DAY,
      HOUR,
    },
  };
})();
