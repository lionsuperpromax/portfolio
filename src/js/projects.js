import { $, $$, esc, i18n, state, timeAgo, formatDate, toast } from "./util.js";
import { icon } from "./icons.js";
import { langColor, fetchRepos } from "./github.js";

let filter = "all";
let repos = [];
let loading = false;
let lastSource = null;
let lastRateLimited = false;

export function renderProjects(root) {
  const list = $("#projects-list", root);
  if (loading) return;
  if (repos.length) {
    paint(root);
    return;
  }

  list.innerHTML = Array.from({ length: 4 })
    .map(() => `<div class="skeleton"></div>`)
    .join("");

  const sourceEl = $("#projects-source", root);
  sourceEl.dataset.state = lastSource || "loading";
  if (!lastSource && !loading) load(root);
}

async function load(root) {
  loading = true;
  const sourceEl = $("#projects-source", root);
  const result = await fetchRepos(state.content);
  repos = result.repos;
  loading = false;
  lastSource = result.source;
  lastRateLimited = result.rateLimited;

  sourceEl.dataset.state = result.source;
  sourceEl.querySelector("span").textContent = i18n.t(state.strings[`pr_source_${result.source}`]);

  const warnEl = $("#projects-warning", root);
  warnEl.hidden = !result.rateLimited;

  paint(root);
  document.dispatchEvent(new Event("reposready"));
}

function languages() {
  const set = new Set(repos.map((r) => r.language).filter(Boolean));
  return [...set].sort();
}

function paint(root) {
  const list = $("#projects-list", root);
  const filters = $("#projects-filters", root);
  const langs = languages();

  filters.innerHTML = ["all", ...langs]
    .map((lang) => {
      const label = lang === "all" ? i18n.t(state.strings.pr_filter_all) : lang;
      const n = lang === "all" ? repos.length : repos.filter((r) => r.language === lang).length;
      return `<button class="filter" type="button" data-filter="${esc(lang)}" aria-pressed="${
        filter === lang ? "true" : "false"
      }">${esc(label)}<span class="muted"> ${n}</span></button>`;
    })
    .join("");

  $$(".filter", filters).forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      paint(root);
    });
  });

  const shown = filter === "all" ? repos : repos.filter((r) => r.language === filter);
  $("#projects-count", root).textContent = `${shown.length} ${i18n.t(state.strings.pr_count)}`;

  list.innerHTML = shown.map(row).join("");
  requestAnimationFrame(() => $$(".project", list).forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = `opacity 320ms ease ${i * 35}ms, transform 320ms ease ${i * 35}ms`;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }));
}

function starLabel(n) {
  const k = n || 0;
  if (i18n.lang === "en") return `${k} ${k === 1 ? "star" : "stars"}`;
  return `${k} ${plural(k, "звезда", "звезды", "звёзд")}`;
}

function forkLabel(n) {
  const k = n || 0;
  if (i18n.lang === "en") return `${k} ${k === 1 ? "fork" : "forks"}`;
  return `${k} ${plural(k, "форк", "форка", "форков")}`;
}

function plural(n, one, few, many) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const SOURCE_LABELS = {
  live: { key: "pr_source_live", state: "live" },
  cache: { key: "pr_source_cache", state: "cache" },
  error: { key: "pr_source_error", state: "error" },
  loading: { key: "sb_loading", state: "loading" },
};

export function sourceLabel(source = lastSource) {
  return i18n.t(state.strings[SOURCE_LABELS[source]?.key || "sb_loading"]);
}

function row(r) {
  const desc = r.description ? i18n.t(r.description) : "";
  const note = r.note ? i18n.t(r.note) : "";
  const lang = r.language || "—";
  const topics = (r.topics || []).slice(0, 4);
  return `
    <article class="project">
      <div class="project__lang"><i class="lang-dot" style="background:${langColor(r.language)}"></i>${esc(lang)}</div>
      <div class="project__main">
        <h3 class="project__name">${esc(r.name)}</h3>
        ${desc ? `<p class="project__desc">${esc(desc)}</p>` : ""}
        ${note ? `<p class="project__note">${esc(note)}</p>` : ""}
        ${
          r.command
            ? `<div class="project__cmd"><span class="prompt">$</span><code>${esc(r.command)}</code></div>`
            : ""
        }
        ${
          topics.length
            ? `<div class="project__topics">${topics.map((t) => `<span>${esc(t)}</span>`).join("")}</div>`
            : ""
        }
        <div class="project__meta" style="margin-top:10px">
          <span title="${esc(starLabel(r.stars))}">${icon("star")}${esc(String(r.stars ?? 0))}</span>
          <span title="${esc(forkLabel(r.forks))}">${icon("fork")}${esc(String(r.forks ?? 0))}</span>
          <span>${esc(timeAgo(r.pushed_at))}</span>
          <span>${esc(i18n.t(state.strings.pr_created))} ${esc(formatDate(r.created_at))}</span>
          ${r.license ? `<span>${esc(r.license)}</span>` : ""}
        </div>
      </div>
      <a class="project__go" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${esc(i18n.t(state.strings.pr_open))} — ${esc(r.name)}" title="${esc(
           i18n.t(state.strings.pr_open),
         )}">${icon("external")}</a>
    </article>`;
}

export function refreshProjects(root) {
  toast(i18n.t({ ru: "обновляю список…", en: "refreshing…" }));
  load(root);
}
