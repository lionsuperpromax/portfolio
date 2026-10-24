import { $, esc, i18n, state } from "./util.js";

/* A tiny shell that really works: no backend, all answers are local. */
export function createTerminal(root, { navigate }) {
  const out = $("#term-out", root);
  const input = $("#term-input", root);
  const form = $("#term-form", root);
  const hist = [];
  let hIdx = 0;

  const t = (v) => i18n.t(v);
  const say = (html, cls = "") => {
    const div = document.createElement("div");
    div.className = `line ${cls}`;
    div.innerHTML = html;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
    return div;
  };
  const line = (text, cls = "") => say(esc(text), cls);
  const rows = () => (state.repos.length ? state.repos : state.content.repos);

  function banner() {
    say(`<span class="dim">lionsuperpromax@portfolio</span> · <span class="kw">${esc(t(i18n.strings.doc_title))}</span>`);
    line(t({ ru: "Введите 'help' — здесь всё, что умеет эта оболочка.", en: "Type 'help' — it lists everything this shell can do." }), "dim");
    say("");
  }

  function help() {
    const cmds = [
      ["help", { ru: "этот список", en: "this list" }],
      ["about", { ru: "о себе текстом", en: "about, in words" }],
      ["projects", { ru: "список проектов", en: "project list" }],
      ["stack", { ru: "языки и инструменты", en: "languages and tools" }],
      ["whoami", { ru: "кто за терминалом", en: "who is behind the terminal" }],
      ["lang [ru|en]", { ru: "сменить язык", en: "switch language" }],
      ["open <раздел>", { ru: "about | projects | games | contact", en: "about | projects | games | contact" }],
      ["games", { ru: "мини-игры", en: "mini-games" }],
      ["github", { ru: "открыть профиль на GitHub", en: "open the GitHub profile" }],
      ["clear", { ru: "очистить экран", en: "clear the screen" }],
      ["help2", { ru: "пасхалка для тех, кто дошёл", en: "an easter egg for those who got here" }],
    ];
    cmds.forEach(([cmd, desc]) => {
      say(`  <span class="kw">${esc(cmd.padEnd(16, " "))}</span><span class="dim">${esc(t(desc))}</span>`);
    });
    say(`<span class="dim">  ↑ ↓ история · Tab — автодополнение</span>`);
  }

  const commands = {
    help,
    "?": help,

    whoami() {
      const p = state.content.profile;
      line(`${p.name} (${t(p.role)}) · @${p.login}`);
      line(t({ ru: "C++, Python, shell. Windows и Linux.", en: "C++, Python, shell. Windows and Linux." }), "dim");
    },

    about() {
      t(state.content.profile.bio).forEach((p) => {
        line(p, "");
        say("");
      });
    },

    projects() {
      rows().forEach((r) => {
        say(`  <a class="link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>  <span class="dim">${esc(r.language || "—")}</span>`);
        const desc = t(r.description);
        if (desc) say(`    <span class="dim">${esc(desc)}</span>`);
      });
      say(`<span class="dim">${esc(t({ ru: "открыть раздел: open projects", en: "open the section: open projects" }))}</span>`);
    },

    stack() {
      line(state.content.profile.stack.join(" · "), "kw");
    },

    lang(args) {
      const arg = (args[0] || "").toLowerCase();
      if (arg === "ru" || arg === "en") {
        i18n.set(arg);
        // i18n.set repaints the page, which destroys this terminal: say it afterwards on the new one
        document.addEventListener("termready", () => line(`language = ${arg}`, "ok"), { once: true });
      } else {
        line(`usage: lang ru | lang en  (now: ${i18n.lang})`, "dim");
      }
    },

    open(args) {
      const target = (args[0] || "").toLowerCase();
      const map = { about: "about", projects: "projects", games: "games", contact: "contact", terminal: "terminal" };
      if (map[target]) {
        navigate(map[target]);
      } else {
        line(t({ ru: "куда? about | projects | games | contact", en: "where to? about | projects | games | contact" }), "dim");
      }
    },

    games() {
      navigate("games");
      line(t({ ru: "открываю игры. каждая — про один из проектов.", en: "opening games. each one is about a project." }), "dim");
    },

    github() {
      line(state.content.profile.links.github, "kw");
      window.open(state.content.profile.links.github, "_blank", "noopener");
    },

    clear() {
      out.innerHTML = "";
      banner();
    },

    help2() {
      say(
        `<pre>  _                _     _                _
 | |   ___   ___  | |   / \\   __ _  ___ _ __ | |_
 | |  / _ \\ / __| | |  / _ \\ / _\` |/ _ \\ '_ \\| __|
 | |_| (_) | (__  | | / ___ \\ (_| |  __/ | | | |_
 |_(_)\\___/ \\___| |_|/_/   \\_\\__, |\\___|_| |_|\\__|
                             |___/</pre>`,
      );
      line(t({ ru: "это баннер stai. да, тот самый, из README.", en: "that's the stai banner. yes, that one from the README." }), "dim");
    },
  };

  function run(raw) {
    const text = raw.trim();
    say(`<span class="p">bogdan@portfolio</span> <span class="dim">~</span> ${esc(text)}`);
    if (!text) return null;
    hist.push(text);
    hIdx = hist.length;

    const [cmd, ...args] = text.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) {
      const keep = fn(args);
      if (keep === false) return false;
    } else {
      line(t({ ru: `command not found: ${cmd}. попробуйте help`, en: `command not found: ${cmd}. try help` }), "dim");
    }
    out.scrollTop = out.scrollHeight;
    say("");
    return null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      hIdx = Math.max(0, hIdx - 1);
      input.value = hist[hIdx] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdx = Math.min(hist.length, hIdx + 1);
      input.value = hist[hIdx] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const cur = input.value.toLowerCase();
      const match = Object.keys(commands).find((c) => c.startsWith(cur) && c !== "?");
      if (match) input.value = match;
    } else if (e.key === "Escape") {
      input.value = "";
    }
  });

  out.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a")) return;
    if (window.getSelection()?.toString()) return;
    setTimeout(() => input.focus({ preventScroll: true }), 0);
  });

  root.querySelectorAll("[data-cmd]").forEach((b) => {
    b.addEventListener("click", () => {
      run(b.dataset.cmd);
      input.focus({ preventScroll: true });
    });
  });

  banner();
  document.dispatchEvent(new Event("termready"));

  return {
    focus() {
      if (!window.matchMedia("(pointer: coarse)").matches) {
        setTimeout(() => {
          if (document.contains(input)) input.focus({ preventScroll: true });
        }, 340);
      }
    },
    run,
  };
}
