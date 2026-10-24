/* ============================================================
   PayPause — landing page interactions
   ============================================================ */
(function () {
  "use strict";
  const { utils, ui } = window.PP;

  /* ---------- sticky nav ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".nav__burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  /* ---------- scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- animated counters ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const raw = target * eased;
      const num =
        decimals === 0
          ? Math.round(raw).toLocaleString("en-IN")
          : raw.toFixed(decimals);
      el.textContent = prefix + num + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq__item.open").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Pause Card generator widget ---------- */
  const form = document.getElementById("gen-form");
  if (form) {
    const merchantSel = document.getElementById("gen-merchant");
    const lengthSel = document.getElementById("gen-length");
    const placeholder = document.getElementById("gen-placeholder");
    const card = document.getElementById("gen-card");
    const flipBtn = document.getElementById("gen-flip");
    const genBtn = document.getElementById("gen-submit");

    const els = {
      number: card.querySelector("[data-gc='number']"),
      merchant: card.querySelector("[data-gc='merchant']"),
      holder: card.querySelector("[data-gc='holder']"),
      exp: card.querySelector("[data-gc='exp']"),
      cvc: card.querySelector("[data-gc='cvc']"),
      cap: card.querySelector("[data-gc='cap']"),
      lock: card.querySelector("[data-gc='lock']"),
    };

    let flipTimer = null;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const merchant =
        merchantSel.selectedIndex >= 0
          ? merchantSel.options[merchantSel.selectedIndex].text
          : merchantSel.value;
      if (!merchant) {
        ui.toast("Pick a merchant first", "Choose which company this card is for.", "warn");
        return;
      }
      const days = parseInt(lengthSel.value, 10);
      const lockDate = utils.addDays(new Date(), days);

      els.number.textContent = utils.generateCardNumber();
      els.merchant.textContent = merchant;
      els.holder.textContent = "PAUSE USER";
      els.exp.textContent = utils.generateExpiry();
      els.cvc.textContent = utils.generateCVC();
      els.cap.textContent = utils.money(0);
      els.lock.textContent = utils.fmtDate(lockDate);

      placeholder.style.display = "none";
      card.style.display = "flex";
      card.classList.remove("is-flipped");

      // little entrance + auto flip to reveal the lock terms
      clearTimeout(flipTimer);
      flipTimer = setTimeout(() => card.classList.add("is-flipped"), 1300);
      flipTimer = setTimeout(() => card.classList.remove("is-flipped"), 4200);

      genBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg> Generate another';

      ui.toast(
        "Pause Card generated",
        `Locked to ${merchant} · declines every charge after ${utils.fmtShort(lockDate)}`,
        "ok"
      );
    });

    flipBtn.addEventListener("click", () => card.classList.toggle("is-flipped"));
  }

  /* ---------- live hero countdown + valid card number ---------- */
  const heroTimer = document.getElementById("hero-timer");
  if (heroTimer) {
    const end = Date.now() + utils.DAY + 14 * utils.HOUR + 22 * 60000;
    const tick = () => {
      const p = utils.countdownParts(end - Date.now());
      heroTimer.textContent = `${p.d}d ${utils.pad2(p.h)}h ${utils.pad2(p.m)}m`;
    };
    tick();
    setInterval(tick, 1000);
  }
  const heroNum = document.getElementById("hero-card-num");
  if (heroNum) heroNum.textContent = utils.generateCardNumber();

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
