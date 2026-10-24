/* icons — 1.5px stroke, no filled blobs except the GitHub logo.
   Kept here instead of an icon package: five icons don't justify 40 KB. */

const paths = {
  about: `<circle cx="12" cy="8.5" r="3.4"/><path d="M5.5 19.5c.6-3.3 3.3-5.2 6.5-5.2s5.9 1.9 6.5 5.2"/>`,
  projects: `<path d="M3.5 6.5h6l1.6 2h9.4v9.8a1.2 1.2 0 0 1-1.2 1.2H4.7a1.2 1.2 0 0 1-1.2-1.2z"/><path d="M3.5 9.5h17"/>`,
  terminal: `<rect x="3" y="4.5" width="18" height="15" rx="1"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5"/>`,
  games: `<rect x="2.5" y="7" width="19" height="10.5" rx="2.5"/><path d="M7 10.5v3.5M5.2 12.2h3.6"/><circle cx="16" cy="11.4" r=".9"/><circle cx="17.8" cy="13.4" r=".9"/>`,
  contact: `<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3.6 5.8l8.4 6 8.4-6"/>`,
  external: `<path d="M8 16L16 8M9.5 8H16v6.5"/>`,
  arrow: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  copy: `<rect x="9" y="9" width="11" height="11" rx="1"/><path d="M15 9V4H4v11h5"/>`,
  star: `<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>`,
  fork: `<circle cx="6" cy="5.5" r="2"/><circle cx="18" cy="5.5" r="2"/><circle cx="12" cy="18.5" r="2"/><path d="M6 7.5v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M12 11.5v5"/>`,
  refresh: `<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4"/>`,
  play: `<path d="M8 5.5l10 6.5-10 6.5z" fill="currentColor" stroke="none"/>`,
};

export function icon(name, cls = "") {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

export const GITHUB_PATH =
  "M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z";

export function githubIcon(size = 24) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="${GITHUB_PATH}"/></svg>`;
}
