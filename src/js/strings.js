/* все тексты интерфейса. Контент-часть (описания проектов, игры) — в content.json */

export const STR = {
  doc_title: {
    ru: "lionsuperpromax — Богдан / портфолио",
    en: "lionsuperpromax — Bogdan / portfolio",
  },

  nav_about: { ru: "О себе", en: "About" },
  nav_projects: { ru: "Проекты", en: "Projects" },
  nav_terminal: { ru: "Терминал", en: "Terminal" },
  nav_games: { ru: "Игры", en: "Games" },
  nav_contact: { ru: "Связь", en: "Contact" },
  nav_aria: { ru: "Разделы", en: "Sections" },

  chrome_lang: { ru: "EN", en: "RU" },
  chrome_lang_aria: { ru: "Switch language to English", en: "Переключить язык на русский" },
  chrome_gh_aria: { ru: "Открыть GitHub", en: "Open GitHub" },
  chrome_src_aria: { ru: "Открыть исходники сайта", en: "Open site sources" },

  version: { ru: "v1.0 · ручная сборка", en: "v1.0 · hand-made" },

  launcher_label: { ru: "рабочий стол", en: "desktop" },

  // status bar
  sb_status: { ru: "status", en: "status" },
  sb_ready: { ru: "готов к работе", en: "ready" },
  sb_loading: { ru: "синхронизация с GitHub", en: "syncing with GitHub" },
  sb_offline: { ru: "офлайн-кэш", en: "offline cache" },
  sb_repos: { ru: "репозиториев", en: "repos" },
  sb_hint: { ru: "клавиши 1–5 — раздел", en: "keys 1–5 — section" },

  // about
  about_kicker: { ru: "личное дело", en: "personal file" },
  about_title_1: { ru: "Привет, я Богдан.", en: "Hi, I'm Bogdan." },
  about_title_2: { ru: "Пишу код, который держит удар.", en: "I write code that takes a hit." },
  about_facts: { ru: "в двух словах", en: "in short" },
  about_stack: { ru: "инструменты", en: "tools" },
  about_activity: { ru: "активность по репозиториям", en: "repository activity" },
  about_activity_legend: { ru: "свежие пуши → старые", en: "recent pushes → older" },
  about_links: { ru: "ссылки", en: "links" },
  about_link_gh: { ru: "GitHub — все репозитории", en: "GitHub — all repositories" },
  about_link_projects: { ru: "Проекты на этом сайте", en: "Projects on this site" },
  about_link_term: { ru: "Терминал — можно пожить", en: "Terminal — feel at home" },
  about_link_games: { ru: "Поиграть, пока грузится", en: "Play while it loads" },
  about_source_cached: { ru: "данные из кэша", en: "cached data" },

  // projects
  pr_kicker: { ru: "репозитории", en: "repositories" },
  pr_title: { ru: "Проекты", en: "Projects" },
  pr_lead: {
    ru: "Живой список с GitHub API. Свежие сверху.",
    en: "A live list from the GitHub API. Newest first.",
  },
  pr_source_live: { ru: "с GitHub · сейчас", en: "from GitHub · live" },
  pr_source_cache: { ru: "кэш content.json", en: "content.json cache" },
  pr_source_error: { ru: "GitHub недоступен · кэш", en: "GitHub unreachable · cache" },
  pr_filter_all: { ru: "все", en: "all" },
  pr_updated: { ru: "обновлено", en: "updated" },
  pr_created: { ru: "создан", en: "created" },
  pr_refresh: { ru: "обновить", en: "refresh" },
  pr_open: { ru: "открыть на GitHub", en: "open on GitHub" },
  pr_count: { ru: "шт.", en: "items" },
  pr_repo_link: { ru: "github.com/lionsuperpromax", en: "github.com/lionsuperpromax" },
  pr_foot: {
    ru: "Сайт подтягивает данные прямо из GitHub — новые репозитории появляются без правки файлов.",
    en: "The site pulls data straight from GitHub — new repositories show up without editing any files.",
  },
  pr_rate: {
    ru: "Лимит анонимных запросов исчерпан — показываю сохранённую копию.",
    en: "Anonymous request quota is exhausted — showing the saved copy.",
  },

  // terminal
  term_kicker: { ru: "оболочка", en: "shell" },
  term_title: { ru: "Терминал", en: "Terminal" },
  term_lead: {
    ru: "Настоящая оболочка страницы. Введите help и Enter.",
    en: "A real shell for this page. Type help and hit Enter.",
  },
  term_titlebar: { ru: "bogdan@portfolio: ~", en: "bogdan@portfolio: ~" },
  term_hint_label: { ru: "попробовать:", en: "try:" },
  term_aria: { ru: "Поле ввода команд терминала", en: "Terminal command input" },

  // games
  games_kicker: { ru: "песочница", en: "sandbox" },
  games_title: { ru: "Игры", en: "Games" },
  games_lead: {
    ru: "Пять маленьких игр — по одной на каждый проект. Каждое окно можно таскать, как на настоящем десктопе.",
    en: "Five small games — one per project. Every window drags around like on a real desktop.",
  },
  games_play: { ru: "запустить", en: "launch" },
  games_best: { ru: "рекорд", en: "best" },
  games_none: { ru: "—", en: "—" },

  // contact
  ct_kicker: { ru: "связь", en: "contact" },
  ct_title: { ru: "Только GitHub. Больше ничего.", en: "GitHub only. Nothing else." },
  ct_lead: {
    ru: "Я не принимаю заявки через формы, не отвечаю в мессенджерах и не даю номер. Всё, что нужно — открыть issue или написать в discussions в нужном репозитории.",
    en: "I don't take form submissions, don't answer in messengers and don't share a phone number. All you need is to open an issue or a discussion in the relevant repository.",
  },
  ct_copy: { ru: "скопировать профиль", en: "copy profile link" },
  ct_copied: { ru: "ссылка скопирована", en: "link copied" },
  ct_avail_title: { ru: "как связаться", en: "how to reach me" },
  ct_avail: {
    ru: [
      "issue в конкретном репозитории — если это про проект;",
      "discussions — если это про идею;",
      "пулл-реквесты приветствуются: stai под MIT.",
    ],
    en: [
      "an issue in a specific repository — if it's about a project;",
      "discussions — if it's about an idea;",
      "pull requests are welcome: stai is MIT.",
    ],
  },
  ct_why: {
    ru: "Сайт сделан без бэкенда: здесь нет уведомлений и нет отправки писем. Так честнее — и быстрее.",
    en: "The site has no backend: no notifications, no message delivery. That's more honest — and faster.",
  },
  ct_footer: {
    ru: "собрано вручную · Vite · ни одной UI-библиотеки",
    en: "hand-built · Vite · zero UI libraries",
  },

  // game window common
  gw_close: { ru: "Закрыть", en: "Close" },
  gw_restart: { ru: "заново", en: "restart" },
  gw_pause: { ru: "пауза", en: "pause" },
  gw_resume: { ru: "продолжить", en: "resume" },
  gw_score: { ru: "счёт", en: "score" },
  gw_best: { ru: "рекорд", en: "best" },
  gw_new_record: { ru: "новый рекорд", en: "new record" },
  gw_start: { ru: "старт", en: "start" },
  gw_level: { ru: "уровень", en: "level" },
  gw_combo: { ru: "серия", en: "streak" },
  gw_lives: { ru: "жизни", en: "lives" },
  gw_again: { ru: "ещё раз", en: "again" },
  gw_next: { ru: "дальше", en: "next" },
  gw_finish: { ru: "результат", en: "result" },
  gw_flips: { ru: "ходов", en: "flips" },
  gw_time: { ru: "время", en: "time" },
  gw_ms: { ru: "мс", en: "ms" },
  gw_tap_start: { ru: "нажмите «старт»", en: "press start" },
  gw_keyboard: { ru: "клавиатура", en: "keyboard" },
  gw_pointer: { ru: "мышь / палец", en: "mouse / finger" },
};
