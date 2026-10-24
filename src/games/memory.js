import { T, hud, stat, h } from "./common.js";

/* GrandShield: драйверы — memory pairs.
   Pairs are (name, verdict): a suspicious driver and its matching finding. */

const PAIRS = [
  { icon: "⚑", a: "rtcore64.sys", b: "подписан, но старый" },
  { icon: "✕", a: "drvinst.exe", b: "нет цифровой подписи" },
  { icon: "◉", a: "ntoskrnl.exe", b: "системный — не трогать" },
  { icon: "⚠", a: "xigncode.sys", b: "обфусцирован" },
  { icon: "⇄", a: "vboxdrv.sys", b: "гипервизор" },
  { icon: "▣", a: "disk.sys", b: "всё в порядке" },
  { icon: "?", a: "unknown.sys", b: "пустое описание" },
  { icon: "◆", a: "vulnerable.sys", b: "известная CVE" },
];

export function createMemory(host, api) {
  const pairs = PAIRS.slice(0, 4 + Math.floor(Math.random() * 2)); // 4–5 пар
  const cards = [];
  pairs.forEach((p, i) => {
    cards.push({ key: i, side: "a", icon: p.icon, label: p.a });
    cards.push({ key: i, side: "b", icon: p.icon, label: p.b });
  });
  shuffle(cards);

  const cols = cards.length <= 8 ? 4 : cards.length === 10 ? 5 : 4;

  const ui = h(`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${hud(`${stat(T.flips(), "mem-flips")}${stat(T.time(), "mem-time")}<span class="spacer"></span>
        <button class="btn" id="mem-restart" type="button">${T.restart()}</button>`)}
      <div class="mem-grid" style="--cols:${cols}" id="mem-grid"></div>
    </div>`);
  host.appendChild(ui);

  const grid = ui.querySelector("#mem-grid");
  const flipsEl = ui.querySelector("#mem-flips");
  const timeEl = ui.querySelector("#mem-time");

  let up = [];
  let matched = 0;
  let flips = 0;
  let locked = false;
  let started = null;
  let timer = null;
  let done = false;
  let time = 0;

  const restart = () => {
    clearInterval(timer);
    host.innerHTML = "";
    host._mem?.destroy();
    host._mem = createMemory(host, api);
  };

  const restartBtn = ui.querySelector("#mem-restart");
  restartBtn.addEventListener("click", restart);

  grid.innerHTML = cards
    .map(
      (c, i) => `
      <button class="mem-card" type="button" data-i="${i}" aria-label="${T.flips()}">
        <span class="back">.sys</span>
        <span class="face">${c.icon}</span>
        <span class="lbl">${c.label}</span>
      </button>`,
    )
    .join("");

  const els = [...grid.children];

  function tick() {
    time += 1;
    timeEl.textContent = `${time}с`;
  }

  function flip(i) {
    const el = els[i];
    if (locked || el.classList.contains("is-up") || el.classList.contains("is-match") || done) return;
    if (!started) {
      started = true;
      timer = setInterval(tick, 1000);
    }
    el.classList.add("is-up");
    up.push(i);
    if (up.length === 2) {
      flips += 1;
      flipsEl.textContent = String(flips);
      const [a, b] = up;
      if (cards[a].key === cards[b].key && a !== b) {
        locked = true;
        setTimeout(() => {
          els[a].classList.add("is-match");
          els[b].classList.add("is-match");
          up = [];
          matched += 1;
          locked = false;
          if (matched === pairs.length) win();
        }, 260);
      } else {
        locked = true;
        const bad = up.slice();
        setTimeout(() => {
          bad.forEach((k) => els[k].classList.remove("is-up"));
          els[a].classList.add("is-bad");
          els[b].classList.add("is-bad");
          setTimeout(() => {
            els[a].classList.remove("is-bad");
            els[b].classList.remove("is-bad");
          }, 260);
          up = [];
          locked = false;
        }, 620);
      }
    }
  }

  function win() {
    done = true;
    clearInterval(timer);
    // score: fewer flips and less time is better
    const raw = Math.max(0, 1000 - flips * 25 - time * 4);
    const record = api.saveBest(raw);
    const card = document.createElement("div");
    card.className = "quiz__fb is-right";
    card.style.gridColumn = "1 / -1";
    card.innerHTML = `<b>${T.best()}: ${raw}</b> · ${T.flips().toLowerCase()}: ${flips} · ${T.time().toLowerCase()}: ${time}с ${
      record ? " · " + T.newRecord() : ""
    }`;
    grid.appendChild(card);
  }

  const onClick = (e) => {
    const btn = e.target.closest(".mem-card");
    if (!btn) return;
    flip(Number(btn.dataset.i));
  };
  grid.addEventListener("click", onClick);

  return {
    focus() {},
    destroy() {
      clearInterval(timer);
      grid.removeEventListener("click", onClick);
    },
  };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
