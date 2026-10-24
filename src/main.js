import "@styles/site.css";
import { $, $$, i18n, state, prefersReducedMotion } from './js/util.js';
import { STR } from './js/strings.js';
import { buildShell, NAV } from './js/views.js';
import { renderAbout } from './js/about.js';
import { renderProjects, sourceLabel } from './js/projects.js';
import { renderContact } from './js/contact.js';
import { renderGames } from './js/games-page.js';
import { createWM } from './js/wm.js';
import { createTerminal } from './js/terminal.js';

const app = $("#app");
let wm = null;
let terminal = null;

boot().catch((err) => {
  console.error(err);
  app.innerHTML = `<p style="padding:2rem;font-family:monospace">
    Не удалось загрузить content.json: ${String(err?.message || err)}<br>
    GitHub: <a href="https://github.com/lionsuperpromax">github.com/lionsuperpromax</a>
  </p>`;
});

async function boot() {
  const res = await fetch(new URL("content.json", location.href.replace(/#.*$/, "").replace(/[^/]*$/, "")));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  state.content = await res.json();
  state.strings = STR;
  i18n.strings = STR;
  i18n.init("ru");

  paint();
  setSection(sectionFromHash() || "about", { focusTerminal: false });

  addEventListener("hashchange", () => {
    const id = sectionFromHash();
    if (id && id !== state.section) setSection(id);
  });
  addEventListener("keydown", onKeys);

  i18n.subscribe(() => {
    const openGames = state.section;
    paint();
    setSection(openGames, { focusTerminal: false });
  });

  startClock();
  document.addEventListener("reposready", () => updateStatus());
  updateStatus();
  observeReveals();
}

/* ------------------------------------------------------------------ */

function sectionFromHash() {
  const id = location.hash.replace("#", "");
  return NAV.some((n) => n.id === id) ? id : null;
}

/** (re)build the whole shell and bind everything. Cheap: no frameworks. */
function paint() {
  document.title = i18n.t(STR.doc_title);
  app.innerHTML = buildShell(state.content.profile);
  document.documentElement.lang = i18n.lang;

  wm = createWM(app);
  state.wm = wm;

  $$("[data-nav]", app).forEach((btn) => btn.addEventListener("click", () => setSection(btn.dataset.nav)));
  $("#btn-lang").addEventListener("click", () => i18n.toggle());

  renderAbout($("#pane-about"));
  renderGames($("#pane-games"), { wm });
  renderContact($("#pane-contact"));
  renderProjects($("#pane-projects"));

  terminal = createTerminal($("#pane-terminal"), { navigate });
}

/* ------------------------------------------------------------------ */

function setSection(id, { focusTerminal = true } = {}) {
  if (!NAV.some((n) => n.id === id)) id = "about";
  state.section = id;

  $$(".pane").forEach((p) => p.classList.toggle("is-active", p.id === `pane-${id}`));
  $$("[data-nav]").forEach((b) => b.setAttribute("aria-current", b.dataset.nav === id ? "true" : "false"));

  const paneEl = $(`#pane-${id}`);
  paneEl.scrollTop = 0;

  if (location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
  if (id === "terminal" && focusTerminal) terminal?.focus();
  if (id === "about" || id === "projects") observeReveals();
  updateStatus();
}

function navigate(id) {
  setSection(id, { focusTerminal: id === "terminal" });
}

/* ------------------------------------------------------------------ */

function onKeys(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest("input, textarea, [contenteditable='true']")) return;
  if (e.target.closest(".gw")) return; // game windows own their keys

  const idx = Number(e.key) - 1;
  if (idx >= 0 && idx < NAV.length) setSection(NAV[idx].id);
}

function startClock() {
  const tick = () => {
    const el = $("#clock");
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString(i18n.lang === "ru" ? "ru-RU" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  tick();
  setInterval(tick, 1000);
}

function updateStatus() {
  const dot = $("#sb-dot");
  const text = $("#sb-text");
  if (!dot || !text) return;
  const src = state.source;
  const n = state.repos.length || state.content?.repos?.length || 0;
  $("#sb-repos").textContent = String(n);

  if (src === "live") {
    dot.className = "status-dot status-dot--ok";
    text.textContent = i18n.t(STR.sb_ready);
  } else if (src === "cache" || src === "error") {
    dot.className = "status-dot status-dot--warn";
    text.textContent = i18n.t(STR.sb_offline);
  } else {
    dot.className = "status-dot";
    text.textContent = i18n.t(STR.sb_loading);
  }

  const srcEl = $("#projects-source");
  if (srcEl) {
    srcEl.dataset.state = src === "none" ? "loading" : src;
    const label = srcEl.querySelector("span");
    if (label) label.textContent = src === "none" ? "…" : sourceLabel(src);
  }

  const foot = $("#foot-state");
  if (foot) {
    foot.textContent =
      src === "live"
        ? i18n.t({ ru: "данные с GitHub", en: "data from GitHub" })
        : src === "none"
          ? "…"
          : i18n.t({ ru: "данные из кэша", en: "cached data" });
  }
}

function observeReveals() {
  const els = $$(".reveal:not(.is-in)");
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -40px 0px" },
  );
  els.forEach((el) => io.observe(el));
}
