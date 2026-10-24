/* =========================================================
   tiny helpers: dom, events, i18n, persistence
   ========================================================= */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** escape untrusted text before putting it into innerHTML */
export function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

export function on(el, type, fn, opts) {
  el.addEventListener(type, fn, opts);
  return () => el.removeEventListener(type, fn, opts);
}

/* ---------------- i18n ---------------- */

const LANG_KEY = "ls.lang";
const listeners = new Set();

export const i18n = {
  lang: "ru",

  init(defaultLang = "ru") {
    const saved = localStorage.getItem(LANG_KEY);
    const browser = (navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
    this.lang = saved || (browser === "ru" || browser === "en" ? browser : defaultLang);
    this.apply();
    return this.lang;
  },

  set(lang) {
    if (lang === this.lang) return;
    this.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    this.apply();
    listeners.forEach((fn) => fn(lang));
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  },

  toggle() {
    this.set(this.lang === "ru" ? "en" : "ru");
  },

  /** pick a localized value: string | {ru,en} | array of those */
  t(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((v) => this.t(v));
    return value[this.lang] ?? value.ru ?? value.en ?? "";
  },

  apply() {
    document.documentElement.lang = this.lang;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/* shared mutable state so i18n.apply can reach rendered strings */
export const state = {
  strings: {},
  content: null,
  repos: [],
  source: "none",
};

/* ---------------- misc ---------------- */

export function store(key, fallback = null) {
  return {
    get() {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* private mode / quota — games still work, scores just don't persist */
      }
    },
  };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouch() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

let toastEl = null;
let toastTimer = 0;

export function toast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 1900);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86400000);
  const ru = i18n.lang === "ru";
  if (days < 1) return ru ? "сегодня" : "today";
  if (days < 30) return ru ? `${days} дн. назад` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return ru ? `${months} мес. назад` : `${months}mo ago`;
  const years = (days / 365).toFixed(1).replace(".0", "");
  return ru ? `${years} г. назад` : `${years}y ago`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const t = new Intl.DateTimeFormat(i18n.lang === "ru" ? "ru-RU" : "en-GB", {
    month: "short",
    year: "numeric",
  });
  return t.format(d);
}
