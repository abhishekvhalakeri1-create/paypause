/* ============================================================
   PayPause — dashboard application
   ============================================================ */
(function () {
  "use strict";
  const { state, save, reset, utils, ui } = window.PP;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------------- icons (lucide-style stroke) ---------------- */
  const I = {
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.2" y="4" width="4.2" height="16" rx="1.6"/><rect x="13.6" y="4" width="4.2" height="16" rx="1.6"/></svg>',
    bell:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    grid:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    card:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    lock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>',
    down:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    wallet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
    zap:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    ban:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
    menu:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 6h16M4 18h16"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>',
    alert:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    spark:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
    flame:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z"/></svg>',
    layers:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  };

  /* ---------------- small view helpers ---------------- */
  const initials = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const merchantIcon = (m) =>
    `<span class="merchant-ico" style="background:linear-gradient(135deg, ${m.color[0]}, ${m.color[1]})">${initials(
      m.merchant
    )}</span>`;

  const riskBadge = (sub) => {
    if (sub.status === "canceled")
      return `<span class="badge badge--neutral">${I.ban} Canceled</span>`;
    if (sub.risk === "danger")
      return `<span class="badge badge--danger">${I.flame} Rarely used</span>`;
    if (sub.risk === "risk")
      return `<span class="badge badge--risk">${I.clock} Renews soon</span>`;
    return `<span class="badge badge--safe">${I.shield} Stable</span>`;
  };

  const last4 = (num) => num.replace(/\s/g, "").slice(-4);

  function pushActivity(kind, title, sub, amount) {
    state.activity.unshift({
      id: utils.uid("ac"),
      kind,
      title,
      sub,
      amount: amount || "",
      when: "Just now",
    });
    state.activity = state.activity.slice(0, 12);
  }

  /* ============================================================
     RENDER: overview
     ============================================================ */
  function activeSubs() {
    return state.subs.filter((s) => s.status !== "canceled");
  }
  const monthlySpend = () => activeSubs().reduce((sum, s) => sum + s.amount, 0);

  function renderStats() {
    const spend = monthlySpend();
    const prev = state.spendSeries[state.spendSeries.length - 2] || spend;
    const pct = (((spend - prev) / prev) * 100).toFixed(1);
    const urgent = state.trials.filter((t) => t.endsAt - Date.now() < 2 * utils.DAY).length;
    const activeCards = state.cards.filter((c) => c.status === "active").length;

    const deltaClass = pct <= 0 ? "delta--down" : "delta--up";
    const deltaTxt = `${pct > 0 ? "+" : ""}${pct}%`;

    $("#stat-spend").innerHTML = `
      <div class="stat-tile__top">
        <span class="stat-tile__ico card__icon--violet">${I.wallet}</span>
        <span class="stat-tile__delta ${deltaClass}">${deltaTxt} vs last mo</span>
      </div>
      <div class="stat-tile__label">Monthly recurring spend</div>
      <div class="stat-tile__value">${utils.money(spend)}</div>
      <div class="stat-tile__hint">Across ${activeSubs().length} active subscriptions</div>`;

    $("#stat-trials").innerHTML = `
      <div class="stat-tile__top">
        <span class="stat-tile__ico card__icon--amber">${I.clock}</span>
        <span class="stat-tile__delta delta--up">${urgent} urgent</span>
      </div>
      <div class="stat-tile__label">Free trials on radar</div>
      <div class="stat-tile__value">${state.trials.length}</div>
      <div class="stat-tile__hint">Every one is backed by a Pause Card</div>`;

    $("#stat-cards").innerHTML = `
      <div class="stat-tile__top">
        <span class="stat-tile__ico card__icon--cyan">${I.card}</span>
        <span class="stat-tile__delta delta--flat">${state.cards.length} total</span>
      </div>
      <div class="stat-tile__label">Active Pause Cards</div>
      <div class="stat-tile__value">${activeCards}</div>
      <div class="stat-tile__hint">Merchant-locked · auto-armed</div>`;

    $("#stat-saved").innerHTML = `
      <div class="stat-tile__top">
        <span class="stat-tile__ico card__icon--mint">${I.spark}</span>
        <span class="stat-tile__delta delta--down">this year</span>
      </div>
      <div class="stat-tile__label">Saved from zombie charges</div>
      <div class="stat-tile__value">${utils.money(state.savedThisYear, false)}</div>
      <div class="stat-tile__hint">Blocked charges + canceled subs</div>`;
  }

  function renderDonut() {
    const cats = {};
    activeSubs().forEach((s) => {
      cats[s.category] = (cats[s.category] || 0) + s.amount;
    });
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    const stops = Object.entries(cats).map(([name, val]) => {
      const start = (acc / total) * 360;
      acc += val;
      const end = (acc / total) * 360;
      const color = utils.CATEGORY_COLORS[name] || "#8473ff";
      return `${color} ${start}deg ${end}deg`;
    });
    $("#donut").style.background = `conic-gradient(${stops.join(",")})`;
    $("#donut-total").textContent = utils.money(total);
    $("#donut-legend").innerHTML = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([name, val]) => `
        <div class="legend__row">
          <span class="legend__swatch" style="background:${utils.CATEGORY_COLORS[name] || "#8473ff"}"></span>
          <span class="legend__name">${name}</span>
          <span class="legend__val">${utils.money(val)}</span>
        </div>`
      )
      .join("");
  }

  function renderBars() {
    const now = new Date();
    // the final bar is the live current month, not the seeded snapshot
    const series = state.spendSeries.slice();
    series[series.length - 1] = monthlySpend();
    const labels = series.map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (series.length - 1 - i), 1);
      return d.toLocaleDateString("en-US", { month: "short" });
    });
    const max = Math.max(...series);
    $("#bars").innerHTML = series
      .map((v, i) => {
        const isNow = i === state.spendSeries.length - 1;
        return `
          <div class="bar-col" title="${labels[i]}: ${utils.money(v)}">
            <div class="bar ${isNow ? "bar--now" : ""}" style="height:${Math.max(
          (v / max) * 100,
          6
        )}%"></div>
            <small>${labels[i]}</small>
          </div>`;
      })
      .join("");
  }

  function renderRenewals() {
    const upcoming = activeSubs()
      .slice()
      .sort((a, b) => new Date(a.renewal) - new Date(b.renewal))
      .slice(0, 5);
    $("#renewal-list").innerHTML = upcoming
      .map((s) => {
        const d = new Date(s.renewal);
        const soon = d - Date.now() < 3 * utils.DAY;
        return `
        <div class="feed__item">
          ${merchantIcon(s).replace("merchant-ico", "feed__ico")}
          <div class="feed__body">
            <b>${s.merchant}</b>
            <small>${s.plan}</small>
          </div>
          <div class="feed__meta">
            <b>${utils.money(s.amount)}</b>
            <small style="color:${soon ? "var(--amber)" : "var(--faint)"}">${utils.humanizeRenewal(
          d
        )}</small>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderActivity() {
    const iconMap = { ok: I.check, block: I.ban, card: I.card, warn: I.alert };
    $("#activity-list").innerHTML = state.activity
      .slice(0, 6)
      .map(
        (a) => `
      <div class="feed__item">
        <span class="feed__ico feed__ico--${a.kind}">${iconMap[a.kind] || I.bell}</span>
        <div class="feed__body">
          <b>${a.title}</b>
          <small>${a.sub}</small>
        </div>
        <div class="feed__meta">
          ${a.amount ? `<b>${a.amount}</b>` : ""}
          <small>${a.when}</small>
        </div>
      </div>`
      )
      .join("");
  }

  function renderOverviewTrials() {
    $("#ov-trials").innerHTML = state.trials
      .map((t) => {
        const card = state.cards.find((c) => c.id === t.cardId);
        return `
      <div class="feed__item">
        ${merchantIcon(t).replace("merchant-ico", "feed__ico")}
        <div class="feed__body">
          <b>${t.merchant} trial</b>
          <small>Converts to ${utils.money(t.chargeAfter)}/mo unless shielded</small>
        </div>
        <div class="feed__meta">
          <b class="ov-timer" data-endts="${t.endsAt}">
            <span data-unit="d">–</span>d <span data-unit="h">–</span>h <span data-unit="m">–</span>m
          </b>
          <small>${card ? "Pause Card · ···· " + last4(card.number) : "No card"}</small>
        </div>
      </div>`;
      })
      .join("");
  }

  /* ============================================================
     RENDER: subscriptions view
     ============================================================ */
  let subFilter = "All";
  let subQuery = "";

  function renderSubs() {
    const cats = ["All", ...new Set(state.subs.map((s) => s.category))];
    $("#sub-filters").innerHTML = cats
      .map(
        (c) =>
          `<button class="chip ${c === subFilter ? "active" : ""}" data-filter="${c}">${c}</button>`
      )
      .join("");

    const q = subQuery.trim().toLowerCase();
    const list = state.subs.filter(
      (s) =>
        (subFilter === "All" || s.category === subFilter) &&
        (!q || s.merchant.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q))
    );

    if (!list.length) {
      $("#subs-container").innerHTML = `
        <div class="empty">${I.search}
          <b>No matches</b>
          <p>Nothing here matches that search or filter. Try another category.</p>
        </div>`;
      return;
    }

    $("#subs-container").innerHTML = list
      .map((s, i) => {
        const d = new Date(s.renewal);
        const soon = d - Date.now() < 3 * utils.DAY && s.status !== "canceled";
        return `
        <article class="sub-row ${s.status === "canceled" ? "is-canceled" : ""}" style="animation-delay:${i * 40}ms">
          ${merchantIcon(s)}
          <div class="sub-main">
            <div class="sub-name">
              ${s.merchant}
              ${riskBadge(s)}
              ${
                s.protected && s.status !== "canceled"
                  ? `<span class="badge badge--violet">${I.pause} Pause-protected</span>`
                  : ""
              }
            </div>
            <div class="sub-plan">${s.plan} · ${s.category}${
          s.unusedDays ? ` · unused for ${s.unusedDays} days` : ""
        }</div>
          </div>
          <div class="sub-price">
            <b>${utils.money(s.amount)}</b>
            <small>per month</small>
          </div>
          <div class="sub-renew">
            <small>${s.status === "canceled" ? "Ends" : "Renews"}</small>
            <b class="${soon ? "soon" : ""}">${utils.fmtShort(d)} · ${utils.humanizeRenewal(
          d
        )}</b>
          </div>
          <div class="sub-actions">
            ${
              s.status === "canceled"
                ? `<button class="btn btn--pause btn--sm" data-reactivate="${s.id}">${I.refresh} Reactivate</button>`
                : `
              ${
                s.protected
                  ? ""
                  : `<button class="btn btn--pause btn--sm" data-protect="${s.id}" title="Issue a Pause Card">${I.shield} Protect</button>`
              }
              <button class="btn btn--danger btn--sm" data-cancel="${s.id}">${I.zap} Kill</button>`
            }
          </div>
        </article>`;
      })
      .join("");
  }

  /* ============================================================
     RENDER: trials view
     ============================================================ */
  function trialProgress(t) {
    const total = t.endsAt - t.startedAt;
    const elapsed = Date.now() - t.startedAt;
    return Math.min(100, Math.max(4, (elapsed / total) * 100));
  }

  function renderTrials() {
    $("#trials-container").innerHTML = state.trials
      .map((t, i) => {
        const card = state.cards.find((c) => c.id === t.cardId);
        const urgent = t.endsAt - Date.now() < 2 * utils.DAY;
        const pct = trialProgress(t);
        return `
        <article class="trial-card ${urgent ? "urgent" : ""}" style="animation-delay:${i * 60}ms">
          <div class="trial-card__head">
            ${merchantIcon(t)}
            <div class="sub-main">
              <div class="sub-name">${t.merchant}
                ${
                  urgent
                    ? `<span class="badge badge--risk">${I.alert} Ends soon</span>`
                    : `<span class="badge badge--safe">${I.shield} Shielded</span>`
                }
              </div>
              <div class="sub-plan">${t.plan}</div>
            </div>
          </div>

          <div class="trial-countdown">
            <div class="trial-countdown__timer ${urgent ? "" : "calm"}" data-countdown="${t.id}" data-endts="${t.endsAt}">
              <span data-unit="d">–</span>d <span data-unit="h">–</span>h <span data-unit="m">–</span>m <span data-unit="s">–</span>s
            </div>
            <small>until auto-lock · ${utils.fmtDate(new Date(t.endsAt))}</small>
          </div>

          <div class="trial-progress"><i class="${pct > 75 ? "danger" : ""}" style="width:${pct}%"></i></div>

          <div class="trial-meta">
            <div>
              <small>Charge after trial</small>
              <b>${utils.money(t.chargeAfter)}/mo</b>
            </div>
            <div>
              <small>Pause Card</small>
              <b>${card ? "···· " + last4(card.number) : "Not linked"}</b>
            </div>
          </div>

          <div class="trial-card__actions">
            <button class="btn btn--pause btn--sm" data-extend="${t.id}">${I.plus} Extend +3d</button>
            <button class="btn btn--danger btn--sm" data-killtrial="${t.id}">${I.ban} Cancel trial</button>
          </div>
        </article>`;
      })
      .join("");
  }

  /* ============================================================
     RENDER: pause cards view
     ============================================================ */
  function cardStatusBadge(c) {
    if (c.status === "destroyed")
      return `<span class="badge badge--dead gc-visual__status">${I.ban} Destroyed</span>`;
    if (c.status === "locked")
      return `<span class="badge badge--risk gc-visual__status">${I.lock} Locked</span>`;
    return `<span class="badge badge--safe gc-visual__status">${I.shield} Active</span>`;
  }

  function renderCards() {
    const tiles = state.cards
      .map((c, i) => {
        const lockD = new Date(c.autoLockAt);
        return `
        <div class="gc-tile" style="animation-delay:${i * 50}ms">
          <div class="gc-visual ${c.status}">
            ${cardStatusBadge(c)}
            <div class="gc-top">
              <span class="gc-brand">
                <span class="brand__mark">${I.pause}</span> PAUSE
              </span>
              <span class="gc-chip"></span>
            </div>
            <div class="gc-visual__num">${c.number}</div>
            <div class="gc-visual__foot">
              <div><span>Locked to</span><b>${c.merchant}</b></div>
              <div><span>Expires</span><b>${c.exp}</b></div>
              <div><span>CVC</span><b>${c.cvc}</b></div>
            </div>
            <span class="gc-shine"></span>
          </div>
          <div class="gc-detail">
            <div class="gc-detail__row"><span>Hard spend cap</span><b>${utils.money(c.cap)}</b></div>
            <div class="gc-detail__row"><span>Auto-lock date</span><b>${utils.fmtDate(lockD)}</b></div>
            <div class="gc-detail__row"><span>Mode</span><b>${c.oneTime ? "Single-use" : "Merchant-locked"}</b></div>
            ${
              c.blockedAmount
                ? `<div class="gc-detail__row"><span>Blocked charges</span><b style="color:var(--rose)">${utils.money(
                    c.blockedAmount
                  )}</b></div>`
                : ""
            }
            <div class="gc-detail__actions">
              ${
                c.status === "active"
                  ? `<button class="btn btn--pause btn--sm" data-lockcard="${c.id}">${I.lock} Lock now</button>
                     <button class="btn btn--danger btn--sm" data-destroycard="${c.id}">${I.trash} Destroy</button>`
                  : c.status === "locked"
                  ? `<button class="btn btn--pause btn--sm" data-unlockcard="${c.id}">${I.unlock} Unlock</button>
                     <button class="btn btn--danger btn--sm" data-destroycard="${c.id}">${I.trash} Destroy</button>`
                  : `<button class="btn btn--pause btn--sm" disabled>${I.ban} Card terminated</button>`
              }
            </div>
          </div>
        </div>`;
      })
      .join("");

    $("#cards-container").innerHTML =
      tiles +
      `
      <button class="gc-new" id="new-card-tile">
        <span>
          ${I.plus}
          <b>Mint a new Pause Card</b>
          <small>Single-use burner · ready in seconds</small>
        </span>
      </button>`;
  }

  /* ---------------- live countdowns ---------------- */
  function tickCountdowns() {
    $$("[data-endts]").forEach((el) => {
      const end = parseInt(el.dataset.endts, 10);
      const p = utils.countdownParts(end - Date.now());
      const set = (u, v) => {
        const node = el.querySelector(`[data-unit="${u}"]`);
        if (node) node.textContent = utils.pad2(v);
      };
      set("d", p.d);
      set("h", p.h);
      set("m", p.m);
      set("s", p.s);
      if (p.over) {
        el.style.color = "var(--rose)";
      }
    });
  }

  /* ---------------- sidebar counts ---------------- */
  function renderNavCounts() {
    const set = (sel, txt) => {
      const el = $(sel);
      if (el) el.textContent = txt;
    };
    set("#count-subs", state.subs.length);
    set("#count-trials", state.trials.length);
    set("#count-cards", state.cards.filter((c) => c.status === "active").length);
    const urgent = state.trials.filter((t) => t.endsAt - Date.now() < 2 * utils.DAY).length;
    const trialCount = $("#count-trials");
    if (trialCount) trialCount.classList.toggle("count--alert", urgent > 0);
  }

  function renderAll() {
    renderStats();
    renderDonut();
    renderBars();
    renderRenewals();
    renderActivity();
    renderOverviewTrials();
    renderSubs();
    renderTrials();
    renderCards();
    renderNavCounts();
    tickCountdowns();
  }

  /* ============================================================
     Navigation
     ============================================================ */
  const VIEW_META = {
    overview: ["Command center", "Your subscriptions, trials and shields at a glance"],
    subs: ["Subscriptions", "Every recurring bill, sorted by what it actually costs you"],
    trials: ["Free trials", "Countdowns are running — Pause Cards are already armed"],
    cards: ["Pause Cards", "Merchant-locked burner cards that die on schedule"],
  };

  function switchView(view) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    $$(".side-nav a[data-view]").forEach((a) =>
      a.classList.toggle("active", a.dataset.view === view)
    );
    const [title, sub] = VIEW_META[view];
    const titleEl = $("#top-title");
    const subEl = $("#top-sub");
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;
    document.body.classList.remove("sidebar-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$(".side-nav a[data-view]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(a.dataset.view);
    })
  );

  /* mobile sidebar */
  const menuBtn = $(".menu-btn");
  const syncSidebar = () => {
    const open = document.body.classList.contains("sidebar-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
    syncSidebar();
  });
  $(".sidebar-overlay").addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
    syncSidebar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
      document.body.classList.remove("sidebar-open");
      syncSidebar();
      menuBtn.focus();
    }
  });

  /* topbar quick actions + in-panel jump links */
  $("#new-card-btn").addEventListener("click", () => openCardModal());
  document.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      e.preventDefault();
      switchView(jump.dataset.jump);
    }
  });

  /* ============================================================
     New Pause Card modal
     ============================================================ */
  const modalCard = $("#modal-card");
  const fMerchant = $("#f-merchant");
  const fCustomWrap = $("#f-custom-wrap");
  const fCustom = $("#f-custom");
  const fCap = $("#f-cap");
  const fDate = $("#f-lockdate");
  const fOneTime = $("#f-onetime");

  function openCardModal(prefillMerchant) {
    if (prefillMerchant) {
      const opt = [...fMerchant.options].find((o) => o.text === prefillMerchant);
      if (opt) fMerchant.value = opt.value;
      else {
        fMerchant.value = "__custom";
        fCustomWrap.style.display = "block";
        fCustom.value = prefillMerchant;
      }
    }
    fCap.value = "0.00";
    const d = utils.addDays(new Date(), 7);
    fDate.value = `${d.getFullYear()}-${utils.pad2(d.getMonth() + 1)}-${utils.pad2(d.getDate())}`;
    fDate.min = new Date().toISOString().slice(0, 10);
    fOneTime.checked = false;
    fCustomWrap.style.display = fMerchant.value === "__custom" ? "block" : "none";
    $$("[data-daypreset]").forEach((c) => c.classList.remove("active"));
    ui.openModal("modal-card");
  }

  fMerchant.addEventListener("change", () => {
    fCustomWrap.style.display = fMerchant.value === "__custom" ? "block" : "none";
  });

  $$("[data-daypreset]").forEach((chip) =>
    chip.addEventListener("click", () => {
      const d = utils.addDays(new Date(), parseInt(chip.dataset.daypreset, 10));
      fDate.value = `${d.getFullYear()}-${utils.pad2(d.getMonth() + 1)}-${utils.pad2(
        d.getDate()
      )}`;
      $$("[data-daypreset]").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    })
  );

  $("#card-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const isCustom = fMerchant.value === "__custom";
    const merchant = isCustom
      ? fCustom.value.trim()
      : fMerchant.selectedIndex >= 0
      ? fMerchant.options[fMerchant.selectedIndex].text
      : fMerchant.value;
    if (!merchant) {
      ui.toast("Merchant name required", "Tell us which company this card is for.", "warn");
      return;
    }
    const cap = parseFloat(fCap.value) || 0;
    const lockAt = new Date(fDate.value + "T23:59:59").getTime();
    if (!(lockAt > Date.now())) {
      ui.toast("Pick a future lock date", "The auto-lock has to happen after today.", "warn");
      return;
    }
    const card = utils.makePauseCard({
      merchant,
      cap,
      autoLockAt: lockAt,
      oneTime: fOneTime.checked,
    });
    state.cards.unshift(card);
    pushActivity(
      "card",
      `Pause Card created · ${merchant}`,
      `Hard cap ${utils.money(cap)} · locks ${utils.fmtShort(new Date(lockAt))}`,
      ""
    );
    save();
    renderAll();
    ui.closeModal("modal-card");
    ui.toast("Pause Card minted", `···· ${last4(card.number)} is locked to ${merchant}.`, "ok");
    switchView("cards");
  });

  /* ============================================================
     Cancel wizard ("Kill the Bill")
     ============================================================ */
  const modalCancel = $("#modal-cancel");
  let cancelTarget = null;

  function setWizardPane(n) {
    $$(".wizard-pane").forEach((p, i) => p.classList.toggle("active", i === n - 1));
    $$(".wizard-steps i").forEach((dot, i) => dot.classList.toggle("done", i < n));
  }

  function openCancelWizard(subId) {
    cancelTarget = state.subs.find((s) => s.id === subId);
    if (!cancelTarget) return;
    const s = cancelTarget;
    $("#wz-name").textContent = s.merchant;
    $("#wz-plan").textContent = s.plan;
    $("#wz-monthly").textContent = utils.money(s.amount) + " / month";
    $("#wz-yearly").textContent = utils.money(s.amount * 12) + " / year";
    $("#wz-saved").textContent = utils.money(s.amount * 12, false);
    $("#wz-script").textContent = `Hi ${s.merchant} team — please cancel my ${s.plan} subscription effective at the end of the current billing cycle. I do not consent to any further renewals or charges. Please send written confirmation. Thanks.`;
    setWizardPane(1);
    ui.openModal("modal-cancel");
  }

  function runWizardWork() {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setWizardPane(2);
    const steps = $$("#wz-working li");
    steps.forEach((li) => li.classList.remove("done"));
    steps.forEach((li, i) => {
      setTimeout(() => li.classList.add("done"), 500 + i * 650);
    });
    setTimeout(() => {
      // the subscription may have been removed/reset while the wizard was running
      if (!state.subs.includes(target)) return;
      // commit the cancellation
      target.status = "canceled";
      state.savedThisYear += target.amount * 12;
      pushActivity(
        "ok",
        `Subscription canceled · ${target.merchant}`,
        "Kill the Bill — merchant confirmed, no renewal scheduled",
        `-${utils.money(target.amount)}/mo`
      );
      save();
      renderAll();
      setWizardPane(3);
      ui.toast(
        "Bill killed",
        `${target.merchant} won't renew. ~${utils.money(
          target.amount * 12,
          false
        )}/yr stays in your pocket.`,
        "ok",
        5200
      );
    }, 500 + steps.length * 650 + 300);
  }

  /* ============================================================
     Global click delegation
     ============================================================ */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;

    // subscriptions
    const cancelId = t.dataset.cancel;
    if (cancelId) return openCancelWizard(cancelId);

    if (t.dataset.reactivate) {
      const s = state.subs.find((x) => x.id === t.dataset.reactivate);
      if (!s) return;
      s.status = "active";
      s.renewal = utils.addDays(new Date(), 14).toISOString();
      pushActivity("card", `Reactivated · ${s.merchant}`, "Renewal moved 14 days out", "");
      save();
      renderAll();
      return ui.toast("Reactivated", `${s.merchant} is back on your roster.`, "info");
    }

    if (t.dataset.protect) {
      const s = state.subs.find((x) => x.id === t.dataset.protect);
      if (!s) return;
      return openCardModal(s.merchant);
    }

    // filters
    if (t.dataset.filter) {
      subFilter = t.dataset.filter;
      return renderSubs();
    }

    // trials
    if (t.dataset.extend) {
      const tr = state.trials.find((x) => x.id === t.dataset.extend);
      if (!tr) return;
      tr.endsAt += 3 * utils.DAY;
      const card = state.cards.find((c) => c.id === tr.cardId);
      if (card) card.autoLockAt = tr.endsAt;
      pushActivity("card", `Lock extended · ${tr.merchant}`, "Auto-lock pushed out by 3 days", "");
      save();
      renderAll();
      return ui.toast("Lock extended", `${tr.merchant} shield now lifts in 3 extra days.`, "info");
    }

    if (t.dataset.killtrial) {
      const tr = state.trials.find((x) => x.id === t.dataset.killtrial);
      if (!tr) return;
      const card = state.cards.find((c) => c.id === tr.cardId);
      if (card) {
        card.status = "locked";
        card.autoLockAt = Date.now();
      }
      state.trials = state.trials.filter((x) => x.id !== tr.id);
      state.savedThisYear += tr.chargeAfter * 12;
      pushActivity(
        "block",
        `Trial canceled · ${tr.merchant}`,
        "Pause Card locked — conversion charge pre-blocked",
        utils.money(tr.chargeAfter)
      );
      save();
      renderAll();
      return ui.toast(
        "Trial killed",
        `${tr.merchant} can't charge you — the Pause Card is at ₹0.`,
        "ok",
        5000
      );
    }

    // cards
    if (t.id === "new-card-tile") return openCardModal();

    if (t.dataset.lockcard) {
      const c = state.cards.find((x) => x.id === t.dataset.lockcard);
      if (!c) return;
      c.status = "locked";
      c.autoLockAt = Date.now();
      pushActivity("block", `Pause Card locked · ${c.merchant}`, "Manual lock — all charges declined", "");
      save();
      renderAll();
      return ui.toast("Card locked", `···· ${last4(c.number)} will now decline every charge.`, "warn");
    }

    if (t.dataset.unlockcard) {
      const c = state.cards.find((x) => x.id === t.dataset.unlockcard);
      if (!c) return;
      c.status = "active";
      c.autoLockAt = Date.now() + 7 * utils.DAY;
      save();
      renderAll();
      return ui.toast("Card unlocked", `···· ${last4(c.number)} is active again for 7 days.`, "info");
    }

    if (t.dataset.destroycard) {
      const c = state.cards.find((x) => x.id === t.dataset.destroycard);
      if (!c) return;
      // two-step confirm
      if (!t.dataset.confirm) {
        t.dataset.confirm = "1";
        const old = t.innerHTML;
        t.innerHTML = `${I.ban} Confirm destroy?`;
        setTimeout(() => {
          delete t.dataset.confirm;
          t.innerHTML = old;
        }, 3200);
        return;
      }
      c.status = "destroyed";
      c.autoLockAt = Date.now();
      pushActivity("block", `Pause Card destroyed · ${c.merchant}`, "Card number terminated permanently", "");
      save();
      renderAll();
      return ui.toast("Card destroyed", `···· ${last4(c.number)} no longer exists. Poof.`, "danger");
    }
  });

  // wizard buttons
  $("#wz-next").addEventListener("click", runWizardWork);
  $("#wz-done").addEventListener("click", () => {
    cancelTarget = null;
    ui.closeModal("modal-cancel");
  });

  /* ---------------- search ---------------- */
  $("#sub-search").addEventListener("input", (e) => {
    subQuery = e.target.value;
    renderSubs();
  });

  /* ---------------- notification bell ---------------- */
  $("#bell").addEventListener("click", () => {
    const urgent = state.trials.filter((t) => t.endsAt - Date.now() < 2 * utils.DAY);
    if (urgent.length) {
      ui.toast(
        `${urgent.length} trial${urgent.length > 1 ? "s" : ""} need attention`,
        urgent.map((t) => t.merchant).join(", ") + " convert within 48 hours — shields are armed.",
        "warn",
        5200
      );
    } else {
      ui.toast("You're covered", "No urgent renewals in the next 48 hours. Nice.", "ok");
    }
  });

  /* ---------------- reset demo ---------------- */
  $("#reset-demo").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (!btn.dataset.confirm) {
      btn.dataset.confirm = "1";
      btn.textContent = "Click to confirm reset";
      setTimeout(() => {
        delete btn.dataset.confirm;
        btn.textContent = "Reset demo data";
      }, 3200);
      return;
    }
    const fresh = reset();
    Object.assign(state, fresh);
    subFilter = "All";
    subQuery = "";
    $("#sub-search").value = "";
    renderAll();
    ui.toast("Demo data restored", "Fresh subscriptions, trials and Pause Cards.", "info");
  });

  /* ---------------- greeting + clock ---------------- */
  function renderGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    $("#greeting").textContent = `${greet}, ${state.user.name.split(" ")[0]}`;
    $("#today-date").textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  /* ---------------- boot ---------------- */
  renderGreeting();
  renderAll();
  setInterval(tickCountdowns, 1000);
  setInterval(renderGreeting, 60000);

  if (!state.onboarded) {
    state.onboarded = true;
    save();
    setTimeout(() => {
      ui.toast(
        "Welcome to your PayPause dashboard",
        "This is a live demo — every card, timer and cancellation runs entirely in your browser.",
        "info",
        5600
      );
    }, 800);
  }
})();
