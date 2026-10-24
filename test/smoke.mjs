/* DOM smoke test: loads both pages in jsdom and exercises the main flows. */
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const virtualConsole = new (await import("jsdom")).VirtualConsole();
virtualConsole.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
virtualConsole.on("error", (e) => errors.push("console.error: " + e));

function loadPage(file) {
  let html = readFileSync(join(root, file), "utf8");
  // inline local scripts so jsdom executes them without network access
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    const code = readFileSync(join(root, src), "utf8");
    return "<script>" + code + "</script>";
  });
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "http://localhost/" + file,
    virtualConsole,
    beforeParse(window) {
      // jsdom lacks IntersectionObserver
      window.IntersectionObserver = class {
        constructor(cb) {
          this.cb = cb;
        }
        observe(el) {
          this.cb([{ isIntersecting: true, target: el }], this);
        }
        unobserve() {}
        disconnect() {}
      };
      window.scrollTo = () => {};
    },
  });
  return dom;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- landing page ---------------- */
{
  const dom = loadPage("index.html");
  const { window } = dom;
  await sleep(300);

  // hero card number replaced with a Luhn-format generated number
  const num = window.document.getElementById("hero-card-num").textContent.trim();
  if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(num)) throw new Error("hero card number bad: " + num);

  // hero countdown formatted (minutes granularity; seconds tested on dashboard)
  const heroT = window.document.getElementById("hero-timer").textContent;
  if (!/^\dd \d{2}h \d{2}m$/.test(heroT)) throw new Error("hero timer format bad: " + heroT);

  // FAQ accordion
  const firstFaq = window.document.querySelector(".faq__item");
  firstFaq.querySelector(".faq__q").click();
  if (!firstFaq.classList.contains("open")) throw new Error("FAQ did not open");

  // generator widget
  window.document.getElementById("gen-form").dispatchEvent(new window.Event("submit", { cancelable: true }));
  await sleep(100);
  const genCard = window.document.getElementById("gen-card");
  if (genCard.style.display !== "flex") throw new Error("generator card not shown");
  if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(genCard.querySelector("[data-gc='number']").textContent))
    throw new Error("generated card number bad");
  if (genCard.querySelector("[data-gc='merchant']").textContent !== "Notion AI")
    throw new Error("merchant not set on card");
  console.log("✓ landing page: hero, countdown, FAQ, generator");
}

/* ---------------- dashboard ---------------- */
{
  const dom = loadPage("dashboard.html");
  const { window } = dom;
  const doc = window.document;
  await sleep(300);

  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];

  if (!$("#stat-spend").innerHTML.includes("$184.42"))
    throw new Error("monthly spend stat wrong: " + $("#stat-spend").textContent);
  if ($$(".sub-row").length !== 9) throw new Error("expected 9 subscription rows, got " + $$(".sub-row").length);
  if ($$(".trial-card").length !== 3) throw new Error("expected 3 trial cards");
  if ($$(".gc-tile").length !== 4) throw new Error("expected 4 ghost cards");
  if (!$("#donut").style.background.includes("conic-gradient")) throw new Error("donut not rendered");
  if ($$("#bars .bar-col").length !== 6) throw new Error("bar chart missing");

  // live countdown populated (trial cards + compact overview timers)
  const cd = doc.querySelector("[data-countdown] [data-unit='h']");
  if (!cd || cd.textContent === "–") throw new Error("trial countdown not running");
  const ovCd = doc.querySelector(".ov-timer [data-unit='h']");
  if (!ovCd || ovCd.textContent === "–") throw new Error("overview countdown not running");

  // view switching
  const trialsLink = $$(".side-nav a").find((a) => a.dataset.view === "trials");
  trialsLink.click();
  if (!$("#view-trials").classList.contains("active")) throw new Error("view switch failed");

  // filters
  const aiChip = $$("#sub-filters .chip").find((c) => c.dataset.filter === "AI");
  aiChip.click();
  const visibleNames = $$(".sub-row .sub-name").map((n) => n.childNodes[0].textContent.trim());
  if (!visibleNames.includes("ChatGPT Plus") || visibleNames.some((n) => n === "Netflix"))
    throw new Error("category filter failed: " + visibleNames);
  $$("#sub-filters .chip").find((c) => c.dataset.filter === "All").click();

  // mint a new ghost card
  $("#new-card-btn").click();
  if (!$("#modal-card").classList.contains("open")) throw new Error("card modal did not open");
  const before = $$(".gc-tile").length;
  $("#card-form").dispatchEvent(new window.Event("submit", { cancelable: true }));
  await sleep(100);
  if ($$(".gc-tile").length !== before + 1) throw new Error("new card was not added");
  if ($("#view-cards").classList.contains("active") === false) throw new Error("did not jump to cards view");

  // lock the new card (first active card's lock button)
  const lockBtn = $("[data-lockcard]");
  lockBtn.click();
  const lockedTile = doc.querySelector(".gc-visual.locked");
  if (!lockedTile) throw new Error("card lock failed");

  // destroy with two-step confirm
  const destroyBtn = $("[data-destroycard]");
  destroyBtn.click();
  if (!destroyBtn.dataset.confirm) throw new Error("destroy confirm step missing");
  destroyBtn.click();
  if (!$(".gc-visual.destroyed")) throw new Error("card destroy failed");

  // cancel wizard
  $$(".side-nav a").find((a) => a.dataset.view === "subs").click();
  const cancelBtn = $("[data-cancel]");
  cancelBtn.click();
  if (!$("#modal-cancel").classList.contains("open")) throw new Error("cancel wizard did not open");
  if (!$("#wz-yearly").textContent.includes("$")) throw new Error("wizard summary empty");
  $("#wz-next").click();
  // work pane runs ~4*650ms + buffer
  await sleep(3600);
  if (!$("#modal-cancel .wizard-pane:last-child").classList.contains("active"))
    throw new Error("wizard did not finish");
  if (!$(".sub-row.is-canceled")) throw new Error("subscription not marked canceled");
  const canceledSpend = $("#stat-spend").textContent;
  if (canceledSpend.includes("184.42")) throw new Error("spend did not update after cancel");
  $("#wz-done").click();
  if ($("#modal-cancel").classList.contains("open")) throw new Error("wizard modal did not close");

  // trial kill
  $$(".side-nav a").find((a) => a.dataset.view === "trials").click();
  const trialCountBefore = $$(".trial-card").length;
  $("[data-killtrial]").click();
  if ($$(".trial-card").length !== trialCountBefore - 1) throw new Error("trial kill failed");

  // reset
  const resetBtn = $("#reset-demo");
  resetBtn.click();
  resetBtn.click();
  await sleep(100);
  if ($$(".sub-row").length !== 9) throw new Error("reset failed");
  if ($$(".sub-row.is-canceled").length !== 0) throw new Error("reset did not restore canceled sub");
  if ($$(".trial-card").length !== 3) throw new Error("reset trials failed");
  if (window.GS.state.activity.length !== 5) throw new Error("reset activity feed failed");

  console.log("✓ dashboard: stats, views, filters, cards, wizard, trials, reset");
}

if (errors.length) {
  console.error("PAGE ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nAll smoke tests passed.");
process.exit(0);
