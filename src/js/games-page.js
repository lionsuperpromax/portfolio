import { $, esc, i18n, state, store } from "./util.js";
import { createSnake } from "../games/snake.js";
import { createMemory } from "../games/memory.js";
import { createBreakout } from "../games/breakout.js";
import { createQuiz } from "../games/quiz.js";
import { createReaction } from "../games/reaction.js";

const FACTORIES = {
  snake: createSnake,
  memory: createMemory,
  breakout: createBreakout,
  quiz: createQuiz,
  reaction: createReaction,
};

const bests = store("ls.games.best", {});

function bestLabel(id) {
  const best = bests.get()[id];
  return best ? `${i18n.t(i18n.strings.games_best)} ${best}` : i18n.t(i18n.strings.games_none);
}

export function renderGames(root, { wm }) {
  const grid = $("#games-grid", root);
  if (!grid) return;

  grid.innerHTML = state.content.games
    .map(
      (g) => `
      <button class="game-card" type="button" data-game="${esc(g.id)}">
        <span class="game-card__art">${thumb(g.id)}</span>
        <span class="game-card__body">
          <span class="game-card__title">${esc(g.title)}</span>
          <span class="game-card__sub">${esc(i18n.t(g.subtitle))}</span>
          <span class="game-card__foot">
            <span>${esc(i18n.t(i18n.strings.games_play))} →</span>
            <span class="game-card__high">${esc(bestLabel(g.id))}</span>
          </span>
        </span>
      </button>`,
    )
    .join("");

  grid.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const game = state.content.games.find((g) => g.id === card.dataset.game);
      const factory = FACTORIES[game.id];
      if (factory) wm.openGame(game, factory);
    });
  });

  document.addEventListener("gamebest", () => {
    grid.querySelectorAll(".game-card").forEach((card) => {
      const el = $(".game-card__high", card);
      if (el) el.textContent = bestLabel(card.dataset.game);
    });
  });
}

/* tiny hand-drawn previews instead of screenshots */
function thumb(id) {
  const s = `width="100%" height="100%" viewBox="0 0 120 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true"`;
  const gridLines = `<g stroke="var(--rule)" stroke-width=".5" opacity=".8"><path d="M0 12h120M0 32h120M0 52h120M20 0v64M50 0v64M80 0v64M105 0v64"/></g>`;
  switch (id) {
    case "snake":
      return `<svg ${s}>${gridLines}
        <g fill="var(--ink)" opacity=".9"><rect x="14" y="26" width="11" height="11"/><rect x="25" y="26" width="11" height="11"/><rect x="36" y="26" width="11" height="11"/><rect x="47" y="26" width="11" height="11"/></g>
        <rect x="47" y="26" width="11" height="11" fill="var(--accent)"/>
        <rect x="82" y="14" width="12" height="12" fill="none" stroke="var(--ink3)" stroke-dasharray="2 2"/>
      </svg>`;
    case "memory":
      return `<svg ${s}>${gridLines}
        <g stroke="var(--ink)" stroke-width="1">
          <rect x="22" y="14" width="17" height="22" fill="var(--paper3)"/>
          <rect x="43" y="14" width="17" height="22" fill="var(--accent)"/>
          <rect x="64" y="14" width="17" height="22" fill="var(--paper)"/>
          <rect x="85" y="14" width="17" height="22" fill="var(--ink)"/>
        </g>
      </svg>`;
    case "breakout":
      return `<svg ${s}>
        <g fill="var(--rule-strong)">${[0, 1, 2, 3, 4, 5]
          .map((i) => `<rect x="${8 + i * 18}" y="12" width="15" height="6"/>`)
          .join("")}</g>
        <rect x="46" y="52" width="28" height="4" fill="var(--accent)"/>
        <circle cx="74" cy="40" r="3" fill="var(--ink)"/>
      </svg>`;
    case "quiz":
      return `<svg ${s}>
        <text x="10" y="26" font-family="monospace" font-size="11" fill="var(--ink)">&gt; run help</text>
        <text x="10" y="41" font-family="monospace" font-size="11" fill="var(--ok)">✓ 10 tools</text>
        <text x="10" y="56" font-family="monospace" font-size="11" fill="var(--ink3)">✕ 3 tools</text>
      </svg>`;
    case "reaction":
      return `<svg ${s}>
        <g fill="none" stroke="var(--rule-strong)" stroke-width="1">
          <rect x="14" y="10" width="21" height="18"/><rect x="39" y="10" width="21" height="18"/>
          <rect x="64" y="10" width="21" height="18"/><rect x="89" y="10" width="21" height="18"/>
          <rect x="14" y="32" width="21" height="18"/><rect x="64" y="32" width="21" height="18"/>
          <rect x="89" y="32" width="21" height="18"/>
        </g>
        <rect x="39" y="32" width="21" height="18" fill="var(--accent)"/>
      </svg>`;
    default:
      return "";
  }
}
