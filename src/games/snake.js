import { C, T, hud, stat, h } from "./common.js";

/* ProcessActivity — snake, but the food is other processes.
   The snake itself is a zombie process that keeps growing. */

const COLS = 20;
const ROWS = 15;
const CELL = 22;

const NAMES = [
  "chrome.exe", "code.exe", "python.exe", "discord.exe", "steam.exe",
  "svchost.exe", "explorer.exe", "llama.cpp", "flashos.sh", "git.exe",
  "spotify.exe", "node.exe", "ollama", "ssh.exe", "bash",
];

const SYS = [
  "system", "csrss.exe", "smss.exe", "lsass.exe", "wininit.exe", "services.exe",
];

export function createSnake(host, api) {
  const W = COLS * CELL;
  const H = ROWS * CELL;

  const ui = h(`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${hud(`${stat(T.score(), "sn-score")}${stat(T.best(), "sn-best")}<span class="spacer"></span>
        <button class="btn" id="sn-pause" type="button">${T.pause()}</button>
        <button class="btn" id="sn-restart" type="button">${T.restart()}</button>`)}
      <div class="stage-canvas">
        <canvas id="sn-canvas" width="${W}" height="${H}"></canvas>
        <div class="stage-msg" id="sn-msg">
          <strong>ProcessActivity</strong>
          <span>${T.kb()}</span>
          <button class="btn btn--accent" id="sn-start" type="button">${T.start()}</button>
        </div>
      </div>
    </div>`);
  host.appendChild(ui);

  const canvas = ui.querySelector("#sn-canvas");
  const ctx = canvas.getContext("2d");
  const msg = ui.querySelector("#sn-msg");
  const scoreEl = ui.querySelector("#sn-score");
  const bestEl = ui.querySelector("#sn-best");
  const pauseBtn = ui.querySelector("#sn-pause");

  bestEl.textContent = api.best();

  let snake, dir, nextDir, food, foodName, sys, timer, state, score, tickMs;

  function placeFood() {
    const free = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!snake.some((s) => s.x === x && s.y === y) && !sys.some((s) => s.x === x && s.y === y)) {
          free.push({ x, y });
        }
      }
    }
    food = free[Math.floor(Math.random() * free.length)] || { x: 0, y: 0 };
    foodName = NAMES[Math.floor(Math.random() * NAMES.length)];
  }

  function reset() {
    clearInterval(timer);
    timer = null;
    snake = [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    tickMs = 135;
    sys = [];
    for (let i = 0; i < 4; i++) {
      let p;
      do {
        p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      } while (snake.some((s) => s.x === p.x && s.y === p.y));
      p.name = SYS[Math.floor(Math.random() * SYS.length)];
      sys.push(p);
    }
    placeFood();
    scoreEl.textContent = "0";
    draw();
  }

  function start() {
    reset();
    state = "play";
    msg.hidden = true;
    pauseBtn.textContent = T.pause();
    loop();
  }

  function loop() {
    clearInterval(timer);
    timer = setInterval(step, tickMs);
  }

  function step() {
    if (state !== "play") return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
    const hitSelf = snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y);
    const hitSys = sys.some((s) => s.x === head.x && s.y === head.y);

    if (hitWall || hitSelf || hitSys) {
      gameOver(hitSys ? `${head.x},${head.y}` : null);
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      placeFood();
      if (score % 50 === 0 && tickMs > 70) {
        tickMs -= 8;
        loop();
      }
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    state = "over";
    clearInterval(timer);
    timer = null;
    const record = api.saveBest(score);
    bestEl.textContent = api.best();
    msg.innerHTML = `
      <strong>${T.again()}: ${score}</strong>
      <span>${record ? T.newRecord() : `${T.best()}: ${api.best()}`}</span>
      <button class="btn btn--accent" id="sn-again" type="button">${T.again()}</button>`;
    msg.hidden = false;
    msg.querySelector("#sn-again").addEventListener("click", start);
  }

  function draw() {
    ctx.fillStyle = C.paper2;
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = "rgba(28,27,24,0.07)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, H);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(W, y * CELL + 0.5);
      ctx.stroke();
    }

    ctx.font = "10px 'JetBrains Mono', monospace";

    // system processes: kill zone
    sys.forEach((s) => {
      ctx.fillStyle = C.paper3;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.strokeStyle = C.ink3;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3);
      ctx.setLineDash([]);
      ctx.fillStyle = C.ink3;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔒", s.x * CELL + CELL / 2, s.y * CELL + CELL / 2 - 1);
    });

    // food
    ctx.fillStyle = C.accent;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.fillStyle = "#fbf8f1";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PID", food.x * CELL + CELL / 2, food.y * CELL + CELL / 2 + 1);

    // snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? C.ink : C.ink2;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      if (i === 0) {
        ctx.fillStyle = C.paper;
        const ex = dir.x !== 0 ? dir.x * 2 : 0;
        const ey = dir.y !== 0 ? dir.y * 2 : 0;
        ctx.fillRect(s.x * CELL + CELL / 2 - 4 + ex, s.y * CELL + CELL / 2 - 3 + ey, 3, 3);
        ctx.fillRect(s.x * CELL + CELL / 2 + 2 + ex, s.y * CELL + CELL / 2 - 3 + ey, 3, 3);
      } else if (i % 3 === 0) {
        ctx.fillStyle = C.paper3;
        ctx.fillRect(s.x * CELL + 8, s.y * CELL + 8, 6, 6);
      }
    });
  }

  function togglePause() {
    if (state === "play") {
      state = "pause";
      clearInterval(timer);
      pauseBtn.textContent = T.resume();
      msg.hidden = false;
      msg.innerHTML = `<strong>${T.pause()}</strong><button class="btn" type="button" id="sn-res">${T.resume()}</button>`;
      msg.querySelector("#sn-res").addEventListener("click", togglePause);
    } else if (state === "pause") {
      state = "play";
      pauseBtn.textContent = T.pause();
      msg.hidden = true;
      loop();
    }
  }

  const onKey = (e) => {
    if (state !== "play" && state !== "pause") return;
    const map = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ц: [0, -1], Ц: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ы: [0, 1], Ы: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ф: [-1, 0], Ф: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0], в: [1, 0], В: [1, 0],
    };
    if (e.key === " " || e.key === "p" || e.key === "P") {
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.key === "Escape") return;
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    if (d[0] === -dir.x && d[1] === -dir.y) return; // no 180° turns
    nextDir = { x: d[0], y: d[1] };
  };

  // touch: swipe on the board
  let touch = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    touch = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!touch) return;
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
    const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
    if (d[0] === -dir.x && d[1] === -dir.y) return;
    nextDir = { x: d[0], y: d[1] };
  });

  window.addEventListener("keydown", onKey);
  ui.querySelector("#sn-start").addEventListener("click", start);
  ui.querySelector("#sn-restart").addEventListener("click", start);
  pauseBtn.addEventListener("click", togglePause);

  reset();
  state = "idle";

  return {
    focus() {
      canvas.focus?.();
    },
    destroy() {
      clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    },
  };
}
