import { i18n } from "../js/util.js";

/** shared bits for the five mini-games */

export function hud(html) {
  return `<div class="hud">${html}</div>`;
}

export function stat(label, id) {
  return `<span class="stat">${label} <b id="${id}">0</b></span>`;
}

export function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const T = {
  score: () => i18n.t({ ru: "счёт", en: "score" }),
  best: () => i18n.t({ ru: "рекорд", en: "best" }),
  start: () => i18n.t({ ru: "старт", en: "start" }),
  restart: () => i18n.t({ ru: "заново", en: "restart" }),
  pause: () => i18n.t({ ru: "пауза", en: "pause" }),
  resume: () => i18n.t({ ru: "продолжить", en: "resume" }),
  again: () => i18n.t({ ru: "ещё раз", en: "again" }),
  next: () => i18n.t({ ru: "дальше", en: "next" }),
  level: () => i18n.t({ ru: "уровень", en: "level" }),
  lives: () => i18n.t({ ru: "жизни", en: "lives" }),
  flips: () => i18n.t({ ru: "ходов", en: "flips" }),
  time: () => i18n.t({ ru: "время", en: "time" }),
  tapStart: () => i18n.t({ ru: "нажмите «старт»", en: "press start" }),
  newRecord: () => i18n.t({ ru: "новый рекорд", en: "new record" }),
  kb: () => i18n.t({ ru: "стрелки / WASD", en: "arrows / WASD" }),
};

/** rounded-rect path helper used by canvas games */
export function rect(ctx, x, y, w, hh) {
  ctx.beginPath();
  ctx.rect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(hh));
}

/** palette mirror of the CSS tokens */
export const C = {
  paper: "#f2eee6",
  paper2: "#e9e3d7",
  paper3: "#dfd7c8",
  ink: "#1c1b18",
  ink2: "#4a473f",
  ink3: "#7d7769",
  rule: "#cfc6b4",
  ruleStrong: "#a89f8c",
  accent: "#c8553d",
  ok: "#3f6e4a",
  warn: "#a67c1f",
  bad: "#a8342a",
};
