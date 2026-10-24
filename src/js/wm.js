import { $, $$, esc, i18n, store } from "./util.js";
import { icon } from "./icons.js";

const bests = store("ls.games.best", {});

/**
 * Window manager for the game windows.
 * Real dragging, z-order, keyboard focus, Esc to close, one instance per game.
 */
export function createWM(root) {
  const layer = $("#gw-layer", root);
  const open = new Map();
  let z = 120;
  let cascade = 0;

  // clamp windows back into the viewport on resize
  addEventListener("resize", () => {
    open.forEach((entry) => clamp(entry.el));
  });

  function clamp(el) {
    const r = el.getBoundingClientRect();
    const maxX = innerWidth - Math.min(r.width, innerWidth - 12) - 6;
    const maxY = innerHeight - 60;
    let x = parseFloat(el.style.left) || r.left;
    let y = parseFloat(el.style.top) || r.top;
    x = Math.min(Math.max(6, x), Math.max(6, maxX));
    y = Math.min(Math.max(6, y), Math.max(6, maxY));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function focusWindow(el) {
    if (el.style.zIndex && +el.style.zIndex === z) return;
    z += 1;
    el.style.zIndex = String(z);
    $$(".gw", layer).forEach((w) => w.classList.toggle("is-focus", w === el));
  }

  function openGame(game, factory) {
    const existing = open.get(game.id);
    if (existing) {
      focusWindow(existing.el);
      existing.el.animate(
        [{ transform: "none" }, { transform: "scale(1.012)" }, { transform: "none" }],
        { duration: 180, easing: "ease-out" },
      );
      return;
    }

    const el = document.createElement("section");
    el.className = "gw";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "false");
    el.setAttribute("aria-label", game.title);
    el.tabIndex = -1;
    const w = Math.min(520, innerWidth - 24);
    const hGuess = 520;
    const baseX = Math.max(8, (innerWidth - w) / 2 - 60 + cascade * 22);
    const baseY = Math.max(44, (innerHeight - hGuess) / 2 + cascade * 18);
    cascade = (cascade + 1) % 6;
    el.style.setProperty("--gw-w", `${w}px`);
    el.style.left = `${Math.min(baseX, innerWidth - w - 12)}px`;
    el.style.top = `${Math.max(10, baseY)}px`;

    el.innerHTML = `
      <div class="gw__bar">
        <span class="gw__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="gw__title"><b>▸</b> ${esc(game.title)}</span>
        <button class="gw__x" type="button" aria-label="${esc(
          i18n.t({ ru: "Закрыть", en: "Close" }),
        )}">✕</button>
      </div>
      <div class="gw__body">
        <p class="gw__hint">${esc(i18n.t(game.hint))}</p>
        <div class="gw__game"></div>
      </div>`;

    if (innerWidth < 640) {
      el.style.left = "12px";
      el.style.top = "48px";
      el.style.setProperty("--gw-w", `${innerWidth - 24}px`);
    }

    layer.appendChild(el);
    focusWindow(el);

    const gameHost = $(".gw__game", el);
    const api = factory(gameHost, {
      onClose: () => close(game.id),
      best: () => bests.get()[game.id] || 0,
      saveBest(score) {
        const b = bests.get();
        if (score > (b[game.id] || 0)) {
          b[game.id] = score;
          bests.set(b);
          document.dispatchEvent(new CustomEvent("gamebest", { detail: { id: game.id, score } }));
          return true;
        }
        return false;
      },
    });

    open.set(game.id, { el, api });

    // close
    $(".gw__x", el).addEventListener("click", () => close(game.id));

    // drag by the title bar
    const bar = $(".gw__bar", el);
    let drag = null;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      drag = {
        dx: e.clientX - el.offsetLeft,
        dy: e.clientY - el.offsetTop,
        id: e.pointerId,
      };
      bar.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      focusWindow(el);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const x = Math.min(Math.max(0, e.clientX - drag.dx), innerWidth - 80);
      const y = Math.min(Math.max(0, e.clientY - drag.dy), innerHeight - 40);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.classList.remove("is-dragging");
      clamp(el);
    };
    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);

    // Esc closes the focused window; only when the game itself isn't using Esc
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !api.usesEsc) close(game.id);
    });

    el.addEventListener("pointerdown", () => focusWindow(el));

    setTimeout(() => {
      el.focus({ preventScroll: true });
      api.focus?.();
    }, 30);
  }

  function close(id) {
    const entry = open.get(id);
    if (!entry) return;
    entry.api.destroy?.();
    open.delete(id);
    entry.el.classList.add("is-closing");
    setTimeout(() => entry.el.remove(), 150);
  }

  function closeAll() {
    [...open.keys()].forEach(close);
  }

  function isOpen(id) {
    return open.has(id);
  }

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const focused = $$(".gw", layer).find((w) => w.classList.contains("is-focus"));
    if (!focused) return;
    const entry = [...open.entries()].find(([, v]) => v.el === focused);
    if (entry && !entry[1].api.usesEsc) {
      e.preventDefault();
      close(entry[0]);
    }
  });

  return { openGame, close, closeAll, isOpen };
}

export function gameIcon(name) {
  return icon(name);
}
