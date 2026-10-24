/**
 * GitHub proxy for Netlify Functions.
 * Browser -> /api/github -> api.github.com/users/lionsuperpromax/repos
 *
 * Why: anonymous GitHub API allows 60 requests/hour per IP, and on a
 * shared hosting edge that quota is shared by many visitors. A token in
 * the Netlify env (GITHUB_TOKEN) lifts it to 5,000/hour. Without a token
 * this still works, just with the smaller limit.
 *
 * Deploy note: Netlify's modern bundler labels ESM files as .mjs/.js with
 * `"type": "module"` in the root package.json (which this project has).
 */

const USER = "lionsuperpromax";
const TTL = 10 * 60 * 1000; // 10 minutes of in-memory cache

let memory = { at: 0, body: null };

export async function handler(event) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "lionsuperpromax-portfolio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const now = Date.now();
  if (memory.body && now - memory.at < TTL) {
    return json(200, memory.body, "hit");
  }

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers,
    });

    if (!res.ok) {
      if (memory.body) return json(200, memory.body, "stale");
      return json(res.status, { error: "github", status: res.status }, "miss");
    }

    const repos = await res.json();
    if (!Array.isArray(repos)) {
      return json(502, { error: "github", message: "unexpected payload" }, "miss");
    }

    const trimmed = repos
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        license: r.license ? { spdx_id: r.license.spdx_id } : null,
        topics: r.topics || [],
        pushed_at: r.pushed_at,
        created_at: r.created_at,
      }));

    memory = { at: now, body: trimmed };
    return json(200, trimmed, "miss");
  } catch {
    if (memory.body) return json(200, memory.body, "stale");
    return json(502, { error: "network" }, "miss");
  }
}

function json(status, body, cacheState) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Cache": cacheState,
    },
    body: JSON.stringify(body),
  };
}
