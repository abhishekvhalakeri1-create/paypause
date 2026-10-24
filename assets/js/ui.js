/* Shared UI helpers: toasts + modal plumbing */
(function () {
  "use strict";

  function ensureToastWrap() {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  const ICONS = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
  };

  function toast(title, sub = "", kind = "info", ttl = 4200) {
    const wrap = ensureToastWrap();
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <span class="toast__icon toast__icon--${kind}">${ICONS[kind] || ICONS.info}</span>
      <span>
        <b>${title}</b>
        ${sub ? `<small>${sub}</small>` : ""}
      </span>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 450);
    }, ttl);
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("open");
    document.body.style.overflow = "";
  }

  // click backdrop / [data-close] to dismiss; Esc key
  document.addEventListener("click", (e) => {
    const closeTrigger = e.target.closest("[data-close-modal]");
    if (closeTrigger) {
      const m = closeTrigger.closest(".modal-backdrop");
      if (m) closeModal(m.id);
      return;
    }
    if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
      closeModal(e.target.id);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open").forEach((m) => closeModal(m.id));
    }
  });

  window.GS = window.GS || {};
  window.GS.ui = { toast, openModal, closeModal };
})();
