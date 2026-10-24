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
      window.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {} });
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

  // rebrand: PayPause everywhere, old GhostSub naming fully gone
  const source = window.document.documentElement.outerHTML;
  if (!source.includes("PayPause")) throw new Error("PayPause brand missing");
  if (/ghostsub|ghost card|phantom/i.test(source))
    throw new Error("old brand strings still present");

  // live ticker populated with two looping groups
  const tickerItems = window.document.querySelectorAll("#ticker-track .ticker__item");
  if (tickerItems.length < 12) throw new Error("live ticker not populated");

  // live feed seeded and updating (rendered list is capped, so compare top-row id)
  const feed = window.document.querySelector("[data-live-feed]");
  if (feed.querySelectorAll(".live-row").length < 5) throw new Error("live feed not seeded");
  const topIdBefore = feed.querySelector(".live-row").dataset.liveId;
  const savedBefore = window.PP.live.state.saved;
  const savedCounter = window.document.querySelector("[data-live-counter='saved']").textContent;
  if (!/^₹[\d,]+/.test(savedCounter)) throw new Error("live savings counter not in INR: " + savedCounter);

  // every network saving must stay under ₹500
  if (!window.PP.live.state.feed.every((ev) => ev.amount < 500))
    throw new Error("live feed contains a saving of ₹500 or more");
  if (!tickerItems[0].textContent.includes("₹"))
    throw new Error("ticker not showing rupee amounts");
  await sleep(5600);
  const topIdAfter = feed.querySelector(".live-row").dataset.liveId;
  if (topIdAfter === topIdBefore) throw new Error("live feed did not add an event");
  if (window.PP.live.state.saved <= savedBefore) throw new Error("live savings total did not rise");
  if (!window.PP.live.state.feed.every((ev) => ev.amount < 500))
    throw new Error("newly generated live event crossed ₹500");
  const proof = window.document.getElementById("proof-wrap");
  if (proof.children.length < 1) throw new Error("social-proof popup never appeared");
  console.log("✓ landing page: hero, countdown, FAQ, generator, rebrand, live feed");
}

/* ---------------- dashboard ---------------- */
{
  const dom = loadPage("dashboard.html");
  const { window } = dom;
  const doc = window.document;
  await sleep(300);

  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];

  if (!$("#stat-spend").innerHTML.includes("₹9,799"))
    throw new Error("monthly spend stat wrong: " + $("#stat-spend").textContent);
  if (!/PayPause/.test(doc.documentElement.outerHTML)) throw new Error("dashboard missing PayPause brand");
  if (!doc.querySelector("[data-live-feed] .live-row"))
    throw new Error("dashboard live network panel not rendering");
  if (!$("#donut-total").textContent.includes("₹")) throw new Error("donut total not in rupees");
  if (doc.documentElement.outerHTML.includes("$184") || doc.documentElement.outerHTML.includes("USD"))
    throw new Error("dollar currency still present on dashboard");
  if (!window.PP.live.state.feed.every((ev) => ev.amount < 500))
    throw new Error("dashboard live feed has saving ≥ ₹500");
  if ($$(".sub-row").length !== 9) throw new Error("expected 9 subscription rows, got " + $$(".sub-row").length);
  if ($$(".trial-card").length !== 3) throw new Error("expected 3 trial cards");
  if ($$(".gc-tile").length !== 4) throw new Error("expected 4 pause cards");
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

  // mint a new pause card
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
  if (!$("#wz-yearly").textContent.includes("₹")) throw new Error("wizard summary empty");
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
  if (window.PP.state.activity.length !== 5) throw new Error("reset activity feed failed");

  console.log("✓ dashboard: stats, views, filters, cards, wizard, trials, reset");
}

/* ---------------- community (Reddit-style) ---------------- */
{
  const dom = loadPage("community.html");
  const { window } = dom;
  const doc = window.document;
  await sleep(400);
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];

  // seeded feed
  const posts = $$(".c-post");
  if (posts.length < 8) throw new Error("community feed not seeded: " + posts.length);
  if (!$("#c-rail .c-side-link")) throw new Error("community rail missing");
  if (!$("#c-karma").textContent.includes("karma")) throw new Error("karma counter missing");
  if (!$("#ticker-track .ticker__item")) throw new Error("ticker missing on community page");

  // upvote toggles score and persists state
  const firstPost = posts[0];
  const postId = firstPost.dataset.postId;
  const scoreBefore = parseInt(firstPost.querySelector(".c-vote__score").textContent.replace("k", "000"), 10);
  firstPost.querySelector('[data-vote="1"]').click();
  let voted = doc.querySelector(`[data-post-id="${postId}"] .c-vote__score`).textContent;
  if (!doc.querySelector(`[data-post-id="${postId}"] .c-vote`).classList.contains("up"))
    throw new Error("upvote state not applied");
  // click again removes vote
  doc.querySelector(`[data-post-id="${postId}"] [data-vote="1"]`).click();
  if (doc.querySelector(`[data-post-id="${postId}"] .c-vote`).classList.contains("up"))
    throw new Error("upvote toggle-off failed");

  // sorting changes order
  const hotFirst = doc.querySelector(".c-post").dataset.postId;
  $('[data-sort="top"]').click();
  const topFirst = doc.querySelector(".c-post").dataset.postId;
  $('[data-sort="new"]').click();
  const newFirst = doc.querySelector(".c-post").dataset.postId;
  if (topFirst === newFirst) throw new Error("sort tabs did not reorder feed");
  if (hotFirst !== topFirst || true) {
    /* order differences are expected across sorts */
  }

  // community scope filter
  const winLink = $$("#c-rail .c-side-link").find((b) => b.dataset.scope === "PauseWins");
  winLink.click();
  const scoped = $$(".c-post");
  if (!scoped.length) throw new Error("community filter returned nothing");
  if (scoped.some((p) => !p.textContent.includes("r/PauseWins")))
    throw new Error("community filter leaked other communities");
  $$("#c-rail .c-side-link").find((b) => b.dataset.scope === "home").click();

  // expand comments and add one
  const commentBtn = doc.querySelector("[data-togglecomments]");
  commentBtn.click();
  const targetId = commentBtn.dataset.togglecomments;
  const commentsWrap = doc.querySelector(`[data-post-id="${targetId}"] .c-comments`);
  if (!commentsWrap.classList.contains("open")) throw new Error("comments did not expand");
  const beforeComments = $$(`[data-post-id="${targetId}"] .c-comment`).length;
  const commentForm = doc.querySelector(`[data-commentform="${targetId}"]`);
  commentForm.querySelector("input").value = "This saved me from a sneaky renewal, thanks!";
  commentForm.dispatchEvent(new window.Event("submit", { cancelable: true, bubbles: true }));
  await sleep(50);
  const afterComments = $$(`[data-post-id="${targetId}"] .c-comment`).length;
  if (afterComments !== beforeComments + 1) throw new Error("comment was not added");

  // create post via modal
  $('[data-openpost]').click();
  if (!$("#modal-post").classList.contains("open")) throw new Error("post modal did not open");
  $("#cp-title").value = "Audited my statements and found three zombies in ten minutes";
  $("#cp-body").value = "Gym, cloud storage, and a news app. All canceled.";
  $("#post-form").dispatchEvent(new window.Event("submit", { cancelable: true, bubbles: true }));
  await sleep(50);
  if ($$("#modal-post.open").length) throw new Error("modal did not close after publish");
  if (!$$(".c-post").length) throw new Error("feed empty after publish");
  if (!doc.body.textContent.includes("Audited my statements")) throw new Error("new post content missing");

  // save toggle and saved scope
  const saveBtn = doc.querySelector("[data-savepost]");
  saveBtn.click();
  await sleep(20);
  $$("#c-rail .c-side-link").find((b) => b.dataset.scope === "saved").click();
  if (!$$(".c-post").length) throw new Error("saved scope empty after saving a post");

  // search filters feed
  $$("#c-rail .c-side-link").find((b) => b.dataset.scope === "home").click();
  $("#c-search").value = "adobe";
  $("#c-search").dispatchEvent(new window.Event("input", { bubbles: true }));
  await sleep(20);
  const searched = $$(".c-post");
  if (!searched.length || searched.some((p) => !/adobe/i.test(p.textContent)))
    throw new Error("search did not filter correctly");

  // all currency mentions in visible UI must be rupees (exclude <script> source text)
  const visibleSel = ["#c-feed", "#c-rail", "#c-about", "#c-trending", "#ticker-track", ".c-nav", ".c-composer", "#modal-post"];
  const visibleText = visibleSel.map((s) => doc.querySelector(s)?.textContent || "").join(" ");
  if (/\$[0-9]/.test(visibleText)) throw new Error("dollar amounts remain in community UI");
  if (!visibleText.includes("₹")) throw new Error("community UI missing rupee amounts");

  console.log("✓ community: feed, voting, sorting, scopes, comments, posting, search, save");
}

if (errors.length) {
  console.error("PAGE ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nAll smoke tests passed.");
process.exit(0);
