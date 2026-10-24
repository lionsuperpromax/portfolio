import { C, T, hud, stat, h } from "./common.js";

/* FlashOS: форматирование — breakout over the sectors of a USB stick. */

const W = 440;
const H = 300;
const ROWS = 5;
const COLS = 9;
const PAD_W = 74;
const PAD_H = 8;
const BALL_R = 4;

export function createBreakout(host, api) {
  const ui = h(`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${hud(`${stat(T.score(), "bo-score")}${stat(T.lives(), "bo-lives")}${stat(T.level(), "bo-level")}<span class="spacer"></span>
        <button class="btn" id="bo-pause" type="button">${T.pause()}</button>
        <button class="btn" id="bo-restart" type="button">${T.restart()}</button>`)}
      <div class="stage-canvas">
        <canvas id="bo-canvas" width="${W}" height="${H}" style="cursor:none"></canvas>
        <div class="stage-msg" id="bo-msg">
          <strong>FlashOS 0.3.0</strong>
          <span>${T.tapStart()} · ${T.kb()} / смещение мыши</span>
          <button class="btn btn--accent" id="bo-start" type="button">${T.start()}</button>
        </div>
      </div>
    </div>`);
  host.appendChild(ui);

  const canvas = ui.querySelector("#bo-canvas");
  const ctx = canvas.getContext("2d");
  const msg = ui.querySelector("#bo-msg");
  const scoreEl = ui.querySelector("#bo-score");
  const livesEl = ui.querySelector("#bo-lives");
  const levelEl = ui.querySelector("#bo-level");
  const pauseBtn = ui.querySelector("#bo-pause");

  let padX = W / 2;
  let ball = { x: W / 2, y: H - 40, dx: 2.6, dy: -3.2 };
  let bricks = [];
  let score = 0;
  let lives = 3;
  let level = 1;
  let state = "idle";
  let raf = 0;
  let keys = { left: false, right: false };

  const SECTOR_LABELS = ["0x00", "0x1F", "0x40", "0x7E", "0xC0", "A:", "boot", "mbr", "fs"];

  function build() {
    bricks = [];
    const bw = (W - 16) / COLS;
    const bh = 16;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: 8 + c * bw,
          y: 34 + r * (bh + 4),
          w: bw - 3,
          h: bh,
          alive: Math.random() > 0.08,
          label: SECTOR_LABELS[(r * COLS + c) % SECTOR_LABELS.length],
          tough: level > 1 && r === 0,
        });
      }
    }
  }

  function resetBall() {
    ball = { x: padX, y: H - 24, dx: 2.6 * (Math.random() > 0.5 ? 1 : -1) * (1 + level * 0.12), dy: -(3.2 + level * 0.25) };
  }

  function reset(full = true) {
    if (full) {
      score = 0;
      lives = 3;
      level = 1;
      build();
    }
    padX = W / 2;
    resetBall();
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    levelEl.textContent = String(level);
  }

  function start() {
    reset();
    msg.hidden = true;
    state = "play";
    pauseBtn.textContent = T.pause();
    cancelAnimationFrame(raf);
    loop();
  }

  function loop() {
    if (state !== "play") return;
    step();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function step() {
    if (keys.left) padX -= 7;
    if (keys.right) padX += 7;
    padX = Math.max(PAD_W / 2, Math.min(W - PAD_W / 2, padX));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x < BALL_R) {
      ball.x = BALL_R;
      ball.dx *= -1;
    }
    if (ball.x > W - BALL_R) {
      ball.x = W - BALL_R;
      ball.dx *= -1;
    }
    if (ball.y < BALL_R + 24) {
      ball.y = BALL_R + 24;
      ball.dy *= -1;
    }

    // pad
    const px = padX - PAD_W / 2;
    if (
      ball.dy > 0 &&
      ball.y + BALL_R >= H - 18 - PAD_H &&
      ball.y - BALL_R <= H - 18 &&
      ball.x >= px - BALL_R &&
      ball.x <= px + PAD_W + BALL_R
    ) {
      ball.y = H - 18 - PAD_H - BALL_R;
      ball.dy = -Math.abs(ball.dy);
      const hit = (ball.x - padX) / (PAD_W / 2);
      ball.dx = hit * 4.2;
    }

    // bricks
    for (const b of bricks) {
      if (!b.alive) continue;
      if (
        ball.x + BALL_R > b.x &&
        ball.x - BALL_R < b.x + b.w &&
        ball.y + BALL_R > b.y &&
        ball.y - BALL_R < b.y + b.h
      ) {
        const overlapX = Math.min(ball.x + BALL_R - b.x, b.x + b.w - (ball.x - BALL_R));
        const overlapY = Math.min(ball.y + BALL_R - b.y, b.y + b.h - (ball.y - BALL_R));
        if (overlapX < overlapY) ball.dx *= -1;
        else ball.dy *= -1;
        if (b.tough) {
          b.tough = false;
        } else {
          b.alive = false;
          score += 5;
          scoreEl.textContent = String(score);
        }
        break;
      }
    }

    if (bricks.every((b) => !b.alive)) {
      level += 1;
      levelEl.textContent = String(level);
      build();
      resetBall();
      state = "pause";
      msg.hidden = false;
      msg.innerHTML = `<strong>${T.next()} · ${T.level()} ${level}</strong>
        <button class="btn btn--accent" type="button" id="bo-cont">${T.next()}</button>`;
      msg.querySelector("#bo-cont").addEventListener("click", () => {
        msg.hidden = true;
        state = "play";
        loop();
      });
      return;
    }

    // lost ball
    if (ball.y > H + 10) {
      lives -= 1;
      livesEl.textContent = String(lives);
      if (lives <= 0) {
        state = "over";
        const record = api.saveBest(score);
        msg.hidden = false;
        msg.innerHTML = `<strong>${T.again()}: ${score}</strong>
          <span>${record ? T.newRecord() : `${T.best()}: ${api.best()}`}</span>
          <button class="btn btn--accent" type="button" id="bo-again">${T.again()}</button>`;
        msg.querySelector("#bo-again").addEventListener("click", start);
        return;
      }
      resetBall();
    }
  }

  function draw() {
    ctx.fillStyle = C.paper2;
    ctx.fillRect(0, 0, W, H);

    // top strip, like a console header
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, W, 24);
    ctx.fillStyle = C.paper;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`/dev/sdX  exfat  ${score}%`, 8, 12);

    bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.tough ? C.ink2 : C.ruleStrong;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      if (!b.tough) {
        ctx.fillStyle = C.paper2;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 0.5);
      }
    });

    ctx.fillStyle = C.accent;
    ctx.fillRect(padX - PAD_W / 2, H - 18 - PAD_H, PAD_W, PAD_H);
    ctx.fillStyle = C.paper;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("format", padX, H - 18 - PAD_H / 2 + 0.5);

    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }

  function togglePause() {
    if (state === "play") {
      state = "pause";
      cancelAnimationFrame(raf);
      pauseBtn.textContent = T.resume();
      msg.hidden = false;
      msg.innerHTML = `<strong>${T.pause()}</strong>
        <button class="btn" type="button" id="bo-res">${T.resume()}</button>`;
      msg.querySelector("#bo-res").addEventListener("click", togglePause);
    } else if (state === "pause") {
      state = "play";
      pauseBtn.textContent = T.pause();
      msg.hidden = true;
      loop();
    }
  }

  const onKey = (e) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", "ф", "в", "Ф", "В"].includes(e.key)) {
      e.preventDefault();
      keys.left = e.key === "ArrowLeft" || e.key.toLowerCase() === "a" || e.key.toLowerCase() === "ф";
      keys.right = e.key === "ArrowRight" || e.key.toLowerCase() === "d" || e.key.toLowerCase() === "в";
    }
    if ((e.key === "p" || e.key === "P" || e.key === " ") && (state === "play" || state === "pause")) {
      e.preventDefault();
      togglePause();
    }
  };
  const onUp = () => {
    keys.left = false;
    keys.right = false;
  };

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    padX = ((e.clientX - r.left) / r.width) * W;
    padX = Math.max(PAD_W / 2, Math.min(W - PAD_W / 2, padX));
    if (state === "idle") draw();
  });
  canvas.addEventListener("pointerdown", () => {
    if (state === "idle") start();
  });

  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onUp);
  ui.querySelector("#bo-start").addEventListener("click", start);
  ui.querySelector("#bo-restart").addEventListener("click", start);
  pauseBtn.addEventListener("click", togglePause);

  reset();
  draw();

  return {
    focus() {},
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    },
  };
}
