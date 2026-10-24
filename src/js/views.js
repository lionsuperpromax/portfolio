/**
 * build page markup. Everything static lives here; the renderers in
 * ./about, ./projects, ./games-page and ./contact only fill dynamic parts.
 * Re-run buildShell() on language change and rebind events.
 */

import { esc, i18n } from "./util.js";
import { icon, GITHUB_PATH } from "./icons.js";

const T = (key) => esc(i18n.t(i18n.strings[key]));
const TT = (ru, en) => esc(i18n.lang === "ru" ? ru : en);

export const NAV = [
  { id: "about", icon: "about", key: "nav_about" },
  { id: "projects", icon: "projects", key: "nav_projects" },
  { id: "terminal", icon: "terminal", key: "nav_terminal" },
  { id: "games", icon: "games", key: "nav_games" },
  { id: "contact", icon: "contact", key: "nav_contact" },
];

export function buildShell(profile) {
  return `
    <div class="shell">
      <header class="chrome">
        <div class="chrome__dots" aria-hidden="true"><i class="dot"></i><i class="dot"></i><i class="dot"></i></div>
        <div class="chrome__path">
          <b>${esc(profile.login)}</b><span class="chrome__path-mid">@portfolio</span><span>:</span><span>~</span>
          <i class="caret" aria-hidden="true"></i>
        </div>
        <div class="chrome__right">
          <span class="chrome__version">${T("version")}</span>
          <button class="chrome__btn" id="btn-lang" type="button" title="${TT(
            "Переключить на английский",
            "Переключить на русский",
          )}">${esc(i18n.lang === "ru" ? "EN" : "RU")}</button>
          <a class="chrome__btn" href="${profile.links.github}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="${GITHUB_PATH}"/></svg>
            <span class="hide-sm">GitHub</span>
          </a>
        </div>
      </header>

      <div class="workspace">
        <nav class="launcher" aria-label="${T("nav_aria")}">
          <div class="launcher__label">${T("launcher_label")}</div>
          <div class="launcher__list" role="tablist">
            ${NAV.map(
              (n, i) => `
              <button class="app-icon" type="button" role="tab" aria-controls="pane-${n.id}" id="tab-${n.id}"
                      data-nav="${n.id}" aria-current="false" title="${i + 1}">
                ${icon(n.icon)}
                <span>${T(n.key)}</span>
              </button>`,
            ).join("")}
          </div>
          <div class="launcher__foot">
            <a href="${profile.links.github}" target="_blank" rel="noopener noreferrer">github.com/${esc(profile.login)}</a><br>
            <span id="foot-state">…</span>
          </div>
        </nav>

        <main class="stage">
          ${pane("about", aboutPane())}
          ${pane("projects", projectsPane())}
          ${pane("terminal", terminalPane())}
          ${pane("games", gamesPane())}
          ${pane("contact", contactPane(profile))}
          <div id="gw-layer"></div>
        </main>
      </div>

      <footer class="statusbar">
        <span><i class="status-dot" id="sb-dot"></i><span id="sb-text">…</span></span>
        <span class="hide-sm"><span id="sb-repos">—</span> ${T("sb_repos")}</span>
        <span class="hide-sm">${T("sb_hint")}</span>
        <span class="spacer"></span>
        <span class="hide-sm">${T("ct_footer")}</span>
        <span class="clock" id="clock">--:--</span>
      </footer>
    </div>`;
}

function pane(id, html) {
  return `<section class="pane" id="pane-${id}" role="tabpanel" aria-labelledby="tab-${id}" tabindex="-1">${html}</section>`;
}

/* ------------------------------------------------------------------ */

function aboutPane() {
  return `
  <div class="pane__inner about-grid">
    <div>
      <div class="kicker"><span class="idx">01</span> ${T("about_kicker")}</div>
      <div class="about-hero">
        <figure class="portrait"><img src="./avatar.png" width="420" height="420" alt="Bogdan (lionsuperpromax)" /></figure>
        <div>
          <h1 class="about-name" id="about-name">Богдан</h1>
          <p class="about-handle"><span class="at">@</span><span id="about-handle">lionsuperpromax</span> · <span id="about-role"></span></p>
          <p class="about-tagline" id="about-tagline"></p>
        </div>
      </div>
      <div class="prose" id="about-bio"></div>
      <hr class="hr" />
      <div class="stack" id="about-stack"></div>
    </div>

    <aside>
      <h2 class="side-title">${T("about_facts")}</h2>
      <ul class="facts" id="about-facts"></ul>
      <hr class="hr" />
      <h2 class="side-title">${T("about_activity")}</h2>
      <div class="activity" id="about-activity"></div>
      <hr class="hr" />
      <h2 class="side-title">${T("about_links")}</h2>
      <div class="quick-links" id="about-links">
        <a id="about-gh-link" href="https://github.com/lionsuperpromax" target="_blank" rel="noopener noreferrer">
          <span><span id="about-github-badge" style="display:inline-flex;vertical-align:-3px;margin-right:6px"></span>${T("about_link_gh")}</span>
          <span class="arrow">→</span>
        </a>
        <a href="#projects"><span>${T("about_link_projects")}</span><span class="arrow">→</span></a>
        <a href="#terminal"><span>${T("about_link_term")}</span><span class="arrow">→</span></a>
        <a href="#games"><span>${T("about_link_games")}</span><span class="arrow">→</span></a>
      </div>
    </aside>
  </div>`;
}

function projectsPane() {
  return `
  <div class="pane__inner">
    <div class="projects-head">
      <div>
        <div class="kicker"><span class="idx">02</span> ${T("pr_kicker")}</div>
        <h1 class="title">${T("pr_title")}</h1>
        <p class="lead">${T("pr_lead")}</p>
      </div>
      <span class="source" id="projects-source" data-source data-state="loading"><i class="dot"></i><span>…</span></span>
    </div>

    <div class="projects-toolbar">
      <div id="projects-filters" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      <span class="count" id="projects-count"></span>
    </div>

    <p id="projects-warning" hidden style="color:var(--warn);font-size:12px;margin-top:10px">${T("pr_rate")}</p>

    <div class="projects-list" id="projects-list" aria-live="polite"></div>

    <div class="projects-foot">
      <span>${T("pr_foot")}</span>
      <a class="btn btn--ghost" href="https://github.com/lionsuperpromax" target="_blank" rel="noopener noreferrer">
        ${icon("external")} ${T("pr_repo_link")}
      </a>
    </div>
  </div>`;
}

function terminalPane() {
  const hints = ["help", "whoami", "projects", "stack", "open games", "help2"];
  return `
  <div class="pane__inner">
    <div class="kicker"><span class="idx">03</span> ${T("term_kicker")}</div>
    <h1 class="title">${T("term_title")}</h1>
    <p class="lead" style="margin-bottom:22px">${T("term_lead")}</p>

    <div class="term">
      <div class="term__bar">
        <i class="dot"></i><i class="dot"></i><i class="dot"></i>
        <span class="term__title"><b>bogdan@portfolio</b>: ~ — bash</span>
      </div>
      <div class="term__out" id="term-out" aria-live="polite"></div>
      <form class="term__input" id="term-form" autocomplete="off">
        <span class="ps1"><b>➜</b> ~</span>
        <label class="sr-only" for="term-input">${T("term_aria")}</label>
        <input id="term-input" name="cmd" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />
      </form>
    </div>

    <div class="term__hint">
      <span>${T("term_hint_label")}</span>
      ${hints.map((c) => `<button type="button" data-cmd="${c}">${c}</button>`).join("")}
    </div>
  </div>`;
}

function gamesPane() {
  return `
  <div class="pane__inner">
    <div class="games-intro">
      <div class="kicker"><span class="idx">04</span> ${T("games_kicker")}</div>
      <h1 class="title">${T("games_title")}</h1>
      <p class="lead">${T("games_lead")}</p>
    </div>
    <div class="games-grid" id="games-grid"></div>
  </div>`;
}

function contactPane(profile) {
  return `
  <div class="pane__inner contact-wrap">
    <div class="kicker"><span class="idx">05</span> ${T("ct_kicker")}</div>
    <h1 class="title">${T("ct_title")}</h1>
    <p class="lead">${T("ct_lead")}</p>

    <a class="contact-big" id="contact-github" href="${profile.links.github}" target="_blank" rel="noopener noreferrer">
      <span id="contact-gh-icon"></span>
      <span>github.com/${esc(profile.login)}</span>
    </a>

    <div class="contact-actions">
      <button class="btn" type="button" id="contact-copy"></button>
      <a class="btn btn--ghost" href="${profile.links.github}?tab=repositories" target="_blank" rel="noopener noreferrer">
        ${TT("репозитории", "repositories")}
      </a>
    </div>

    <div class="contact-note">
      <h2 class="side-title">${T("ct_avail_title")}</h2>
      <ul id="contact-note"></ul>
      <p style="margin-top:14px" id="contact-why"></p>
    </div>
  </div>`;
}
