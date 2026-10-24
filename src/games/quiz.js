import { T, hud, stat, h } from "./common.js";

/* stai: экзамен — five questions about the project, the terminal and tool calls. */

const QUESTIONS = [
  {
    q: {
      ru: "Сколько инструментов у агента stai 0.1?",
      en: "How many tools does the stai 0.1 agent have?",
    },
    a: ["10", "3", "40", "ни одного"],
    right: 0,
    why: {
      ru: "read_file, write_file, edit_file, apply_patch, list_dir, glob, grep, run_shell, web_fetch, todo_write.",
      en: "read_file, write_file, edit_file, apply_patch, list_dir, glob, grep, run_shell, web_fetch, todo_write.",
    },
  },
  {
    q: {
      ru: "Как stai откатывает свои правки?",
      en: "How does stai undo its own edits?",
    },
    a: ["git reset --hard", { ru: "командой /undo по журналу", en: "with /undo from a journal" }, "никак", "перезапуском"],
    right: 1,
    why: {
      ru: "Каждая правка попадает в undo/journal.jsonl вместе с копией исходника.",
      en: "Every edit lands in undo/journal.jsonl together with a copy of the original file.",
    },
  },
  {
    q: {
      ru: "Почему local_agent.py запускается без pip install?",
      en: "Why does local_agent.py run without pip install?",
    },
    a: ["Всё в C", "Так решил автор", { ru: "Только стандартная библиотека", en: "Standard library only" }, "Это venv"],
    right: 2,
    why: {
      ru: "Один файл на стандартной библиотеке Python 3.8+. Обязательных зависимостей нет.",
      en: "One file on the Python 3.8+ standard library. No required dependencies.",
    },
  },
  {
    q: {
      ru: "Что делает ответ «a» на запрос подтверждения?",
      en: "What does answering 'a' to a confirmation prompt do?",
    },
    a: [
      { ru: "отменяет всё", en: "cancels everything" },
      { ru: "разрешает и больше не спрашивает", en: "allows and stops asking" },
      { ru: "удаляет файл", en: "deletes the file" },
      "abort",
    ],
    right: 1,
    why: { ru: "y — разрешить, a — разрешить и больше не спрашивать, n — нет.", en: "y — allow, a — allow and don't ask again, n — no." },
  },
  {
    q: {
      ru: "Что чаще всего ломают мелкие модели меньше 12B?",
      en: "What do small models (<12B) usually break?",
    },
    a: ["UTF-8", "HTTP", { ru: "формат <tool_call>", en: "the <tool_call> format" }, "SHA-256"],
    right: 2,
    why: {
      ru: "В README это честно указано в известных ограничениях: парсер умеет восстанавливаться, но не всегда.",
      en: "The README admits it under known limitations: the parser recovers, but not always.",
    },
  },
];

export function createQuiz(host, api) {
  let i = 0;
  let score = 0;

  const ui = h(`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${hud(`${stat(T.score(), "qz-score")}<span class="stat"><span id="qz-step">1/${QUESTIONS.length}</span></span><span class="spacer"></span>
        <button class="btn" id="qz-restart" type="button">${T.restart()}</button>`)}
      <div class="quiz" id="qz"></div>
    </div>`);
  host.appendChild(ui);

  const box = ui.querySelector("#qz");
  const scoreEl = ui.querySelector("#qz-score");
  const stepEl = ui.querySelector("#qz-step");

  function render() {
    if (i >= QUESTIONS.length) return renderResult();
    const q = QUESTIONS[i];
    const label = host.dataset.lang;
    void label;
    stepEl.textContent = `${i + 1}/${QUESTIONS.length}`;
    const t = questionsText(q);

    box.innerHTML = `
      <p class="quiz__q">${t.q}</p>
      <div class="quiz__opts">
        ${t.a
          .map(
            (opt, k) => `<button class="quiz__opt" type="button" data-k="${k}">
              <span class="k">${"ABCD"[k]}</span><span>${opt}</span></button>`,
          )
          .join("")}
      </div>
      <div class="quiz__fb" hidden></div>`;

    box.querySelectorAll(".quiz__opt").forEach((btn) => {
      btn.addEventListener("click", () => answer(Number(btn.dataset.k)));
    });
  }

  function answer(k) {
    const q = QUESTIONS[i];
    const opts = [...box.querySelectorAll(".quiz__opt")];
    opts.forEach((b, idx) => {
      b.disabled = true;
      if (idx === q.right) b.classList.add("is-right");
      if (idx === k && k !== q.right) b.classList.add("is-wrong");
    });
    const ok = k === q.right;
    if (ok) {
      score += 20;
      scoreEl.textContent = String(score);
    }
    const fb = box.querySelector(".quiz__fb");
    fb.hidden = false;
    fb.classList.add(ok ? "is-right" : "is-wrong");
    fb.innerHTML = `${ok ? "✓" : "✕"} ${qText(questionsText(q).why)}`;

    i += 1;
    setTimeout(() => {
      render();
    }, ok ? 900 : 1900);
  }

  function renderResult() {
    const record = api.saveBest(score);
    stepEl.textContent = `${QUESTIONS.length}/${QUESTIONS.length}`;
    const verdict = scoreVerdict(score);
    box.innerHTML = `
      <p class="quiz__q"><strong>${T.best()}: ${score} / ${QUESTIONS.length * 20}</strong> — ${verdict}</p>
      ${record ? `<p class="quiz__fb is-right">${T.newRecord()}</p>` : ""}
      <button class="btn btn--accent" type="button" id="qz-again">${T.again()}</button>`;
    box.querySelector("#qz-again").addEventListener("click", restart);
  }

  function restart() {
    i = 0;
    score = 0;
    scoreEl.textContent = "0";
    render();
  }

  ui.querySelector("#qz-restart").addEventListener("click", restart);

  render();

  return { focus() {}, destroy() {} };
}

/* localized question objects are rebuilt on each render; language is read live */
function questionsText(q) {
  return { q: qText(q.q), a: q.a.map((x) => qText(x)), why: q.why };
}

function qText(v) {
  return typeof v === "string" ? v : v[document.documentElement.lang === "en" ? "en" : "ru"];
}

function scoreVerdict(score) {
  const en = document.documentElement.lang === "en";
  if (score === 100) return en ? "you can replace the 7B model" : "можно замещать 7B-модель";
  if (score >= 60) return en ? "the model would trust you with /undo" : "модель доверит тебе /undo";
  if (score >= 20) return en ? "it's a 0.1 release, honestly" : "релиз 0.1, честно";
  return en ? "the agent would ask for a confirmation" : "агент запросит подтверждение";
}
