import { state } from "./util.js";

const USER = "lionsuperpromax";
const TTL = 10 * 60 * 1000;
const CACHE_KEY = `ls.repos.${USER}`;

/**
 * Live list of public repos.
 * 1. Netlify function proxy (if deployed there)
 * 2. direct GitHub API
 * 3. localStorage copy
 * 4. bundled content.json
 */
export async function fetchRepos(content) {
  const fallback = (content?.repos || []).map(normalizeLoose);

  const cached = readCache();
  const sources = [
    { kind: "live", url: "/api/github" },
    { kind: "live", url: `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed` },
  ];

  let rateLimited = false;
  for (const src of sources) {
    try {
      const res = await fetch(src.url, { headers: { Accept: "application/vnd.github+json" } });
      if (res.status === 403 || res.status === 429) {
        rateLimited = true;
        continue;
      }
      if (!res.ok) continue;
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.repos;
      if (!Array.isArray(list) || !list.length) continue;
      const repos = list.filter((r) => !r.fork).map(normalizeAPI).sort(byPushed);
      writeCache(repos);
      state.source = "live";
      return { repos: mergeNotes(repos, fallback), source: "live", rateLimited: false };
    } catch {
      /* network down — next source */
    }
  }

  if (cached?.length) {
    state.source = "cache";
    return { repos: mergeNotes(cached, fallback), source: rateLimited ? "error" : "cache", rateLimited };
  }

  state.source = "cache";
  return { repos: fallback, source: rateLimited ? "error" : "cache", rateLimited };
}

function byPushed(a, b) {
  return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
}

function normalizeAPI(r) {
  return {
    name: r.name,
    description: r.description || "",
    url: r.html_url,
    homepage: r.homepage || null,
    language: r.language || null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    license: r.license?.spdx_id || null,
    topics: r.topics || [],
    pushed_at: r.pushed_at,
    created_at: r.created_at,
  };
}

function normalizeLoose(r) {
  return {
    ...r,
    stars: r.stars ?? 0,
    forks: r.forks ?? 0,
    homepage: r.homepage ?? null,
  };
}

/** keep the hand-written Russian notes from content.json for known repos */
function mergeNotes(repos, fallback) {
  const byName = new Map(fallback.map((r) => [r.name.toLowerCase(), r]));
  return repos.map((r) => {
    const local = byName.get(r.name.toLowerCase());
    return local ? { ...local, ...r, description: local.description ?? r.description, note: local.note } : r;
  });
}

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!raw || !Array.isArray(raw.repos)) return null;
    if (Date.now() - raw.t > TTL * 3) return null;
    return raw.repos;
  } catch {
    return null;
  }
}

function writeCache(repos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos }));
  } catch {
    /* ignore quota */
  }
}

export const LANG_COLORS = {
  "C++": "#a8342a",
  C: "#7d7769",
  Python: "#3f6e4a",
  Shell: "#a67c1f",
  JavaScript: "#a67c1f",
  TypeScript: "#2b5d8a",
  Rust: "#8a4b2b",
  Go: "#2b7a8a",
  HTML: "#a8342a",
  CSS: "#4a5c8a",
  "C#": "#5b3f8a",
  Java: "#8a5b2b",
  Lua: "#3b3f8a",
};

export function langColor(lang) {
  return LANG_COLORS[lang] || "var(--rule-strong)";
}

export function repoKey(name) {
  return `${USER}/${name}`;
}

export function repoUrl(name) {
  return `https://github.com/${USER}/${name}`;
}
