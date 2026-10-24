import { $, esc, i18n, state, formatDate } from "./util.js";
import { githubIcon, icon } from "./icons.js";

export function renderAbout(root) {
  const p = state.content.profile;
  const repos = state.repos.length ? state.repos : state.content.repos;

  $("#about-name", root).textContent = p.name;
  $("#about-role", root).textContent = i18n.t(p.role);
  $("#about-handle", root).textContent = p.login;
  $("#about-tagline", root).textContent = i18n.t(p.tagline);

  $("#about-bio", root).innerHTML = i18n.t(p.bio).map((par) => `<p>${esc(par)}</p>`).join("");
  $("#about-stack", root).innerHTML = p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
  $("#about-facts", root).innerHTML = i18n.t(p.facts).map((f) => `<li>${esc(f)}</li>`).join("");

  $("#about-github-badge", root).innerHTML = githubIcon(16);
  $("#about-gh-link").href = p.links.github;

  $("#about-activity", root).innerHTML = activitySvg(repos);
}

/** one bar per repo, height = how recently it was pushed. No fake commit grid. */
function activitySvg(repos) {
  const items = repos
    .slice(0, 10)
    .map((r) => ({ name: r.name, t: new Date(r.pushed_at || 0).getTime(), iso: r.pushed_at }))
    .sort((a, b) => a.t - b.t);

  const W = 300;
  const H = 68;
  const gap = 7;
  const bw = (W - gap * (items.length - 1)) / Math.max(1, items.length);
  const max = Math.max(...items.map((i) => i.t));
  const min = Math.min(...items.map((i) => i.t));

  const bars = items
    .map((it, i) => {
      const k = max === min ? 1 : 0.22 + 0.78 * ((it.t - min) / (max - min));
      const h = Math.max(5, Math.round(H * k));
      const x = i * (bw + gap);
      const hot = i === items.length - 1;
      return `<rect class="activity-bar${hot ? " is-hot" : ""}" x="${x.toFixed(1)}" y="${H - h}" width="${bw.toFixed(
        1,
      )}" height="${h}" rx="1"><title>${esc(it.name)} — ${esc(formatDate(it.iso))}</title></rect>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${W} ${H + 4}" role="img" aria-label="${esc(i18n.t(i18n.strings.about_activity))}">
      <line x1="0" y1="${H + 0.5}" x2="${W}" y2="${H + 0.5}" stroke="var(--rule-strong)" stroke-width="1"/>
      ${bars}
    </svg>
    <div class="activity-legend">
      <span>${esc(items[0]?.name || "")}</span>
      <span>${esc(i18n.t(i18n.strings.about_activity_legend))}</span>
      <span>${esc(items[items.length - 1]?.name || "")}</span>
    </div>`;
}
