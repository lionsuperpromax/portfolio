import { T, hud, stat, h } from "./common.js";

/* GrandShield: вирус — reaction game.
   One virus spreads across the process grid; you have less time after each hit. */

const ROWS = 4;
const COLS = 4;
const TOTAL = ROWS * COLS;

const SYS_PROCS = [
  "svchost.exe", "csrss.exe", "smss.exe", "lsass.exe", "wininit.exe",
  "explorer.exe", "services.exe", "system", "ntoskrnl.exe", "dwm.exe",
];

const VIRUS_NAMES = ["crypt0r", "rat.sys", "miner", "rootkit", "worm", "trojan", "keylog"];

export function createReaction(host, api) {
  const ui = h(`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${hud(`${stat(T.score(), "rx-score")}${stat(T.lives(), "rx-lives")}${stat("ms", "rx-last")}<span class="spacer"></span>
        <button class="btn" id="rx-start" type="button">${T.start()}</button>
        <button class="btn" id="rx-restart" type="button">${T.restart()}</button>`)}
      <div class="react-grid" id="rx-grid"></div>
    </div>`);
  host.appendChild(ui);

  const grid = ui.querySelector("#rx-grid");
  const scoreEl = ui.querySelector("#rx-score");
  const livesEl = ui.querySelector("#rx-lives");
  const lastEl = ui.querySelector("#rx-last");

  let score = 0;
  let lives = 3;
  let virusAt = -1;
  let shownAt = 0;
  let round = 0;
  let timer = 0;
  let running = false;
  let latency = [];

  for (let i = 0; i < TOTAL; i++) {
    const cell = document.createElement("button");
    cell.className = "react-cell";
    cell.type = "button";
    cell.dataset.i = String(i);
    cell.innerHTML = `<span class="pname">${SYS_PROCS[i % SYS_PROCS.length]}</span>`;
    grid.appendChild(cell);
  }
  const cells = [...grid.children];

  function reset() {
    clearTimeout(timer);
    running = false;
    score = 0;
    lives = 3;
    round = 0;
    latency = [];
    virusAt = -1;
    scoreEl.textContent = "0";
    livesEl.textContent = "3";
    lastEl.textContent = "—";
    cells.forEach((c) => {
      c.classList.remove("is-virus", "is-sys");
      c.innerHTML = `<span class="pname">${SYS_PROCS[Math.floor(Math.random() * SYS_PROCS.length)]}</span>`;
    });
  }

  function start() {
    reset();
    running = true;
    next();
  }

  function next() {
    round += 1;
    if (round > 1) {
      // reset the cell that had the virus
      const old = cells[virusAt];
      if (old) {
        old.classList.remove("is-virus");
        old.innerHTML = `<span class="pname">${SYS_PROCS[Math.floor(Math.random() * SYS_PROCS.length)]}</span>`;
      }
    }
    virusAt = Math.floor(Math.random() * TOTAL);
    const cell = cells[virusAt];
    const name = VIRUS_NAMES[Math.floor(Math.random() * VIRUS_NAMES.length)];
    cell.classList.add("is-virus");
    cell.innerHTML = `<span>${name}</span><span class="tag">virus</span>`;
    shownAt = performance.now();

    const windowMs = Math.max(420, 1250 - round * 45);
    timer = setTimeout(() => {
      if (!running) return;
      miss();
    }, windowMs);
  }

  function miss() {
    lives -= 1;
    livesEl.textContent = String(lives);
    if (lives <= 0) return end();
    next();
  }

  function end() {
    running = false;
    clearTimeout(timer);
    const record = api.saveBest(score);
    const avg = latency.length ? Math.round(latency.reduce((a, b) => a + b, 0) / latency.length) : 0;
    const msg = document.createElement("div");
    msg.className = "stage-msg";
    msg.style.position = "static";
    msg.innerHTML = `<strong>${T.again()}: ${score}</strong>
      <span>${avg ? `${T.time()}: ~${avg} ${T.ms()}` : ""} ${record ? " · " + T.newRecord() : ""}</span>
      <button class="btn btn--accent" type="button" id="rx-again">${T.again()}</button>`;
    grid.after(msg);
    msg.querySelector("#rx-again").addEventListener("click", () => {
      msg.remove();
      start();
    });
  }

  const onClick = (e) => {
    const cell = e.target.closest(".react-cell");
    if (!cell || !running) return;
    const i = Number(cell.dataset.i);
    if (i === virusAt) {
      const dt = Math.round(performance.now() - shownAt);
      latency.push(dt);
      lastEl.textContent = String(dt);
      score += Math.max(10, 100 - Math.floor(dt / 12));
      scoreEl.textContent = String(score);
      clearTimeout(timer);
      next();
    } else {
      // clicked a system process — false positive
      score = Math.max(0, score - 15);
      scoreEl.textContent = String(score);
      cell.animate(
        [{ background: "var(--ink)" }, { background: "" }],
        { duration: 260, easing: "ease-out" },
      );
    }
  };
  grid.addEventListener("click", onClick);

  ui.querySelector("#rx-start").addEventListener("click", start);
  ui.querySelector("#rx-restart").addEventListener("click", start);

  reset();

  return {
    focus() {},
    destroy() {
      running = false;
      clearTimeout(timer);
      grid.removeEventListener("click", onClick);
    },
  };
}
