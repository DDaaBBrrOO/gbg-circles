/* ============================================================
   ЛАД — музыкальная логика и интерфейс
   ============================================================ */
(() => {
  "use strict";

  /* ------------------------------------------------ теория */
  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
  const ROOT_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  const SOLFEGE = ["до", "до♯", "ре", "ре♯", "ми", "фа", "фа♯", "соль", "соль♯", "ля", "ля♯", "си"];
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const TUNING = [40, 45, 50, 55, 59, 64]; // низкая E → высокая e

  const CHORDS = [
    { id: "maj", label: "Мажор", sym: "", notes: [[0, 0, "1"], [4, 2, "3"], [7, 4, "5"]], feel: "Светлое и устойчивое" },
    { id: "min", label: "Минор", sym: "m", notes: [[0, 0, "1"], [3, 2, "♭3"], [7, 4, "5"]], feel: "Тёмное и лиричное" },
    { id: "7", label: "Доминантсепт", sym: "7", notes: [[0, 0, "1"], [4, 2, "3"], [7, 4, "5"], [10, 6, "♭7"]], feel: "Напряжение и блюз" },
    { id: "maj7", label: "maj7", sym: "maj7", notes: [[0, 0, "1"], [4, 2, "3"], [7, 4, "5"], [11, 6, "7"]], feel: "Мечтательное, джаз" },
    { id: "m7", label: "m7", sym: "m7", notes: [[0, 0, "1"], [3, 2, "♭3"], [7, 4, "5"], [10, 6, "♭7"]], feel: "Мягкое, соул" },
    { id: "dim", label: "dim", sym: "dim", notes: [[0, 0, "1"], [3, 2, "♭3"], [6, 4, "♭5"]], feel: "Неустойчивое" },
    { id: "aug", label: "aug", sym: "aug", notes: [[0, 0, "1"], [4, 2, "3"], [8, 4, "♯5"]], feel: "Парящее" },
    { id: "sus4", label: "sus4", sym: "sus4", notes: [[0, 0, "1"], [5, 3, "4"], [7, 4, "5"]], feel: "Открытое" },
    { id: "sus2", label: "sus2", sym: "sus2", notes: [[0, 0, "1"], [2, 1, "2"], [7, 4, "5"]], feel: "Прозрачное" },
    { id: "6", label: "6", sym: "6", notes: [[0, 0, "1"], [4, 2, "3"], [7, 4, "5"], [9, 5, "6"]], feel: "Тёплое" },
    { id: "add9", label: "add9", sym: "add9", notes: [[0, 0, "1"], [4, 2, "3"], [7, 4, "5"], [14, 1, "9"]], feel: "Воздушное" },
    { id: "m7b5", label: "m7♭5", sym: "m7♭5", notes: [[0, 0, "1"], [3, 2, "♭3"], [6, 4, "♭5"], [10, 6, "♭7"]], feel: "Доминанта минора" }
  ];

  const SCALES = [
    { id: "major", label: "Мажор", sub: "ионийский", semi: [0, 2, 4, 5, 7, 9, 11], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "3", "4", "5", "6", "7"], seven: true },
    { id: "minor", label: "Минор", sub: "эолийский", semi: [0, 2, 3, 5, 7, 8, 10], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "♭3", "4", "5", "♭6", "♭7"], seven: true },
    { id: "dorian", label: "Дорийский", sub: "дорийский", semi: [0, 2, 3, 5, 7, 9, 10], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "♭3", "4", "5", "6", "♭7"], seven: true },
    { id: "phrygian", label: "Фригийский", sub: "фригийский", semi: [0, 1, 3, 5, 7, 8, 10], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7"], seven: true },
    { id: "lydian", label: "Лидийский", sub: "лидийский", semi: [0, 2, 4, 6, 7, 9, 11], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "3", "♯4", "5", "6", "7"], seven: true },
    { id: "mixolydian", label: "Миксолидийский", sub: "миксолидийский", semi: [0, 2, 4, 5, 7, 9, 10], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "3", "4", "5", "6", "♭7"], seven: true },
    { id: "locrian", label: "Локрийский", sub: "локрийский", semi: [0, 1, 3, 5, 6, 8, 10], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7"], seven: true },
    { id: "harmonic", label: "Гарм. минор", sub: "гармонический минор", semi: [0, 2, 3, 5, 7, 8, 11], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "♭3", "4", "5", "♭6", "7"], seven: true },
    { id: "melodic", label: "Мелод. минор", sub: "мелодический минор", semi: [0, 2, 3, 5, 7, 9, 11], steps: [0, 1, 2, 3, 4, 5, 6], deg: ["1", "2", "♭3", "4", "5", "6", "7"], seven: true },
    { id: "pentamaj", label: "Маж. пента", sub: "мажорная пентатоника", semi: [0, 2, 4, 7, 9], steps: [0, 1, 2, 4, 5], deg: ["1", "2", "3", "5", "6"], seven: false },
    { id: "pentamin", label: "Мин. пента", sub: "минорная пентатоника", semi: [0, 3, 5, 7, 10], steps: [0, 2, 3, 4, 6], deg: ["1", "♭3", "4", "5", "♭7"], seven: false },
    { id: "blues", label: "Блюз", sub: "блюзовая гамма", semi: [0, 3, 5, 6, 7, 10], steps: [0, 2, 3, 4, 4, 6], deg: ["1", "♭3", "4", "♭5", "5", "♭7"], seven: false }
  ];

  const INTERVALS = [
    { semi: 0, name: "Прима", short: "ч.1", step: 0, feel: "Та же самая нота" },
    { semi: 1, name: "Малая секунда", short: "м.2", step: 1, feel: "Самый острый шаг" },
    { semi: 2, name: "Большая секунда", short: "б.2", step: 1, feel: "Ровно один тон" },
    { semi: 3, name: "Малая терция", short: "м.3", step: 2, feel: "Тень и грусть" },
    { semi: 4, name: "Большая терция", short: "б.3", step: 2, feel: "Свет, мажор" },
    { semi: 5, name: "Чистая кварта", short: "ч.4", step: 3, feel: "Опорный шаг" },
    { semi: 6, name: "Тритон", short: "ум.5", step: 3, feel: "Напряжение и вопрос" },
    { semi: 7, name: "Чистая квинта", short: "ч.5", step: 4, feel: "Сила и пустота" },
    { semi: 8, name: "Малая секста", short: "м.6", step: 5, feel: "Лирика" },
    { semi: 9, name: "Большая секста", short: "б.6", step: 5, feel: "Полёт" },
    { semi: 10, name: "Малая септима", short: "м.7", step: 6, feel: "Блюзовое тепло" },
    { semi: 11, name: "Большая септима", short: "б.7", step: 6, feel: "Тонкое напряжение" },
    { semi: 12, name: "Октава", short: "ч.8", step: 7, feel: "Та же нота выше" }
  ];

  /* формы аккордов: [6-я … 1-я струна], null — не звучит.
     root — pc тоники в том виде, как записана форма; fixed — только для своего корня. */
  const SHAPE_LIB = {
    maj: [
      { frets: [null, 3, 2, 0, 1, 0], root: 0, fixed: true, tag: "C" },
      { frets: [3, 2, 0, 0, 0, 3], root: 7, fixed: true, tag: "G" },
      { frets: [null, null, 0, 2, 3, 2], root: 2, fixed: true, tag: "D" },
      { frets: [0, 2, 2, 1, 0, 0], root: 4, form: "E" },
      { frets: [null, 0, 2, 2, 2, 0], root: 9, form: "A" }
    ],
    min: [
      { frets: [null, null, 0, 2, 3, 1], root: 2, fixed: true, tag: "Dm" },
      { frets: [0, 2, 2, 0, 0, 0], root: 4, form: "Em" },
      { frets: [null, 0, 2, 2, 1, 0], root: 9, form: "Am" }
    ],
    "7": [
      { frets: [null, 3, 2, 3, 1, 0], root: 0, fixed: true, tag: "C7" },
      { frets: [3, 2, 0, 0, 0, 1], root: 7, fixed: true, tag: "G7" },
      { frets: [null, 2, 1, 2, 0, 2], root: 11, fixed: true, tag: "B7" },
      { frets: [0, 2, 0, 1, 0, 0], root: 4, form: "E7" },
      { frets: [null, 0, 2, 0, 2, 0], root: 9, form: "A7" }
    ],
    maj7: [
      { frets: [null, 3, 2, 0, 0, 0], root: 0, fixed: true, tag: "Cmaj7" },
      { frets: [null, null, 3, 2, 1, 0], root: 5, fixed: true, tag: "Fmaj7" },
      { frets: [0, 2, 1, 1, 0, 0], root: 4, form: "Emaj7" },
      { frets: [null, 0, 2, 1, 2, 0], root: 9, form: "Amaj7" }
    ],
    m7: [
      { frets: [null, null, 0, 2, 1, 1], root: 2, fixed: true, tag: "Dm7" },
      { frets: [0, 2, 0, 0, 0, 0], root: 4, form: "Em7" },
      { frets: [null, 0, 2, 0, 1, 0], root: 9, form: "Am7" }
    ],
    sus4: [
      { frets: [null, null, 0, 2, 3, 3], root: 2, fixed: true, tag: "Dsus4" },
      { frets: [0, 2, 2, 2, 0, 0], root: 4, form: "Esus4" },
      { frets: [null, 0, 2, 2, 3, 0], root: 9, form: "Asus4" }
    ],
    sus2: [
      { frets: [null, null, 0, 2, 3, 0], root: 2, fixed: true, tag: "Dsus2" },
      { frets: [null, 0, 2, 2, 0, 0], root: 9, form: "Asus2" }
    ]
  };

  /* ------------------------------------------------ утилиты */
  const $ = (sel, root = document) => root.querySelector(sel);
  const escapeAttr = (v) => String(v).replace(/"/g, "&quot;");

  function parseNote(name) {
    const letter = name[0];
    const acc = name.slice(1) === "♯" ? 1 : name.slice(1) === "♭" ? -1 : 0;
    return { letter, acc };
  }

  function spell(rootName, step, pc) {
    const { letter } = parseNote(rootName);
    const li = (LETTERS.indexOf(letter) + step) % 7;
    let diff = ((pc - LETTER_PC[li]) % 12 + 12) % 12;
    if (diff > 6) diff -= 12;
    const suffix = diff === 0 ? "" : diff === 1 ? "♯" : diff === -1 ? "♭" : diff === 2 ? "♯♯" : "♭♭";
    return LETTERS[li] + suffix;
  }

  const pcOf = (midi) => ((midi % 12) + 12) % 12;

  /* ------------------------------------------------ состояние */
  const params = new URLSearchParams(location.search);
  const state = {
    tab: "home",
    theme: "air",
    mode: "chord",
    root: 0,
    chord: 0,
    scale: 0,
    interval: 7,
    inv: 0,
    sound: true,
    arp: false,
    neckMode: "chord",
    naturalsOnly: true,
    neckLabels: "notes",
    neckShape: 0,
    moreShapes: false,
    returnMode: null,
    topic: null,
    confirmTrain: false,
    quiz: null
  };

  const screenParam = params.get("screen");
  if (["home", "circle", "neck", "train"].includes(screenParam)) state.tab = screenParam;
  if (screenParam === "chords") { state.tab = "circle"; state.mode = "chord"; }
  if (screenParam === "scales") { state.tab = "circle"; state.mode = "scale"; }
  if (screenParam === "intervals") { state.tab = "circle"; state.mode = "interval"; }
  const rootParam = params.get("root");
  if (rootParam !== null && +rootParam >= 0 && +rootParam <= 11) state.root = +rootParam;
  const labelsParam = params.get("labels");
  if (["notes", "degrees", "intervals", "shape"].includes(labelsParam)) state.neckLabels = labelsParam;
  const modeParam = params.get("mode");  if (["chord", "scale", "interval"].includes(modeParam)) {
    state.mode = modeParam;
    if (state.tab === "home") state.tab = "circle";
    if (state.tab === "neck") state.neckMode = modeParam === "interval" ? "notes" : modeParam;
  }

  /* ------------------------------------------------ навигация «назад» */
  // Системная «назад» всегда ведёт на главную: из теории, круга, грифа, тренажёра.
  // С главной — подсказка «нажмите ещё раз», второе нажатие закрывает приложение.
  function canGoBack() {
    return state.confirmTrain || state.tab !== "home" || !!state.topic || train.started || !!state.returnMode;
  }

  function syncBackDepth() {
    try {
      if (window.LadHost && window.LadHost.setBackDepth) window.LadHost.setBackDepth(canGoBack() ? 1 : 0);
    } catch (e) { /* нет оболочки */ }
  }

  function pushNav() { syncBackDepth(); }

  function goHome() {
    train.started = false;
    train.finished = false;
    state.confirmTrain = false;
    state.topic = null;
    state.returnMode = null;
    state.tab = "home";
    render(false);
    syncBackDepth();
  }

  /** Аккорд из «аккордов в тональности» → назад к той же гамме. */
  function returnToScale() {
    const r = state.returnMode;
    if (!r) return false;
    state.mode = "scale";
    state.scale = r.scale;
    state.root = r.root;
    state.returnMode = null;
    render(false);
    syncBackDepth();
    return true;
  }

  // отладочный снимок состояния по USB (adb + CDP)
  window.__lad = () => ({
    tab: state.tab,
    mode: state.mode,
    root: state.root,
    chord: state.chord,
    scale: state.scale,
    neckMode: state.neckMode,
    neckLabels: state.neckLabels,
    topic: state.topic,
    returnMode: state.returnMode ? state.returnMode.scale : null,
    confirmTrain: !!state.confirmTrain,
    trainStarted: train.started,
    scroll: screenEl ? Math.round(screenEl.scrollTop) : -1,
    swipeReady: typeof swipeZone === "function",
    hScrollableChips: $$(".chips.is-scrollable").length
  });

  window.ladBack = function () {
    if (state.confirmTrain) {
      state.confirmTrain = false;
      render(true);
      syncBackDepth();
      return true;
    }
    // серия идёт — сначала спрашиваем
    if (train.started && !train.finished) {
      state.confirmTrain = true;
      state.confirmFrom = "back";
      render(true);
      return true;
    }
    // пришли в аккорд из «аккордов в тональности» — возвращаемся к той же гамме
    if (returnToScale()) return true;
    if (state.tab !== "home" || state.topic) {
      goHome();
      return true;
    }
    return false;
  };

  /* ------------------------------------------------ вывод данных */
  function chordData() {
    const ch = CHORDS[state.chord];
    const rootName = ROOT_NAMES[state.root];
    const notes = ch.notes.map(([semi, step, deg]) => {
      const pc = (state.root + semi) % 12;
      return {
        pc,
        name: spell(rootName, step, pc),
        deg,
        midi: 60 + state.root + semi,
        semi
      };
    });
    const inv = Math.min(state.inv, notes.length - 1);
    const voiced = notes.map((n) => ({ ...n }));
    for (let k = 0; k < inv; k++) {
      const first = voiced.shift();
      voiced.push({ ...first, midi: first.midi + 12 });
    }
    const bass = voiced[0];
    const symbol = rootName + ch.sym + (inv > 0 ? "/" + bass.name : "");
    return { ...ch, rootName, notes, voiced, inv, bass, symbol };
  }

  function scaleData() {
    const s = SCALES[state.scale];
    const rootName = ROOT_NAMES[state.root];
    const notes = s.semi.map((semi, i) => {
      const pc = (state.root + semi) % 12;
      return { pc, name: spell(rootName, s.steps[i], pc), deg: s.deg[i], semi };
    });
    return { ...s, rootName, notes };
  }

  function intervalData() {
    const iv = INTERVALS[state.interval];
    const rootName = ROOT_NAMES[state.root];
    const pc = (state.root + iv.semi) % 12;
    const to = spell(rootName, iv.step, pc);
    return { ...iv, rootName, pc, to };
  }

  function activeContext() {
    if (state.mode === "chord") {
      const c = chordData();
      return { notes: c.notes, root: state.root, symbol: c.symbol, feel: c.feel };
    }
    if (state.mode === "scale") {
      const s = scaleData();
      return { notes: s.notes, root: state.root, symbol: s.rootName, feel: s.label };
    }
    const iv = intervalData();
    return {
      notes: [
        { pc: state.root, name: iv.rootName, deg: "1", midi: 60 + state.root },
        { pc: iv.pc, name: iv.to, deg: iv.short, midi: 60 + state.root + iv.semi }
      ],
      root: state.root,
      symbol: iv.short,
      feel: iv.name
    };
  }

  function harmonyRows() {
    const s = scaleData();
    if (!s.seven) return [];
    return s.semi.map((_, i) => {
      const thirdSemi = s.semi[(i + 2) % 7] + (i + 2 >= 7 ? 12 : 0);
      const fifthSemi = s.semi[(i + 4) % 7] + (i + 4 >= 7 ? 12 : 0);
      const ti = (thirdSemi - s.semi[i] + 12) % 12;
      const fi = (fifthSemi - s.semi[i] + 12) % 12;
      let quality = "maj", sym = "", rn = ROMAN[i];
      if (ti === 3 && fi === 7) { quality = "min"; sym = "m"; rn = rn.toLowerCase(); }
      else if (ti === 3 && fi === 6) { quality = "dim"; sym = "dim"; rn = rn.toLowerCase() + "°"; }
      else if (ti === 4 && fi === 8) { quality = "aug"; sym = "aug"; rn = rn + "+"; }
      else if (ti === 4 && fi === 7) { quality = "maj"; sym = ""; }
      return {
        pc: s.notes[i].pc,
        name: s.notes[i].name + sym,
        rn,
        quality,
        roman: rn
      };
    });
  }

  /* ------------------------------------------------ иконки */
  const SVG = (body, size = 21) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

  const ICON = {
    home: SVG('<path d="M3.5 10.7 12 3.7l8.5 7v8.5a1.8 1.8 0 0 1-1.8 1.8h-4.2v-6.2h-5V21H5.3a1.8 1.8 0 0 1-1.8-1.8Z"/>', 22),
    circle: SVG('<circle cx="12" cy="12" r="8.1"/><circle cx="12" cy="3.9" r="1.5" fill="currentColor" stroke="none"/><circle cx="20.1" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="20.1" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.9" cy="12" r="1.5" fill="currentColor" stroke="none"/>', 22),
    neck: SVG('<path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h15M8 4v16M12 4v16M16 4v16"/><circle cx="10" cy="9.2" r="1.35" fill="currentColor" stroke="none"/><circle cx="14" cy="14.8" r="1.35" fill="currentColor" stroke="none"/>', 22),
    train: SVG('<circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4"/>', 22),
    flame: SVG('<path d="M12 3.4c2.9 3.7 5.6 6 5.6 9.5a5.6 5.6 0 0 1-11.2 0c0-1.9 1-3.4 2.5-4.9.9-1 2.1-2.5 3.1-4.6Z"/>', 14),
    sound: SVG('<path d="M4 10v4h3l4 3.4V6.6L7 10H4Z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M17.9 6.6a8 8 0 0 1 0 10.8"/>', 18),
    mute: SVG('<path d="M4 10v4h3l4 3.4V6.6L7 10H4Z"/><path d="m16 10 5 4m0-4-5 4"/>', 18),
    play: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.3v13.4L19 12 8 5.3Z"/></svg>',
    arp: SVG('<path d="M4 18.5v-4M8.5 18.5V11M13 18.5V7.5M17.5 18.5V4.5"/>', 18),
    arrow: SVG('<path d="M5 12h14m-5-5 5 5-5 5"/>', 16),
    back: SVG('<path d="M19 12H5m5-5-5 5 5 5"/>', 16),
    sun: SVG('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/>', 18),
    moon: SVG('<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"/>', 18),
    check: SVG('<path d="m4.5 12.5 5 5 10-11"/>', 16),
    close: SVG('<path d="m6 6 12 12M18 6 6 18"/>', 15)
  };

  /* ------------------------------------------------ звук */
  let ac = null;
  let master = null;

  function ensureAudio() {
    if (!ac) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ac = new Ctx();
      master = ac.createGain();
      master.gain.value = 0.9;
      master.connect(ac.destination);
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  function pluck(midi, at, dur = 1.7, gain = 0.14) {
    if (!state.sound || !ac) return;
    const t = at == null ? ac.currentTime : at;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const voice = ac.createGain();
    voice.gain.setValueAtTime(0.0001, t);
    voice.gain.linearRampToValueAtTime(gain, t + 0.008);
    voice.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3800, t);
    lp.frequency.exponentialRampToValueAtTime(820, t + dur);

    const o1 = ac.createOscillator();
    o1.type = "triangle";
    o1.frequency.value = f;
    const o2 = ac.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 2.002;
    const o2g = ac.createGain();
    o2g.gain.value = 0.28;

    o1.connect(voice);
    o2.connect(o2g).connect(voice);
    voice.connect(lp).connect(master);

    o1.start(t); o2.start(t);
    o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  function strum(midis, step = 0.045, dur = 1.9) {
    if (!state.sound) return;
    if (!ensureAudio()) return;
    const t = ac.currentTime + 0.03;
    midis.forEach((m, i) => pluck(m, t + i * step, dur, 0.125));
  }

  function arpeggio(midis, step = 0.14, dur = 1.6) {
    if (!state.sound) return;
    if (!ensureAudio()) return;
    const t = ac.currentTime + 0.03;
    midis.forEach((m, i) => pluck(m, t + i * step, dur, 0.13));
  }

  function buzz() {
    if (!state.sound) return;
    if (!ensureAudio()) return;
    const t = ac.currentTime + 0.02;
    pluck(48, t, 0.5, 0.09);
    pluck(49, t + 0.02, 0.5, 0.08);
  }

  /* ------------------------------------------------ отрисовка: колесо */
  function wheelHTML() {
    const ctx = activeContext();
    const active = new Set(ctx.notes.map((n) => n.pc));
    const names = ROOT_NAMES.slice();
    ctx.notes.forEach((n) => { names[n.pc] = n.name; });

    const c = 170, R = 122;
    const rad = (i) => (-90 + i * 30) * Math.PI / 180;
    const px = (i, r = R) => c + r * Math.cos(rad(i));
    const py = (i, r = R) => c + r * Math.sin(rad(i));

    const out = [];
    out.push(`<circle class="rail-soft" cx="${c}" cy="${c}" r="156"/>`);

    // деления
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = (-90 + i * 6) * Math.PI / 180;
      const r1 = 160, r2 = 164;
      out.push(`<line class="tick" x1="${(c + r1 * Math.cos(a)).toFixed(1)}" y1="${(c + r1 * Math.sin(a)).toFixed(1)}" x2="${(c + r2 * Math.cos(a)).toFixed(1)}" y2="${(c + r2 * Math.sin(a)).toFixed(1)}"/>`);
    }

    // соединительная фигура
    if (state.mode === "chord" || state.mode === "scale") {
      const ordered = ctx.notes
        .map((n) => n.pc)
        .filter((pc, i, arr) => arr.indexOf(pc) === i)
        .sort((a, b) => ((a - ctx.root + 12) % 12) - ((b - ctx.root + 12) % 12));
      if (ordered.length >= 3) {
        const pts = ordered.map((pc) => `${px(pc).toFixed(1)},${py(pc).toFixed(1)}`).join(" ");
        out.push(`<polygon class="poly" points="${pts}"/>`);
      }
    }

    // дуга интервала
    if (state.mode === "interval") {
      const iv = INTERVALS[state.interval];
      if (iv.semi === 12) {
        out.push(`<circle class="arc" cx="${c}" cy="${c}" r="145" stroke-dasharray="3 6" opacity=".8"/>`);
        out.push(`<text class="arc-label" x="${c}" y="${c + 160}" text-anchor="middle">+12</text>`);
      } else if (iv.semi > 0) {
        const a0 = rad(ctx.root) + 0.09;
        const a1 = rad((ctx.root + iv.semi) % 12) - 0.09;
        const large = iv.semi * 30 > 180 ? 1 : 0;
        const x0 = c + 145 * Math.cos(a0), y0 = c + 145 * Math.sin(a0);
        const x1 = c + 145 * Math.cos(a1), y1 = c + 145 * Math.sin(a1);
        out.push(`<path class="arc" d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A 145 145 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"/>`);
        const mid = (ctx.root * 30 + (iv.semi * 30) / 2 - 90) * Math.PI / 180;
        const lx = c + 160 * Math.cos(mid), ly = c + 160 * Math.sin(mid);
        out.push(`<text class="arc-label" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="middle">+${iv.semi}</text>`);
      }
    }

    // подписи ступеней — на самих нотах, чтобы круг дышал
    const degByPc = {};
    ctx.notes.forEach((n) => { degByPc[n.pc] = n.deg; });

    out.push(`<rect class="disc-fade" x="0" y="0" width="340" height="340" fill="url(#discFade)"/>`);

    // ноты
    for (let i = 0; i < 12; i++) {
      const on = active.has(i);
      const isRoot = i === ctx.root;
      const r = on ? 19 : 16;
      const sol = SOLFEGE[i];
      const deg = degByPc[i];
      out.push(
        `<g class="wnode ${on ? "is-on" : ""} ${isRoot ? "is-root" : ""}" data-act="wheel-note" data-pc="${i}" role="button" aria-label="${escapeAttr(names[i])}, ${sol}">
          <title>${names[i]} · ${sol}</title>
          <circle class="halo" cx="${px(i).toFixed(1)}" cy="${py(i).toFixed(1)}" r="27"/>
          <circle class="base" cx="${px(i).toFixed(1)}" cy="${py(i).toFixed(1)}" r="${r}"/>
          <text class="lbl" x="${px(i).toFixed(1)}" y="${(py(i) - 1.5).toFixed(1)}" text-anchor="middle">${names[i]}</text>
          <text class="sol" x="${px(i).toFixed(1)}" y="${(py(i) + 8.5).toFixed(1)}" text-anchor="middle">${deg || sol}</text>
        </g>`
      );
    }

    return `<svg viewBox="0 0 340 340" class="wheel" aria-label="Хроматический круг"><defs>
      <radialGradient id="discFade" gradientUnits="userSpaceOnUse" cx="${c}" cy="${c}" r="76">
        <stop offset="0" stop-color="var(--bg)" stop-opacity="0.97"/>
        <stop offset="0.6" stop-color="var(--bg)" stop-opacity="0.9"/>
        <stop offset="1" stop-color="var(--bg)" stop-opacity="0"/>
      </radialGradient>
    </defs>${out.join("")}</svg>`;
  }

  function wheelCenterHTML() {
    if (state.mode === "interval") {
      const iv = intervalData();
      return `<div class="wheel-sym">${iv.short}</div>
        <div class="wheel-sub">${iv.semi} полутон${iv.semi === 1 ? "" : iv.semi >= 2 && iv.semi <= 4 ? "а" : "ов"}</div>
        <div class="wheel-name">${iv.name}</div>`;
    }
    if (state.mode === "scale") {
      const s = scaleData();
      return `<div class="wheel-sym">${s.rootName}</div>
        <div class="wheel-sub">${s.label}</div>
        <div class="wheel-name">${s.seven ? "7 ступеней" : s.notes.length + " нот"}</div>`;
    }
    const ch = chordData();
    return `<div class="wheel-sym">${ch.symbol}</div>
      <div class="wheel-sub">${ch.notes.map((n) => n.deg).join(" · ")}</div>
      <div class="wheel-name">${ch.feel}</div>`;
  }

  /* ------------------------------------------------ аппликатуры аккорда */
  const shapesCache = new Map();

  function chordShapes(ch) {
    const key = state.root + ":" + ch.id;
    if (shapesCache.has(key)) return shapesCache.get(key);
    const rootPc = state.root;
    const pcs = new Set(ch.notes.map((n) => n.pc));
    const third = ch.notes[1] ? ch.notes[1].pc : null;
    const last = ch.notes.length >= 4 ? ch.notes[ch.notes.length - 1].pc : null;
    const found = [];
    const seen = new Set();

    for (let base = 0; base <= 8 && found.length < 8; base++) {
      const top = base + 4;
      const options = [];
      for (let s = 0; s < 6; s++) {
        const openPc = TUNING[s] % 12;
        const frets = [];
        if (base === 0 && pcs.has(openPc)) frets.push(0);
        for (let f = Math.max(1, base); f <= top; f++) {
          if (pcs.has((openPc + f) % 12)) frets.push(f);
        }
        options.push(frets);
      }

      const cur = new Array(6).fill(null);
      let mutes = 0;

      const walk = (s) => {
        if (found.length >= 8) return;
        if (s === 6) {
          const sounding = cur.filter((f) => f !== null);
          if (sounding.length < 4) return;
          const lowIdx = cur.findIndex((f) => f !== null);
          if ((TUNING[lowIdx] + cur[lowIdx]) % 12 !== rootPc) return;
          const spread = Math.max(...sounding) - Math.min(...sounding);
          if (spread > 4) return;
          const has = (pc) => cur.some((f, i) => f !== null && (TUNING[i] + f) % 12 === pc);
          if (third !== null && !has(third)) return;
          if (last !== null && !has(last)) return;
          const fp = cur.join(",");
          if (seen.has(fp)) return;
          seen.add(fp);
          found.push(cur.slice());
          return;
        }
        for (const f of options[s]) {
          cur[s] = f;
          walk(s + 1);
          cur[s] = null;
          if (found.length >= 8) return;
        }
        if (mutes < 1) { mutes++; cur[s] = null; walk(s + 1); mutes--; }
      };
      walk(0);
    }

    const rank = (a) => a.filter((f) => f !== null).length;
    const spread = (a) => {
      const p = a.filter((f) => f !== null);
      return Math.max(...p) - Math.min(...p);
    };
    const low = (a) => Math.min(...a.filter((f) => f !== null));
    const open = (a) => (low(a) === 0 ? 0 : 1);
    const shapes = found
      .sort((a, b) => open(a) - open(b) || rank(b) - rank(a) || low(a) - low(b))
      .slice(0, 4);
    shapesCache.set(key, shapes);
    return shapes;
  }

  function shapeSVG(frets) {
    const W = 56, X0 = 9, DX = 8, Y0 = 12, DY = 9.4, FRETS = 5;
    const H = Y0 + FRETS * DY + 1;
    const played = frets.filter((f) => f !== null);
    const minFret = played.length ? Math.min(...played) : 0;
    const shift = Math.max(0, minFret - 1);
    const nut = shift === 0;
    const parts = [];

    for (let k = 0; k <= FRETS; k++) {
      parts.push(`<line class="sh-fret" x1="${X0 - 3}" y1="${Y0 + k * DY}" x2="${X0 + 5 * DX + 3}" y2="${Y0 + k * DY}"/>`);
    }
    for (let s = 0; s < 6; s++) {
      parts.push(`<line class="sh-str" x1="${X0 + s * DX}" y1="${Y0 + (nut ? 0 : 0.4)}" x2="${X0 + s * DX}" y2="${Y0 + FRETS * DY}" stroke-width="${[1.5, 1.3, 1.1, .95, .8, .7][s]}"/>`);
    }
    if (nut) {
      parts.push(`<line class="sh-nut" x1="${X0 - 3}" y1="${Y0}" x2="${X0 + 5 * DX + 3}" y2="${Y0}"/>`);
    } else {
      parts.push(`<text class="sh-base" x="${X0 - 4.5}" y="${Y0 + DY - 2.6}">${shift + 1}</text>`);
    }

    const barre = (() => {
      if (shift === 0) return null;
      const idx = frets.map((f, s) => (f === minFret ? s : -1)).filter((s) => s >= 0);
      return idx.length >= 2 ? { from: idx[0], to: idx[idx.length - 1] } : null;
    })();

    frets.forEach((f, s) => {
      const x = X0 + s * DX;
      if (f === null) {
        parts.push(`<path class="sh-mute" d="M${x - 2.4} ${Y0 - 8.6}l4.8 4.8M${x + 2.4} ${Y0 - 8.6}l-4.8 4.8"/>`);
        return;
      }
      if (f === 0) {
        parts.push(`<circle class="sh-open" cx="${x}" cy="${Y0 - 6.2}" r="2.2"/>`);
        return;
      }
      if (barre && f === minFret && s >= barre.from && s <= barre.to) return;
      const row = f - shift;
      parts.push(`<circle class="sh-dot" cx="${x}" cy="${Y0 + (row - 0.5) * DY}" r="2.9"/>`);
    });

    if (barre) {
      const x1 = X0 + barre.from * DX;
      const x2 = X0 + barre.to * DX;
      const y = Y0 + (minFret - shift - 0.5) * DY;
      parts.push(`<rect class="sh-dot" x="${(x1 - 2.9).toFixed(2)}" y="${(y - 2.9).toFixed(2)}" width="${(x2 - x1 + 5.8).toFixed(2)}" height="5.8" rx="2.9"/>`);
    }

    return `<svg viewBox="0 0 ${W} ${H}" class="shape-svg" aria-hidden="true">${parts.join("")}</svg>`;
  }

  /* ------------------------------------------------ отрисовка: гриф */
  function fretboardHTML(opts = {}) {
    const {
      notes = null,          // массив 12: {name, deg, cls, iv} | null
      interactive = false,
      onlyPc = null,
      onlyString = null,
      chosen = null,
      showNames = true,
      labels = "notes",      // notes | degrees | intervals — что подписано в точках
      spots = null,          // точечный режим: [{s, f, text}] — только эти позиции
      muted = null           // глухие струны в точечном режиме: [s, …]
    } = opts;

    // вертикальный гриф: струны слева направо, лады сверху вниз — вся октава видна без прокрутки
    const W = 340, H = 452;
    const X0 = 50, SX = 48;            // 6 струн: 50 … 290
    const Y0 = 52, FY = 31;            // порожек и высота лада
    const BOT = Y0 + 12 * FY;
    const R = 13.5, FS = 10.4;
    const out = [];

    // подсветка струны, о которой спрашивают
    if (onlyString !== null && onlyString !== undefined) {
      const x = X0 + onlyString * SX;
      out.push(`<rect class="fb-col-hint" x="${(x - SX / 2 + 3).toFixed(1)}" y="${Y0 - 34}" width="${SX - 6}" height="${BOT - Y0 + 44}" rx="${(SX - 6) / 2}"/>`);
    }

    // лады и их номера
    for (let f = 1; f <= 12; f++) {
      const y = Y0 + f * FY;
      out.push(`<line class="fb-fret" x1="${X0 - 10}" y1="${y.toFixed(2)}" x2="${X0 + 5 * SX + 10}" y2="${y.toFixed(2)}"/>`);
      out.push(`<text class="fb-fretnum" x="${X0 - 22}" y="${(Y0 + (f - 0.5) * FY + 2.4).toFixed(2)}" text-anchor="middle">${f}</text>`);
    }
    out.push(`<line class="fb-nut" x1="${X0 - 12}" y1="${Y0}" x2="${X0 + 5 * SX + 12}" y2="${Y0}"/>`);

    // струны: слева 6-я (толстая E), справа 1-я (тонкая e)
    const STR_W = [3.6, 3.0, 2.4, 1.9, 1.5, 1.1];
    for (let k = 0; k < 6; k++) {
      const x = X0 + k * SX;
      out.push(`<line class="fb-string" x1="${x}" y1="${Y0 - 4}" x2="${x}" y2="${BOT + 6}" stroke-width="${STR_W[k]}"/>`);
      out.push(`<text class="fb-string-name" x="${x}" y="13" text-anchor="middle">${["E", "A", "D", "G", "B", "e"][k]}</text>`);
    }

    // инкрустация
    [3, 5, 7, 9, 12].forEach((f) => {
      const y = Y0 + (f - 0.5) * FY;
      const x = X0 + 2.5 * SX;
      out.push(`<circle class="fb-inlay" cx="${x}" cy="${y.toFixed(2)}" r="2.6"/>`);
      if (f === 12) out.push(`<circle class="fb-inlay" cx="${x}" cy="${(y - FY * 0.34).toFixed(2)}" r="2.6"/>`);
    });

    // ноты
    if (spots) {
      (muted || []).forEach((s) => {
        out.push(`<text class="fb-muted" x="${X0 + s * SX}" y="${Y0 - 18}" text-anchor="middle">×</text>`);
      });
      spots.forEach((sp) => {
        const x = X0 + sp.s * SX;
        const y = sp.f === 0 ? Y0 - 24 : Y0 + (sp.f - 0.5) * FY;
        out.push(`<g class="fb-dot ${sp.cls || "d1"}">
          <circle class="fill" cx="${x}" cy="${y.toFixed(2)}" r="${R}"/>
          ${showNames ? `<text x="${x}" y="${(y + 3.4).toFixed(2)}" text-anchor="middle" style="font-size:${FS}px">${sp.text}</text>` : ""}
        </g>`);
      });
    } else if (notes) {
      for (let s = 0; s < 6; s++) {
        if (onlyString !== null && onlyString !== undefined && s !== onlyString) continue;
        const midiBase = TUNING[s];
        for (let f = 0; f <= 12; f++) {
          const pc = pcOf(midiBase + f);
          if (onlyPc !== null && pc !== onlyPc) continue;
          const info = notes[pc];
          if (!info) continue;
          const x = X0 + s * SX;
          const y = f === 0 ? Y0 - 24 : Y0 + (f - 0.5) * FY;
          const txt = labels === "degrees" ? info.deg
            : labels === "intervals" ? info.iv
            : info.name;
          const small = labels !== "notes";
          out.push(`<g class="fb-dot ${info.cls || "d1"}">
            <circle class="fill" cx="${x}" cy="${y.toFixed(2)}" r="${R}"/>
            ${showNames ? `<text x="${x}" y="${(y + 3.4).toFixed(2)}" text-anchor="middle" style="font-size:${small ? (FS - 1.4).toFixed(1) : FS}px">${txt}</text>` : ""}
          </g>`);
        }
      }
    }

    // выбранный лад в тренажёре
    if (chosen !== null && chosen !== undefined && onlyString !== null) {
      const x = X0 + onlyString * SX;
      const y = chosen === 0 ? Y0 - 24 : Y0 + (chosen - 0.5) * FY;
      out.push(`<circle cx="${x}" cy="${y.toFixed(2)}" r="${R + 3.4}" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="3 3"/>`);
    }

    // зоны нажатия
    if (interactive) {
      for (let s = 0; s < 6; s++) {
        if (onlyString !== null && onlyString !== undefined && s !== onlyString) continue;
        const x = X0 + s * SX - SX / 2;
        out.push(`<rect class="fb-hit" data-act="fret" data-string="${s}" data-fret="0" x="${(x + 2).toFixed(2)}" y="${Y0 - 38}" width="${SX - 4}" height="38"/>`);
        for (let f = 1; f <= 12; f++) {
          out.push(`<rect class="fb-hit" data-act="fret" data-string="${s}" data-fret="${f}" x="${(x + 2).toFixed(2)}" y="${(Y0 + (f - 1) * FY).toFixed(2)}" width="${SX - 4}" height="${FY}"/>`);
        }
      }
    }

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Гриф гитары, 0–12 лад">${out.join("")}</svg>`;
  }

  function noteMap(notes, mono) {
    const map = new Array(12).fill(null);
    const classes = ["d1", "d2", "d3", "d4"];
    const seen = new Map();
    notes.forEach((n) => {
      if (seen.has(n.pc)) return;
      const idx = seen.size;
      seen.set(n.pc, true);
      const semi = (n.pc - state.root + 12) % 12;
      map[n.pc] = {
        name: n.name,
        deg: n.deg,
        iv: (INTERVALS[semi] || INTERVALS[0]).short,
        cls: mono ? (idx === 0 ? "d1" : "d3") : classes[Math.min(idx, 3)]
      };
    });
    return map;
  }

  function naturalMap() {
    const map = new Array(12).fill(null);
    [0, 2, 4, 5, 7, 9, 11].forEach((pc) => {
      map[pc] = { name: ROOT_NAMES[pc], deg: "", cls: pc === 0 ? "d1" : "d3" };
    });
    return map;
  }

  function allMap() {
    const map = new Array(12).fill(null);
    for (let pc = 0; pc < 12; pc++) map[pc] = { name: ROOT_NAMES[pc], deg: "", cls: pc === 0 ? "d1" : "d3" };
    return map;
  }

  /* ------------------------------------------------ экраны */
  const dateLine = () => {
    try {
      const s = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
      return s.replace(",", " ·").toUpperCase();
    } catch { return "СЕГОДНЯ"; }
  };

  const MODULES = [
    { n: "01", name: "Интервалы", count: "13 · от примы до октавы", tab: "circle", mode: "interval", topic: "intervals", glyph: SVG('<circle cx="8" cy="17" r="3"/><circle cx="16" cy="7" r="3"/><path d="M10.4 15.2c1.8-2.6 3.4-4.5 4.6-5.6"/>', 26) },
    { n: "02", name: "Аккорды", count: "12 · трезвучия и септы", tab: "circle", mode: "chord", topic: "chords", glyph: SVG('<path d="M12 4.5 20.2 19H3.8L12 4.5Z"/><circle cx="12" cy="4.5" r="1.9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="19" r="1.9" fill="currentColor" stroke="none"/><circle cx="3.8" cy="19" r="1.9" fill="currentColor" stroke="none"/>', 26) },
    { n: "03", name: "Гаммы", count: "12 ладов · от ионийского", tab: "circle", mode: "scale", topic: "scales", glyph: SVG('<path d="M4 20v-5M9.3 20V9M14.6 20v-7M20 20V4"/>', 26) },
    { n: "04", name: "Ноты на грифе", count: "6 струн · 12 ладов", tab: "neck", mode: "notes", topic: "neck", glyph: SVG('<path d="M3 7h18M3 12h18M3 17h18M7.5 4v16M12 4v16M16.5 4v16"/>', 26) }
  ];

  /* ------------------------------------------------ теория: тексты разделов */
  const THEORY = {
    intervals: {
      title: "Интервалы",
      kicker: "раздел 01 · расстояние между нотами",
      lead: "Интервал — это расстояние между двумя нотами. Аккорды и гаммы складываются именно из интервалов, поэтому начинать проще с них.",
      blocks: [
        { h: "Что такое интервал", p: "Интервал — расстояние между двумя нотами. Сыграть их по очереди — получится мелодия, вместе — уже почти аккорд. Всё в теории музыки собрано из интервалов: аккорд — из терций, гамма — из секунд." },
        { h: "Два измерения: ступени и полутоны", p: "У интервала два измерения. Первое — сколько <b>ступеней</b> он занимает: считаем ноты по именам, включая первую (C→E — три ступени: C, D, E). Второе — сколько <b>полутонов</b>: считаем лады на грифе (C→E — четыре лада). Одно и то же расстояние по ступеням бывает шире и уже — отсюда приставки в названии." },
        { h: "Откуда «большие», «малые» и «чистые»", p: "Секунды, терции, сексты и септимы бывают <b>большими</b> и <b>малыми</b>: б.3 — 4 полутона, м.3 — 3. Примы, кварты, квинты и октавы — <b>чистые</b>: они не тянутся на полутон без смены названия. Если интервал выходит за обычный размер, его называют <b>увеличенным</b> или <b>уменьшенным</b>: тритон — это ув.4 или ум.5, одно и то же расстояние." }
      ],
      table: {
        title: "Все тринадцать интервалов",
        cols: ["Знак", "Название", "Полутонов"],
        w: "58px 1fr 64px",
        rows: [
          ["ч.1", "прима", "0"],
          ["м.2", "малая секунда", "1"],
          ["б.2", "большая секунда", "2"],
          ["м.3", "малая терция", "3"],
          ["б.3", "большая терция", "4"],
          ["ч.4", "чистая кварта", "5"],
          ["ув.4 / ум.5", "тритон", "6"],
          ["ч.5", "чистая квинта", "7"],
          ["м.6", "малая секста", "8"],
          ["б.6", "большая секста", "9"],
          ["м.7", "малая септима", "10"],
          ["б.7", "большая септима", "11"],
          ["ч.8", "октава", "12"]
        ]
      },
      after: [
        { h: "Как слышать", p: "Секунда — две ноты рядом, звучит как шаг. Терция — «через одну»: она и делает аккорд мажорным или минорным. Кварта и квинта — опора и пустота, на них держатся аккорды. Секста и септима — краска, из них получаются септаккорды. Тритон — колючий, звучит как вопрос без ответа." },
        { h: "Где это на грифе", p: "Полутон — один лад. Кварта — та же нота на соседней струне через пять ладов, кроме перехода G→B: там четыре. Октава — плюс две струны и два лада, а от 3-й струны к 1-й — плюс три лада." }
      ],
      tips: [
        "Терция решает всё: сыграйте C–E, потом C–E♭ — настроение меняется одной нотой.",
        "Квинта «пустая» и устойчивая — поэтому квинт-аккорды на перегрузе звучат так мощно."
      ],
      cta: { label: "Показать на круге", act: "open-circle", mode: "interval" }
    },
    chords: {
      title: "Аккорды",
      kicker: "раздел 02 · три ноты и больше",
      lead: "Аккорд — это несколько нот, взятых вместе. Почти всё строится по терциям от тоники: <b>1 — 3 — 5</b>, а дальше добавляются септимы, сексты и замены.",
      blocks: [
        { h: "Трезвучие: 1–3–5", p: "Мажор: 4 полутона до терции и 3 до квинты. Минор: 3 и 4. Разница между «светлым» и «тёмным» — одна нота, поэтому так легко ошибиться на слух, но так же легко перестроить аккорд." },
        { h: "Что значит цифра", p: "Голая буква — мажор, <b>m</b> — минор, <b>7</b> — септима (в джазе почти всегда малая), <b>maj7</b> — большая септима, <b>sus</b> — терцию заменили на 2 или 4, <b>add</b> — ноту добавили, ничего не убирая." }
      ],
      typesTitle: "Обозначения под рукой",
      types: [
        ["C", "мажорное трезвучие", "1 · 3 · 5"],
        ["Cm", "минорное трезвучие", "1 · ♭3 · 5"],
        ["C7", "доминантсептаккорд", "1 · 3 · 5 · ♭7"],
        ["Cmaj7", "большой мажорный септаккорд", "1 · 3 · 5 · 7"],
        ["Cm7", "малый минорный септаккорд", "1 · ♭3 · 5 · ♭7"],
        ["Cdim", "уменьшенный", "1 · ♭3 · ♭5"],
        ["Caug", "увеличенный", "1 · 3 · ♯5"],
        ["Csus4", "с квартой вместо терции", "1 · 4 · 5"],
        ["Csus2", "со второй вместо терции", "1 · 2 · 5"],
        ["C6", "с секстой", "1 · 3 · 5 · 6"],
        ["Cadd9", "с добавленной ноной", "1 · 3 · 5 · 9"],
        ["Cm7♭5", "полууменьшенный", "1 · ♭3 · ♭5 · ♭7"]
      ],
      tips: [
        "Cmaj7 — это C + E + G + B. Если видите просто «7», сверху будет си-бемоль, а не си.",
        "sus4 разрешается в обычный мажор: Gsus4 → G. Отсюда ощущение «подвешенности» перед ударом."
      ],
      cta: { label: "Показать на круге", act: "open-circle", mode: "chord" }
    },
    scales: {
      title: "Гаммы",
      kicker: "раздел 03 · шаблон из семи нот",
      lead: "Гамма — семь нот от тоники до октавы. Это не «правильные» ноты, а <b>шаблон расстояний</b>: одинаковый шаблон от любой ноты даёт родственную гамму.",
      blocks: [
        { h: "Шаблоны", p: "Мажор: 2–2–1–2–2–2–1. Натуральный минор: 2–1–2–2–1–2–2. Пентатоника — пять нот без полутонов, её удобно играть соло: почти невозможно «промахнуться»." },
        { h: "Лады — это одна гамма", p: "Дорийский, фригийский, лидийский и остальные — тот же набор нот мажора, но сыгранный от другой ступени. Поэтому они родственники: меняется тоника и настроение, а ноты те же." }
      ],
      tips: [
        "Тоники на 6-й струне: 3-й лад — G, 5-й — A, 8-й — C, 10-й — D. Дальше гамма строится от них.",
        "На грифе гамма — это 3 ноты на струну, кроме перехода G→B: там 2."
      ],
      table: {
        title: "Семь ладов мажора",
        cols: ["Лад", "Ступень", "Настроение"],
        w: "1.1fr 48px 1fr",
        rows: [
          ["Ионийский", "1", "мажор как он есть"],
          ["Дорийский", "2", "минор с бодрой секстой"],
          ["Фригийский", "3", "испанский, фламенко"],
          ["Лидийский", "4", "мечтательный, «кино»"],
          ["Миксолидийский", "5", "блюз и рок"],
          ["Эолийский", "6", "натуральный минор"],
          ["Локрийский", "7", "неустойчивый, редкий"]
        ]
      },
      cta: { label: "Показать на круге", act: "open-circle", mode: "scale" }
    },
    neck: {
      title: "Ноты на грифе",
      kicker: "раздел 04 · карта инструмента",
      lead: "Строй гитары — E–A–D–G–B–E от 6-й струны к 1-й. Между соседними струнами кварта, и только между G и B — большая терция.",
      blocks: [
        { h: "Октава — 12 ладов", p: "На 12-м ладу звучит та же нота, что открытая струна. Поэтому гриф учат не как 72 точки, а как повторяющийся круг из 12 нот." },
        { h: "Ориентиры на 6-й струне", p: "1 — F, 3 — G, 5 — A, 7 — B, 8 — C, 10 — D, 12 — E. Эти точки — каркас для аккордов с басом на шестой, а от них легко находить соседние ноты." },
        { h: "Почему строй такой", p: "Кварты между струнами дают одинаковые формы аккордов по всему грифу: сдвинули на два лада — получили тот же аккорд выше. Исключение G→B появилось, чтобы аккорды ложились под пальцы, а не растягивались на пять ладов." }
      ],
      tips: [
        "Октава: +2 струны и +2 лада; для 3→1 — +2 струны и +3 лада.",
        "Одна и та же нота на соседней струне — через 5 ладов, кроме G→B: там 4."
      ],
      table: {
        title: "Открытые струны и 5-й лад",
        cols: ["Струна", "Открытая", "5-й лад"],
        w: "54px 1fr 1fr",
        rows: [
          ["6-я", "E", "A"],
          ["5-я", "A", "D"],
          ["4-я", "D", "G"],
          ["3-я", "G", "C"],
          ["2-я", "B", "E"],
          ["1-я", "e", "A"]
        ]
      },
      cta: { label: "Открыть гриф", act: "open-neck", mode: "notes" }
    }
  };

  function theoryScreen(id) {
    const t = THEORY[id];
    if (!t) return homeScreen();
    return `
      <div class="shead">
        <div>
          <div class="kicker">${t.kicker}</div>
          <h1>${t.title}<span class="dot-accent">.</span></h1>
        </div>
      </div>
      <p class="lead lead-wide">${t.lead}</p>
      <div class="theory">
        ${t.blocks.map((b) => `<h2>${b.h}</h2><p>${b.p}</p>`).join("")}
        ${t.types ? `
          <h2>${t.typesTitle}</h2>
          <div class="ctype">
            ${t.types.map(([sym, name, formula]) => `
              <div class="ctype-row"><code>${sym}</code><span><i>${name}</i> · ${formula}</span></div>`).join("")}
          </div>` : ""}
        ${t.table ? `
          <h2>${t.table.title}</h2>
          <div class="dtable">
            <div class="dtable-row is-head" style="grid-template-columns:${t.table.w}">
              ${t.table.cols.map((c) => `<span>${c}</span>`).join("")}
            </div>
            ${t.table.rows.map((r) => `
              <div class="dtable-row" style="grid-template-columns:${t.table.w}">${r.map((c) => `<span>${c}</span>`).join("")}</div>`).join("")}
          </div>` : ""}
        ${(t.after || []).map((b) => `<h2>${b.h}</h2><p>${b.p}</p>`).join("")}
        ${t.tips.map((tip) => `<div class="tip"><div class="k">лайфхак</div><p>${tip}</p></div>`).join("")}
      </div>
      <button class="btn-primary wide" data-act="${t.cta.act}" data-mode="${t.cta.mode}">${t.cta.label}</button>
      <div style="height:10px"></div>
    `;
  }


  /* маленькое колесо для карточки «аккорд дня» */
  function miniWheelHTML(chord, size = 96) {
    const c = 50, R = 34;
    const rad = (i) => (-90 + i * 30) * Math.PI / 180;
    const pcs = chord.notes.map((n) => n.pc);
    const pts = pcs
      .slice()
      .sort((a, b) => ((a - state.root + 12) % 12) - ((b - state.root + 12) % 12))
      .map((pc) => `${(c + R * Math.cos(rad(pc))).toFixed(1)},${(c + R * Math.sin(rad(pc))).toFixed(1)}`)
      .join(" ");
    const dots = Array.from({ length: 12 }, (_, i) => {
      const on = pcs.includes(i);
      return `<circle class="mw-dot ${on ? "is-on" : ""}" cx="${(c + R * Math.cos(rad(i))).toFixed(1)}" cy="${(c + R * Math.sin(rad(i))).toFixed(1)}" r="${on ? 2.9 : 1.5}"/>`;
    }).join("");
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="mini-wheel" aria-hidden="true">
      <circle class="mw-rail" cx="${c}" cy="${c}" r="${R}"/>
      ${pcs.length >= 3 ? `<polygon class="mw-poly" points="${pts}"/>` : ""}
      <circle class="mw-core" cx="${c}" cy="${c}" r="19"/>
      ${dots}
    </svg>`;
  }

  function homeScreen() {
    if (state.topic) return theoryScreen(state.topic);
    const dayChord = (() => {
      const prev = { root: state.root, chord: state.chord, inv: state.inv };
      state.root = 0; state.chord = 3; state.inv = 0;
      const c = chordData();
      Object.assign(state, prev);
      return c;
    })();

    return `
      <div class="shead">
        <div>
          <div class="kicker">${dateLine()}</div>
          <h1>Теория<span class="dot-accent">.</span></h1>
        </div>
        <div class="meta">4 раздела<br>без интернета</div>
      </div>
      <p class="lead">Двенадцать нот — и всё, что из них строится: интервалы, аккорды, гаммы. Начните с круга или откройте раздел.</p>

      <div class="mod-grid">
        ${MODULES.map((m) => `
          <button class="mod" data-act="topic" data-topic="${m.topic}">
            <span class="corner">${m.n}</span>
            ${m.glyph}
            <span><span class="mod-name">${m.name}</span><span class="mod-count">${m.count}</span></span>
          </button>`).join("")}
      </div>

      <div class="slabel"><span>Аккорд дня</span><span>разбор</span></div>
      <div class="card chord-day">
        <div class="chord-day-top">
          <div class="chord-day-info">
            <div class="sym">${dayChord.symbol}</div>
            <div class="feel">${dayChord.feel} · ${dayChord.notes.map((n) => n.deg).join(" – ")}</div>
          </div>
          <button class="mw-btn" data-act="play-day" aria-label="Послушать ${dayChord.symbol}">
            ${miniWheelHTML(dayChord, 96)}
            <span class="mw-btn-ic">${ICON.play}</span>
          </button>
        </div>
        <div class="note-row">
          ${dayChord.notes.map((n, i) => `<span class="note-chip ${i === 1 ? "is-third" : i === 2 ? "is-fifth" : i === 3 ? "is-seventh" : ""}"><b>${n.name}</b>${n.deg}</span>`).join("")}
        </div>
      </div>
      <div class="pull">
        <div class="kicker">определение</div>
        <p>Лад — это <b>семь нот</b>, из которых строится мелодия. Аккорд — <b>три-четыре</b> из них, взятые вместе.</p>
      </div>
      <div style="height:6px"></div>
    `;
  }

  /* части экрана «Круг» — чтобы при перетаскивании обновлять только их */
  function circleMeta() {
    const ctx = activeContext();
    return state.mode === "chord" ? `${ctx.notes.length} нот${ctx.notes.length > 4 ? "" : "ы"}<br>тон: ${ROOT_NAMES[state.root]}`
      : state.mode === "scale" ? `${ctx.notes.length} ступеней<br>${scaleData().sub}`
      : `${intervalData().semi} полутонов<br>${intervalData().feel}`;
  }

  function controlsHTML() {
    return state.mode === "interval" ? intervalControls() : state.mode === "scale" ? scaleControls() : chordControls();
  }

  function circleScreen() {
    const seg = `
      <div class="seg" role="tablist">
        <button data-act="mode" data-mode="interval" class="${state.mode === "interval" ? "on" : ""}">Интервалы</button>
        <button data-act="mode" data-mode="chord" class="${state.mode === "chord" ? "on" : ""}">Аккорды</button>
        <button data-act="mode" data-mode="scale" class="${state.mode === "scale" ? "on" : ""}">Гаммы</button>
      </div>`;

    return `
      <div class="shead">
        <div>
          <div class="kicker">12 нот · 12 часов</div>
          <h1>Круг</h1>
        </div>
        <div class="meta">${circleMeta()}</div>
      </div>
      <div class="circle-bar">
        ${seg}
        <button class="round-btn" data-act="play" aria-label="Слушать" title="Слушать">${ICON.play}</button>
        <button class="round-btn ${state.arp ? "on" : ""}" data-act="arp" aria-label="Арпеджио по нотам" title="Арпеджио">${ICON.arp}</button>
      </div>
      <div class="wheel-wrap" id="wheelWrap">
        ${wheelHTML()}
        <div class="wheel-center">${wheelCenterHTML()}</div>
      </div>
      <div class="wheel-hint">тяните фигуру, чтобы сменить тональность</div>
      <div class="controls card">${controlsHTML()}</div>
      ${state.mode === "scale" ? harmonyBlock() : ""}
      <div style="height:6px"></div>
    `;
  }

  function chordControls() {
    const ch = chordData();
    return `
      <div>
        <div class="ctl-head"><span>Основной тон</span><span>${ROOT_NAMES[state.root]}</span></div>
        <div class="root-grid">
          ${ROOT_NAMES.map((n, pc) => `<button class="root-btn ${pc === state.root ? "on" : ""}" data-act="root" data-pc="${pc}">${n}</button>`).join("")}
        </div>
      </div>
      <div>
        <div class="ctl-head"><span>Тип аккорда</span><span>${ch.label}</span></div>
        <div class="chips">
          ${CHORDS.map((c, i) => `<button class="chip ${i === state.chord ? "on" : ""}" data-act="chord" data-i="${i}">${c.label}</button>`).join("")}
        </div>
      </div>
      <div>
        <div class="ctl-head"><span>Обращение</span><span>${ch.inv === 0 ? "от основного тона" : "бас: " + ch.bass.name}</span></div>
        <div class="inversion">
          <button data-act="inv" data-i="0" class="${ch.inv === 0 ? "on" : ""}">Основное</button>
          <button data-act="inv" data-i="1" class="${ch.inv === 1 ? "on" : ""}" ${ch.notes.length < 2 ? "disabled" : ""}>1-е</button>
          <button data-act="inv" data-i="2" class="${ch.inv === 2 ? "on" : ""}" ${ch.notes.length < 3 ? "disabled" : ""}>2-е</button>
        </div>
      </div>
    `;
  }

  function scaleControls() {
    const s = scaleData();
    return `
      <div>
        <div class="ctl-head"><span>Тональность</span><span>${s.rootName}</span></div>
        <div class="root-grid">
          ${ROOT_NAMES.map((n, pc) => `<button class="root-btn ${pc === state.root ? "on" : ""}" data-act="root" data-pc="${pc}">${n}</button>`).join("")}
        </div>
      </div>
      <div>
        <div class="ctl-head"><span>Лад</span><span>${s.sub}</span></div>
        <div class="chips">
          ${SCALES.map((x, i) => `<button class="chip ${i === state.scale ? "on" : ""}" data-act="scale" data-i="${i}">${x.label}</button>`).join("")}
        </div>
      </div>
    `;
  }

  function intervalControls() {
    const iv = intervalData();
    const fill = (state.interval / 12) * 100;
    return `
      <div>
        <div class="ctl-head"><span>Основной тон</span><span>${iv.rootName}</span></div>
        <div class="root-grid">
          ${ROOT_NAMES.map((n, pc) => `<button class="root-btn ${pc === state.root ? "on" : ""}" data-act="root" data-pc="${pc}">${n}</button>`).join("")}
        </div>
      </div>
      <div class="slider-block">
        <div class="ctl-head"><span>Расстояние</span><span>${iv.rootName} → ${iv.to}</span></div>
        <div class="slider-top">
          <b id="ivName">${iv.name}</b>
          <span id="ivSemi">${state.interval} полутонов</span>
        </div>
        <input type="range" min="0" max="12" step="1" value="${state.interval}" data-range="interval" style="--fill:${fill}%" aria-label="Количество полутонов">
        <div class="scale-marks"><span>0</span><span>3</span><span>6</span><span>9</span><span>12</span></div>
      </div>
    `;
  }

  function harmonyBlock() {
    const rows = harmonyRows();
    if (!rows.length) return "";
    return `
      <div class="harmony">
        <div class="slabel"><span>Аккорды в тональности</span><span>${state.root !== undefined ? ROOT_NAMES[state.root] : ""}</span></div>
        <div class="harmony-row">
          ${rows.map((r) => `<button data-act="harmony" data-pc="${r.pc}" data-quality="${r.quality}"><span class="rn">${r.rn}</span><span class="ch">${r.name}</span></button>`).join("")}
        </div>
      </div>
    `;
  }

  function neckScreen() {
    const mode = state.neckMode;
    const labels = mode === "notes" ? "notes" : state.neckLabels;
    let map, legend = "", metaLine = "", spots = null, shapeTag = "";
    if (mode === "notes") {
      map = state.naturalsOnly ? naturalMap() : allMap();
      metaLine = state.naturalsOnly ? "натуральные" : "все 12";
      legend = `<div class="legend"><span><i style="background:var(--accent)"></i>C — точка отсчёта</span><span><i style="background:var(--deg-5)"></i>натуральные ноты</span></div>`;
    } else if (mode === "scale") {
      const s = scaleData();
      map = noteMap(s.notes, true);
      legend = `<div class="legend"><span><i style="background:var(--accent)"></i>${s.notes[0].name} — тоника</span><span><i style="background:var(--deg-5)"></i>${state.neckLabels === "intervals" ? "интервалы от тоники" : "ступени лада"}</span></div>`;
      metaLine = s.label;
    } else {
      const c = chordData();
      if (labels === "shape") {
        const shapes = allShapes(c);
        const sh = shapes[Math.min(state.neckShape, Math.max(shapes.length - 1, 0))] || null;
        if (sh) {
          shapeTag = sh.tag;
          const mutedStrings = [];
          spots = sh.frets
            .map((f, s) => {
              if (f === null) { mutedStrings.push(s); return null; }
              const pc = pcOf(TUNING[s] + f);
              const idx = c.notes.findIndex((n) => n.pc === pc);
              return { s, f, cls: ["d1", "d2", "d3", "d4"][Math.max(idx, 0)] };
            })
            .filter(Boolean)
            .map((sp) => {
              const pc = pcOf(TUNING[sp.s] + sp.f);
              const deg = c.notes.find((n) => n.pc === pc);
              return { ...sp, text: deg ? deg.name : ROOT_NAMES[pc] };
            });
          spots.muted = mutedStrings;
        }
        legend = `<div class="legend"><span><i style="background:var(--accent)"></i>${c.notes[0].name} — основа</span><span><i style="background:var(--deg-5)"></i>${shapeTag || "форма"}</span></div>`;
        metaLine = c.label;
      } else {
        map = noteMap(c.notes);
        legend = `<div class="legend">${c.notes.map((n, i) => {
          const iv = (INTERVALS[(n.pc - state.root + 12) % 12] || INTERVALS[0]).short;
          const main = labels === "degrees" ? n.deg : labels === "intervals" ? iv : n.deg;
          return `<span><i style="background:${["var(--accent)", "var(--accent-2)", "var(--deg-5)", "var(--deg-7)"][i]}"></i>${main}${main === n.name ? "" : ` — ${n.name}`}</span>`;
        }).join("")}</div>`;
        metaLine = c.label;
      }
    }

    const labelChips = mode === "notes" ? "" : `
      <div class="chips label-chips">
        ${[["notes", "Ноты"], ["degrees", "Ступени"], ["intervals", "Интервалы"], ["shape", "Аппликатура"]]
          .filter(([id]) => id !== "shape" || mode === "chord")
          .map(([id, text]) => `<button class="chip ${state.neckLabels === id ? "on" : ""}" data-act="necklabels" data-v="${id}">${text}</button>`).join("")}
      </div>`;

    return `
      <div class="shead">
        <div>
          <div class="kicker">Строй E A D G B E</div>
          <h1>Гриф</h1>
        </div>
        <div class="meta">${mode === "notes" ? "все струны" : ROOT_NAMES[state.root]}<br>${metaLine}</div>
      </div>
      <div class="seg">
        <button data-act="neckmode" data-mode="notes" class="${mode === "notes" ? "on" : ""}">Ноты</button>
        <button data-act="neckmode" data-mode="chord" class="${mode === "chord" ? "on" : ""}">Аккорд</button>
        <button data-act="neckmode" data-mode="scale" class="${mode === "scale" ? "on" : ""}">Гамма</button>
      </div>
      ${mode === "notes" ? `<div class="chips" style="margin-top:10px">
        <button class="chip ${state.naturalsOnly ? "on" : ""}" data-act="naturals" data-v="1">Натуральные</button>
        <button class="chip ${!state.naturalsOnly ? "on" : ""}" data-act="naturals" data-v="0">Все 12</button>
      </div>` : labelChips}
      <div class="card neck-card" id="neckCard" style="margin-top:10px">
        ${fretboardHTML({ notes: map, interactive: true, labels, spots, muted: spots && spots.muted })}
      </div>
      <div class="neck-readout" id="neckReadout"><span>Нажми на точку грифа, чтобы услышать ноту</span><b></b></div>
      ${legend}
      ${mode === "chord" ? shapesBlock() : `<div class="tip"><div class="k">лайфхак</div><p>${mode === "scale" ? THEORY.scales.tips[1] : THEORY.neck.tips[0]}</p></div>`}
      <div style="height:10px"></div>
    `;
  }

  /* аппликатуры выбранного аккорда */
  /* формы из библиотеки: сдвигаем по струне тоники под текущий корень */
  function libraryShapes(ch) {
    const lib = SHAPE_LIB[ch.id];
    if (!lib) return [];
    const out = [];
    lib.forEach((s) => {
      if (s.fixed && s.root !== state.root) return;
      const shift = s.fixed ? 0 : ((state.root - s.root) % 12 + 12) % 12;
      const frets = s.frets.map((f) => (f === null ? null : f + shift));
      const played = frets.filter((f) => f !== null);
      if (played.length < 3) return;
      if (Math.max.apply(null, played) > 12) return;
      const low = Math.min.apply(null, played);
      out.push({
        frets,
        tag: s.fixed ? "открытая · " + s.tag : s.form + " · " + low + " лад",
        low
      });
    });
    return out.sort((a, b) => (a.low === 0 ? -1 : b.low === 0 ? 1 : a.low - b.low));
  }

  /** Все аппликатуры аккорда: библиотека + генератор, без дублей, по возрастанию позиции. */
  function allShapes(c) {
    const lib = libraryShapes(c);
    const key = (frets) => frets.map((f) => (f === null ? "x" : f)).join(",");
    const have = lib.map((s) => key(s.frets));
    const gen = chordShapes(c)
      .filter((s) => have.indexOf(key(s)) < 0)
      .map((s) => {
        const low = Math.min.apply(null, s.filter((f) => f !== null)) || 0;
        return { frets: s, tag: low === 0 ? "вариант" : low + " лад", low };
      })
      .filter((s) => s.low > 0 || !lib.some((l) => l.low === 0));
    return lib.slice().sort((a, b) => a.low - b.low)
      .concat(gen.slice().sort((a, b) => a.low - b.low));
  }

  function shapesBlock() {
    const c = chordData();
    const all = allShapes(c);
    if (!all.length) return "";
    const key = (frets) => frets.map((f) => (f === null ? "x" : f)).join(",");
    const limit = state.moreShapes ? 8 : 4;
    const shown = all.slice(0, limit);

    return `
      <div class="slabel"><span>Аппликатуры</span><span>${all.length} ${all.length === 1 ? "вариант" : all.length < 5 ? "варианта" : "вариантов"}</span></div>
      <div class="shapes">
        ${shown.map((s, i) => `<button class="shape ${state.neckLabels === "shape" && state.neckShape === i ? "on" : ""}" data-act="shape" data-i="${i}" data-frets="${key(s.frets)}">
            ${shapeSVG(s.frets)}
            <span class="shape-lbl">${s.tag}</span>
          </button>`).join("")}
      </div>
      ${all.length > 4 ? `<button class="more-shapes" data-act="shapes-more">${state.moreShapes ? "свернуть" : "ещё варианты"} ${ICON.arrow}</button>` : ""}`;
  }

  /* одна струна, 13 ладов — компактный ответ вместо целого грифа */
  function stringStripHTML({ stringIdx, revealPc = null, chosen = null, fretCount = 13 }) {
    const W = 340, H = 92;
    const X0 = 6, X1 = W - 6, N = fretCount;
    const CW = (X1 - X0) / N;
    const CT = 14, CH = 46;
    const out = [];
    const base = TUNING[stringIdx];

    for (let f = 0; f < N; f++) {
      const cx = X0 + (f + 0.5) * CW;
      const pc = pcOf(base + f);
      const hit = revealPc !== null && pc === revealPc;
      const isChosen = chosen === f;

      out.push(`<rect class="strip-cell ${hit ? "is-hit" : ""} ${isChosen ? "is-chosen" : ""}"
        x="${(X0 + f * CW + 1.4).toFixed(1)}" y="${CT}" width="${(CW - 2.8).toFixed(1)}" height="${CH}" rx="9"/>`);

      if (hit) {
        out.push(`<text class="strip-dot-lbl" x="${cx.toFixed(1)}" y="${CT + CH / 2 + 4.2}" text-anchor="middle">${ROOT_NAMES[revealPc]}</text>`);
      }
      out.push(`<text class="strip-num ${hit ? "is-hit" : ""}" x="${cx.toFixed(1)}" y="${CT + CH + 15}" text-anchor="middle">${f}</text>`);
    }

    if (chosen === null || chosen === undefined) {
      for (let f = 0; f < N; f++) {
        out.push(`<rect class="fb-hit" data-act="fret" data-string="${stringIdx}" data-fret="${f}" x="${(X0 + f * CW).toFixed(1)}" y="${CT}" width="${CW.toFixed(1)}" height="${CH + 22}"/>`);
      }
    }

    return `<svg viewBox="0 0 ${W} ${H}" class="strip" role="img" aria-label="Струна ${6 - stringIdx}, лады 0–12">${out.join("")}</svg>`;
  }

  /* ------------------------------------------------ тренажёр */
  const TRAIN_MODES = [
    { id: "note", name: "Ноты на грифе", hint: "где живёт нота на струне" },
    { id: "chordNotes", name: "Ноты в аккорде", hint: "собрать состав на колесе" },
    { id: "buildChord", name: "Сборка аккорда", hint: "по ступеням от тоники" },
    { id: "buildScale", name: "Сборка гаммы", hint: "отметить ноты лада" },
    { id: "earInt", name: "Интервалы на слух", hint: "узнать по звучанию" },
    { id: "earChord", name: "Аккорды на слух", hint: "определить тип" }
  ];
  const TOTAL_Q = 10;
  const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
  const LEVEL_NAMES = ["Новичок", "Уверенный", "Профи"];

  const train = {
    started: false,
    finished: false,
    mode: "chordNotes",
    level: 1,
    topic: "natural",
    round: 1,
    asked: 0,
    correct: 0,
    streak: 0,
    best: 0,
    q: null,
    picked: [],
    result: null,
    t0: 0,
    lastMs: 0,
    totalMs: 0,
    wrong: []
  };

  const randOf = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);

  function trainRoot() {
    return train.topic === "natural" ? randOf(NATURAL_PC) : Math.floor(Math.random() * 12);
  }

  function chordPool() {
    const ids = [["maj", "min"], ["maj", "min", "7", "maj7", "m7", "sus2", "sus4"], null][train.level - 1];
    return ids ? CHORDS.filter((c) => ids.indexOf(c.id) >= 0) : CHORDS;
  }

  function earChordPool() {
    const ids = [["maj", "min"], ["maj", "min", "7", "maj7", "m7"], null][train.level - 1];
    return ids ? CHORDS.filter((c) => ids.indexOf(c.id) >= 0) : CHORDS;
  }

  function scalePool() {
    const ids = [["major", "minor"], ["major", "minor", "dorian", "mixolydian", "harmonic", "pentamaj", "pentamin"], null][train.level - 1];
    return ids ? SCALES.filter((s) => ids.indexOf(s.id) >= 0) : SCALES;
  }

  function intervalPool() {
    const semis = [[2, 4, 5, 7, 12], [1, 2, 3, 4, 5, 7, 9, 12], null][train.level - 1];
    return semis ? INTERVALS.filter((i) => semis.indexOf(i.semi) >= 0) : INTERVALS.filter((i) => i.semi > 0);
  }

  function chordNotesOf(root, ch) {
    const rn = ROOT_NAMES[root];
    return ch.notes.map(([semi, step, deg]) => {
      const pc = (root + semi) % 12;
      return { pc, name: spell(rn, step, pc), deg };
    });
  }

  function scaleNotesOf(root, sc) {
    const rn = ROOT_NAMES[root];
    return sc.semi.map((semi, i) => {
      const pc = (root + semi) % 12;
      return { pc, name: spell(rn, sc.steps[i], pc), deg: sc.deg[i] };
    });
  }

  const uniqPc = (notes) => {
    const out = [];
    notes.forEach((n) => { if (out.indexOf(n.pc) < 0) out.push(n.pc); });
    return out;
  };

  function newTrainQuestion() {
    train.picked = [];
    train.result = null;
    train.t0 = Date.now();
    const mode = train.mode;

    if (mode === "note") {
      const maxFret = [5, 9, 12][train.level - 1];
      let str = 0, fret = 0, pc = 0, guard = 0;
      do {
        str = Math.floor(Math.random() * 6);
        fret = Math.floor(Math.random() * (maxFret + 1));
        pc = (TUNING[str] + fret) % 12;
      } while (train.topic === "natural" && NATURAL_PC.indexOf(pc) < 0 && ++guard < 60);
      train.q = { kind: "note", pc, str, fret };
      return;
    }

    const root = trainRoot();

    if (mode === "earInt") {
      const pool = intervalPool();
      const iv = randOf(pool);
      const opts = [iv];
      const rest = shuffle(pool.filter((i) => i !== iv));
      while (opts.length < Math.min(4, pool.length) && rest.length) opts.push(rest.shift());
      train.q = { kind: "earInt", root, iv, opts: shuffle(opts) };
      setTimeout(playEar, 220);
      return;
    }

    if (mode === "earChord") {
      const pool = earChordPool();
      const ch = randOf(pool);
      const opts = [ch];
      const rest = shuffle(pool.filter((c) => c !== ch));
      while (opts.length < Math.min(4, pool.length) && rest.length) opts.push(rest.shift());
      const midis = ch.notes.map(([semi]) => 48 + root + semi);
      train.q = { kind: "earChord", root, ch, opts: shuffle(opts), midis };
      setTimeout(playEar, 220);
      return;
    }

    if (mode === "buildScale") {
      const sc = randOf(scalePool());
      train.q = {
        kind: "set", root, sc, target: uniqPc(scaleNotesOf(root, sc)),
        title: `Гамма <em>${ROOT_NAMES[root]}</em>`, sub: sc.sub
      };
      return;
    }

    const ch = randOf(chordPool());
    const target = uniqPc(chordNotesOf(root, ch));
    train.q = mode === "chordNotes"
      ? { kind: "set", root, ch, target, title: `Ноты аккорда <em>${ROOT_NAMES[root]}${ch.sym}</em>`, sub: "отметьте их на колесе" }
      : { kind: "set", root, ch, target, title: `Аккорд от <em>${ROOT_NAMES[root]}</em>`, sub: ch.notes.map((n) => n[2]).join(" · ") };
  }

  function playEar() {
    const q = train.q;
    if (!q || !state.sound) return;
    if (q.kind === "earInt") strum([48 + q.root, 48 + q.root + q.iv.semi], 0.42, 1.9);
    if (q.kind === "earChord") strum(q.midis, 0.05, 2.1);
  }

  /* как выглядел вопрос и что было правильным — для разбора ошибок в конце серии */
  function reviewOf(q) {
    if (q.kind === "note") {
      const fret = ((q.pc - (TUNING[q.str] % 12)) % 12 + 12) % 12;
      return { q: `Нота ${ROOT_NAMES[q.pc]} · ${6 - q.str}-я струна`, a: `${fret}-й лад` };
    }
    if (q.kind === "set") {
      return { q: q.title.replace(/<[^>]+>/g, ""), a: q.target.map((pc) => ROOT_NAMES[pc]).join(" · ") };
    }
    if (q.kind === "earInt") return { q: "Интервал на слух", a: q.iv.name };
    return { q: `Аккорд на слух от ${ROOT_NAMES[q.root]}`, a: `${ROOT_NAMES[q.root]}${q.ch.sym} · ${q.ch.label}` };
  }

  function finishQuestion(ok) {
    train.asked += 1;
    train.lastMs = train.t0 ? Date.now() - train.t0 : 0;
    train.totalMs += train.lastMs;
    if (ok) {
      train.correct += 1;
      train.streak += 1;
      train.best = Math.max(train.best, train.streak);
    } else {
      train.streak = 0;
      train.wrong.push(reviewOf(train.q));
    }
  }

  function answerNote(fret) {
    const q = train.q;
    if (!q || q.kind !== "note" || train.result) return;
    const pc = (TUNING[q.str] + fret) % 12;
    const ok = pc === q.pc;
    train.picked = [fret];
    train.result = { ok };
    finishQuestion(ok);
    if (ok) pluck(TUNING[q.str] + fret, undefined, 1.4, 0.16); else buzz();
    render(true);
  }

  function togglePick(pc) {
    const q = train.q;
    if (!q || q.kind !== "set" || train.result) return;
    const i = train.picked.indexOf(pc);
    if (i < 0) train.picked.push(pc); else train.picked.splice(i, 1);
    if (state.sound) pluck(60 + pc, undefined, 1.1, 0.11);
    render(true);
  }

  function checkSet() {
    const q = train.q;
    if (!q || q.kind !== "set" || train.result) return;
    const right = q.target.slice().sort((a, b) => a - b);
    const picked = train.picked.slice().sort((a, b) => a - b);
    const ok = right.length === picked.length && right.every((pc, i) => pc === picked[i]);
    train.result = { ok, right };
    finishQuestion(ok);
    if (ok) strum(right.map((pc) => 48 + pc), 0.05, 1.9); else buzz();
    render(true);
  }

  function answerEar(i) {
    const q = train.q;
    if (!q || train.result) return;
    const right = q.kind === "earInt" ? q.iv : q.ch;
    const ok = q.opts[i] === right;
    train.result = { ok, pickedIdx: i, rightIdx: q.opts.indexOf(right) };
    finishQuestion(ok);
    if (ok) { if (q.kind === "earInt") strum([48 + q.root, 48 + q.root + q.iv.semi], 0.42, 1.9); else strum(q.midis, 0.05, 2.1); }
    else buzz();
    render(true);
  }

  function nextTrain() {
    if (train.round >= TOTAL_Q) {
      train.finished = true;
      render(true);
      return;
    }
    train.round += 1;
    newTrainQuestion();
    render(true);
  }

  function startTrain() {
    pushNav();
    train.started = true;
    train.finished = false;
    train.round = 1;
    train.asked = 0;
    train.correct = 0;
    train.streak = 0;
    train.best = 0;
    train.wrong = [];
    train.totalMs = 0;
    newTrainQuestion();
    render(true);
  }

  function trainSetupScreen() {
    return `
      <div class="shead">
        <div>
          <div class="kicker">10 вопросов · без интернета</div>
          <h1>Тренажёр</h1>
        </div>
        <div class="meta">режим<br>и сложность</div>
      </div>
      <div class="card setup">
        <div class="slabel"><span>Что тренируем</span></div>
        <div class="mode-grid">
          ${TRAIN_MODES.map((m) => `<button class="mode-card ${train.mode === m.id ? "on" : ""}" data-act="train-mode" data-mode="${m.id}">
            <b>${m.name}</b><span>${m.hint}</span>
          </button>`).join("")}
        </div>
        <div class="slabel"><span>Сложность</span><span>${LEVEL_NAMES[train.level - 1]}</span></div>
        <div class="seg three">
          ${LEVEL_NAMES.map((n, i) => `<button data-act="train-level" data-level="${i + 1}" class="${train.level === i + 1 ? "on" : ""}">${n}</button>`).join("")}
        </div>
        <div class="slabel"><span>Тональности</span><span>${train.topic === "natural" ? "без знаков" : "все 12"}</span></div>
        <div class="seg">
          <button data-act="train-topic" data-topic="natural" class="${train.topic === "natural" ? "on" : ""}">Без знаков</button>
          <button data-act="train-topic" data-topic="all" class="${train.topic === "all" ? "on" : ""}">Все</button>
        </div>
        <button class="btn-primary wide" data-act="train-start">Начать серию ${ICON.arrow}</button>
      </div>
      <div class="card tip">
        <span class="num">${TOTAL_Q}</span>
        <p><b>Серия — ${TOTAL_Q} вопросов.</b> Сложность меняет набор: «Новичок» держится белых клавиш и простых трезвучий, «Профи» добавляет септы и все тональности.</p>
      </div>
      <div style="height:6px"></div>
    `;
  }

  function trainSummaryScreen() {
    const accuracy = train.asked ? Math.round((train.correct / train.asked) * 100) : 0;
    const verdict = accuracy >= 90 ? "Отличная серия" : accuracy >= 70 ? "Хорошо, но есть над чем работать" : "Стоит повторить теорию";
    const avg = train.totalMs ? (train.totalMs / train.asked / 1000).toFixed(1).replace(".", ",") : "";
    const mistakes = train.wrong.slice(0, 6);
    return `
      <div class="shead">
        <div>
          <div class="kicker">серия закончена</div>
          <h1>Итог</h1>
        </div>
        <div class="meta">${TOTAL_Q} вопросов<br>${TRAIN_MODES.filter((m) => m.id === train.mode)[0].name.toLowerCase()}</div>
      </div>
      <div class="card result">
        <div class="result-num">${accuracy}<span>%</span></div>
        <div class="result-verdict">${verdict}${avg ? " · в среднем " + avg + " с на вопрос" : ""}</div>
        <div class="stats inside">
          <div class="stat"><b>${train.correct}</b><span>верно</span></div>
          <div class="stat"><b>${train.asked - train.correct}</b><span>ошибок</span></div>
          <div class="stat"><b>${train.best}</b><span>лучшая серия</span></div>
        </div>
        <button class="btn-primary wide" data-act="train-again">Ещё серию ${ICON.arrow}</button>
        <button class="btn-ghost wide" data-act="train-setup">Сменить режим</button>
      </div>
      ${mistakes.length ? `<div class="card review">
        <div class="slabel"><span>Разбор ошибок</span><span>${train.wrong.length} из ${train.asked}</span></div>
        ${mistakes.map((w) => `<div class="review-row"><span>${w.q}</span><b>${w.a}</b></div>`).join("")}
        ${train.wrong.length > mistakes.length ? `<div class="review-more">и ещё ${train.wrong.length - mistakes.length}</div>` : ""}
      </div>` : ""}
      <div style="height:6px"></div>
    `;
  }

  function padHTML(picked, target, reveal) {
    const c = 170, R = 122;
    const rad = (i) => (-90 + i * 30) * Math.PI / 180;
    const px = (i) => c + R * Math.cos(rad(i));
    const py = (i) => c + R * Math.sin(rad(i));
    const out = [`<circle class="rail-soft" cx="${c}" cy="${c}" r="156"/>`];

    for (let i = 0; i < 12; i++) {
      const on = picked.indexOf(i) >= 0;
      const right = reveal && target.indexOf(i) >= 0;
      const wrong = reveal && on && target.indexOf(i) < 0;
      const miss = reveal && !on && target.indexOf(i) >= 0;
      out.push(`<g class="wnode ${on ? "is-on" : ""} ${right ? "is-right" : ""} ${wrong ? "is-wrong" : ""} ${miss ? "is-miss" : ""}"
          data-act="pick" data-pc="${i}" role="button" aria-label="${ROOT_NAMES[i]}, ${SOLFEGE[i]}">
        <circle class="halo" cx="${px(i).toFixed(1)}" cy="${py(i).toFixed(1)}" r="27"/>
        <circle class="base" cx="${px(i).toFixed(1)}" cy="${py(i).toFixed(1)}" r="19"/>
        <text class="lbl" x="${px(i).toFixed(1)}" y="${(py(i) - 1.5).toFixed(1)}" text-anchor="middle">${ROOT_NAMES[i]}</text>
        <text class="sol" x="${px(i).toFixed(1)}" y="${(py(i) + 8.5).toFixed(1)}" text-anchor="middle">${SOLFEGE[i]}</text>
      </g>`);
    }

    const left = target.length - picked.filter((pc) => target.indexOf(pc) >= 0).length;
    return `<svg viewBox="0 0 340 340" class="wheel pad" role="group" aria-label="Колесо — отметьте ноты">${out.join("")}</svg>
      <div class="pad-count">${picked.length ? (reveal ? "готово" : "отмечено " + picked.length + " · осталось " + Math.max(left, 0)) : "отметьте ноты на колесе"}</div>`;
  }

  function trainQuestionScreen() {
    const q = train.q;
    const answered = !!train.result;
    const accuracy = train.asked ? Math.round((train.correct / train.asked) * 100) : 100;
    const modeName = TRAIN_MODES.filter((m) => m.id === train.mode)[0].name;
    let head = "", body = "", fb = "";

    if (q.kind === "note") {
      const name = ROOT_NAMES[q.pc];
      const diff = ((q.pc - (TUNING[q.str] % 12)) % 12 + 12) % 12;
      head = `<div class="kicker">вопрос ${train.round} · ${["E", "A", "D", "G", "B", "e"][q.str]}</div>
        <div class="quiz-q">Где нота <em>${name}</em><br>на ${6 - q.str}-й струне?</div>`;
      body = stringStripHTML({ stringIdx: q.str, revealPc: answered ? q.pc : null, chosen: answered ? train.picked[0] : null, fretCount: [6, 10, 13][train.level - 1] });
      fb = answered
        ? `<div class="fb-text ${train.result.ok ? "ok" : "no"}">${train.result.ok ? ICON.check : ICON.close}<span>${train.result.ok ? "Верно — " + name + " именно здесь." : "Мимо: " + name + " на " + diff + "-м ладу."}</span></div>`
        : `<div class="fb-text muted">Нажми на лад, где живёт эта нота</div>`;
    }

    if (q.kind === "set") {
      const rightNames = q.target.map((pc) => ROOT_NAMES[pc]).join(" · ");
      head = `<div class="kicker">вопрос ${train.round} · ${modeName.toLowerCase()}</div>
        <div class="quiz-q">${q.title}<br><span class="quiz-sub">${q.sub}</span></div>`;
      body = `<div class="pad-wrap">${padHTML(train.picked, q.target, answered)}</div>`;
      fb = answered
        ? `<div class="fb-text ${train.result.ok ? "ok" : "no"}">${train.result.ok ? ICON.check : ICON.close}<span>${train.result.ok ? "Точно: " + rightNames : "Нужно было: " + rightNames}</span></div>`
        : `<button class="btn-primary wide" data-act="check" ${train.picked.length ? "" : "disabled"}>Проверить ${ICON.arrow}</button>`;
    }

    if (q.kind === "earInt" || q.kind === "earChord") {
      const isInt = q.kind === "earInt";
      const right = isInt ? q.iv : q.ch;
      const rightLabel = isInt ? `${right.name} · ${right.short}` : `${ROOT_NAMES[q.root]}${right.sym} · ${right.label}`;
      head = `<div class="kicker">вопрос ${train.round} · ${modeName.toLowerCase()}</div>
        <div class="quiz-q">${isInt ? "Какой интервал звучит?" : "Какой аккорд звучит?"}<br><span class="quiz-sub">${isInt ? "сначала нижний звук, потом верхний" : "аккорд от " + ROOT_NAMES[q.root]}</span></div>`;
      body = `<button class="replay ${answered ? "is-off" : ""}" data-act="replay" aria-label="Слушать ещё">${ICON.play}<span>${answered ? "сыграть ещё" : "слушать"}</span></button>
        <div class="quiz-options">
          ${q.opts.map((o, i) => {
            const label = isInt ? o.name : `${ROOT_NAMES[q.root]}${o.sym} · ${o.label.toLowerCase()}`;
            const state2 = answered
              ? (i === train.result.rightIdx ? "is-right" : i === train.result.pickedIdx ? "is-wrong" : "")
              : "";
            return `<button class="opt ${state2}" data-act="ear" data-idx="${i}" ${answered ? "disabled" : ""}>${label}</button>`;
          }).join("")}
        </div>`;
      fb = answered
        ? `<div class="fb-text ${train.result.ok ? "ok" : "no"}">${train.result.ok ? ICON.check : ICON.close}<span>${train.result.ok ? "Верно — " + rightLabel : "Это " + rightLabel}</span></div>`
        : `<div class="fb-text muted">Послушайте и выберите вариант</div>`;
    }

    if (answered && train.lastMs) {
      const sec = (train.lastMs / 1000).toFixed(1).replace(".", ",");
      fb = fb.replace(/<\/span><\/div>$/, `</span><span class="fb-time">${sec} с</span></div>`);
    }

    return `
      <div class="shead">
        <div>
          <div class="kicker">${modeName}</div>
          <h1>Тренажёр</h1>
        </div>
        <div class="meta">серия ${train.streak}<br>вопрос ${train.round} из ${TOTAL_Q}</div>
      </div>
      <div class="stats">
        <div class="stat"><b>${accuracy}%</b><span>точность</span></div>
        <div class="stat"><b>${train.correct}</b><span>верно</span></div>
        <div class="stat"><b>${train.best}</b><span>лучшая серия</span></div>
      </div>
      <div class="card quiz-card">
        ${head}
        ${body}
        <div class="quiz-fb">
          ${fb}
          ${answered ? `<button class="btn-sm" data-act="train-next">${train.round >= TOTAL_Q ? "Итоги" : "Дальше"} ${ICON.arrow}</button>` : ""}
        </div>
      </div>
      <button class="btn-ghost wide" data-act="train-setup">Сменить режим</button>
      ${trainTip()}
      <div style="height:6px"></div>
    `;
  }

  function trainTip() {
    const tips = {
      note: "Строй гитары — E A D G B E. Квинты между струнами (кроме G–B) дают одинаковые рисунки аккордов по всему грифу.",
      chordNotes: "Ступени 1–3–5 дают трезвучие. Терция решает характер: большая — мажор, малая — минор.",
      buildChord: "Сначала тоника, потом терция и квинта. Септима (♭7 или 7) добавляет напряжение.",
      buildScale: "В мажоре полутоны между 3–4 и 7–8 ступенями. Сдвиньте любую ноту — и лад станет другим.",
      earInt: "Секунда звучит рядом, терция — певуче, кварта и квинта — опора, октава — та же нота выше.",
      earChord: "Слушайте терцию: мажор светло, минор темнее. Септима добавляет джазовое напряжение."
    };
    return `<div class="card tip"><span class="num">?</span><p><b>Подсказка.</b> ${tips[train.mode]}</p></div>`;
  }

  function trainScreen() {
    if (!train.started) return trainSetupScreen();
    if (train.finished) return trainSummaryScreen();
    return trainQuestionScreen();
  }

  /* ------------------------------------------------ экраны-таблицы */
  const screens = { home: homeScreen, circle: circleScreen, neck: neckScreen, train: trainScreen };

  /* ------------------------------------------------ рендер */
  const app = $("#app");
  const screenEl = $("#screen");

  /* перерисовка только того, что зависит от тональности — без вспышек */
  let lastScreenKey = "";

  function patchCircle() {
    const wrap = $("#wheelWrap");
    if (!wrap) return;
    wrap.innerHTML = wheelHTML() + `<div class="wheel-center">${wheelCenterHTML()}</div>`;

    const meta = $(".meta");
    if (meta) meta.innerHTML = circleMeta();

    const controls = $(".controls");
    if (controls) {
      const scrolls = $$(".chips", controls).map((b) => b.scrollLeft);
      controls.innerHTML = controlsHTML();
      $$(".chips", controls).forEach((b, i) => { if (scrolls[i]) b.scrollLeft = scrolls[i]; });
    }

    const harmony = $(".harmony");
    if (harmony && state.mode === "scale") harmony.outerHTML = harmonyBlock();
  }

  function render(keepScroll = true) {
    const top = keepScroll ? screenEl.scrollTop : 0;
    const key = `${state.tab}:${state.mode}:${state.neckMode}`;
    screenEl.innerHTML = screens[state.tab]();
    screenEl.scrollTop = top;
    // анимация появления — только при смене экрана, иначе каждое нажатие «мигает»
    if (key !== lastScreenKey) {
      lastScreenKey = key;
      screenEl.classList.remove("screen-enter");
      void screenEl.offsetWidth;
      screenEl.classList.add("screen-enter");
    }
    $$(".tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
    $("#soundBtn").innerHTML = state.sound ? ICON.sound : ICON.mute;
    $("#soundBtn").classList.toggle("is-muted", !state.sound);
    $("#modal").innerHTML = state.confirmTrain ? `
      <div class="modal">
        <div class="modal-card">
          <div class="kicker">серия идёт</div>
          <h3>Прервать серию?</h3>
          <p>Ответы этой серии не сохранятся: осталось ${Math.max(TOTAL_Q - train.asked, 0)} из ${TOTAL_Q}.</p>
          <button class="btn-primary wide" data-act="train-abort">Прервать</button>
          <button class="btn-ghost wide" data-act="train-continue">Продолжить</button>
        </div>
      </div>` : "";
    centerActiveChip();
    markScrollableChips();
    syncBackDepth();
  }

  /* горизонтальный жест отдаём странице только у реально прокручиваемых рядов чипов */
  function markScrollableChips() {
    $$(".chips").forEach((box) => {
      box.classList.toggle("is-scrollable", box.scrollWidth > box.clientWidth + 4);
    });
  }

  /* выбранный чип всегда в середине списка — иначе при смене лада список прыгает к началу */
  function centerActiveChip() {
    $$(".chips").forEach((box) => {
      const on = box.querySelector(".chip.on");
      if (!on) return;
      const b = box.getBoundingClientRect();
      const o = on.getBoundingClientRect();
      const delta = (o.left - b.left) - (b.width - o.width) / 2;
      box.scrollLeft += delta;
    });
  }

  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function toast(text) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      app.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 1600);
  }

  function playCurrent() {
    if (!state.sound) { toast("Звук выключен"); return; }
    if (state.mode === "chord") {
      const c = chordData();
      const midis = c.voiced.map((n) => n.midi);
      state.arp ? arpeggio(midis) : strum(midis);
    } else if (state.mode === "scale") {
      const s = scaleData();
      if (!ensureAudio()) return;
      const start = 60 + state.root;
      const midis = s.semi.map((x) => start + x);
      arpeggio(midis.concat([start + 12]), 0.13, 1.5);
    } else {
      const iv = intervalData();
      strum([60 + state.root, 60 + state.root + iv.semi], 0.28, 2.2);
    }
  }

  /* ------------------------------------------------ колесо: тянем фигуру */
  let suppressClick = null;
  const drag = { active: false, id: null, startAngle: 0, startRoot: 0, lastStep: 0, moved: false };

  function wheelAngle(e) {
    const wrap = $("#wheelWrap");
    if (!wrap) return null;
    const r = wrap.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  }

  document.addEventListener("pointerdown", (e) => {
    if (state.tab !== "circle") return;
    // тянем только внутри круга: в углах квадрата и вокруг — обычный скролл страницы
    if (!e.target.closest(".wheel")) return;
    const a = wheelAngle(e);
    if (a === null) return;
    const note = e.target.closest(".wnode");
    if (note) {
      note.classList.add("is-press");
      drag.pressEl = note;
    } else {
      drag.pressEl = null;
    }
    drag.active = true;
    drag.id = e.pointerId;
    drag.startAngle = a;
    drag.startRoot = state.root;
    drag.lastStep = 0;
    drag.moved = false;
    document.body.classList.add("is-dragging");
  }, { passive: true });

  function releasePress() {
    if (drag.pressEl) {
      drag.pressEl.classList.remove("is-press");
      drag.pressEl = null;
    }
  }

  document.addEventListener("pointermove", (e) => {
    if (!drag.active || e.pointerId !== drag.id) return;
    const a = wheelAngle(e);
    if (a === null) return;
    let delta = a - drag.startAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) > 5) drag.moved = true;
    const step = Math.round(delta / 30);
    if (step === drag.lastStep) return;
    drag.lastStep = step;
    const next = ((drag.startRoot + step) % 12 + 12) % 12;
    if (next === state.root) return;
    state.root = next;
    patchCircle();
  });

  function endDrag(e) {
    if (!drag.active || (e && e.pointerId !== drag.id)) return;
    const moved = drag.moved;
    releasePress();
    drag.active = false;
    drag.id = null;
    drag.moved = false;
    drag.lastStep = 0;
    document.body.classList.remove("is-dragging");
    if (moved) {
      suppressClick = null;
      if (state.sound) playCurrent();
    }
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  // горизонтальный свайп — в тех же зонах, где страница листается вертикально
  let swipe = null;

  function swipeZone(target) {
    if (target.closest(".wheel-wrap, .pad, input, textarea, select")) return null;
    const chips = target.closest(".chips");
    if (chips && chips.scrollWidth > chips.clientWidth + 4) return null;
    if (state.tab === "circle") return "mode";
    if (state.tab === "neck" && state.neckMode !== "notes" && state.neckLabels !== "shape") return "labels";
    return null;
  }

  function applyNeckFlip(dir) {
    const svg = $("#neckCard svg");
    if (!svg) return;
    svg.style.setProperty("--dir", (dir > 0 ? 26 : -26) + "px");
    svg.classList.remove("neck-flip");
    void svg.offsetWidth;
    svg.classList.add("neck-flip");
  }

  function cycleNeckLabels(dx) {
    const order = ["notes", "degrees", "intervals"];
    const i = order.indexOf(state.neckLabels);
    const next = order[Math.min(Math.max(i + (dx < 0 ? 1 : -1), 0), order.length - 1)];
    if (next === state.neckLabels) return false;
    state.neckLabels = next;
    return true;
  }

  function switchModeBy(dir) {
    const order = ["interval", "chord", "scale"];
    const i = order.indexOf(state.mode);
    const next = order[Math.min(Math.max(i + dir, 0), order.length - 1)];
    if (next === state.mode) return false;
    state.mode = next;
    state.returnMode = null;
    state.inv = 0;
    return true;
  }

  function animateWheel(dir) {
    const wrap = $(".wheel-wrap");
    if (!wrap) return;
    wrap.style.setProperty("--dir", (dir > 0 ? 34 : -34) + "px");
    wrap.classList.remove("circle-slide");
    void wrap.offsetWidth;
    wrap.classList.add("circle-slide");
  }

  function runSwipe(zone, dx, src, x, y) {
    document.body.dataset.lastSwipe = zone + "/" + src + "/" + Math.round(dx);
    suppressClick = { until: Date.now() + 350, x: x || 0, y: y || 0 };
    if (zone === "mode") {
      if (switchModeBy(dx < 0 ? 1 : -1)) { render(true); animateWheel(dx < 0 ? 1 : -1); }
    } else if (cycleNeckLabels(dx)) {
      render(true);
      applyNeckFlip(dx < 0 ? 1 : -1);
    }
  }

  document.addEventListener("pointerdown", (e) => {
    const zone = swipeZone(e.target);
    if (!zone) return;
    swipe = { zone, x: e.clientX, y: e.clientY };
  });
  document.addEventListener("pointermove", (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const zone = swipe.zone;
    swipe = null;
    runSwipe(zone, dx, "pointer", e.clientX, e.clientY);
  });
  document.addEventListener("pointerup", () => { swipe = null; });
  document.addEventListener("pointercancel", () => { swipe = null; });

  // тач-дубль: на телефоне браузер умеет забирать горизонтальный жест себе
  let touchSwipe = null;
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { touchSwipe = null; return; }
    const zone = swipeZone(e.target);
    if (!zone) return;
    const t = e.touches[0];
    touchSwipe = { zone, x: t.clientX, y: t.clientY };
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!touchSwipe) return;
    const t = e.touches[0];
    const dx = t.clientX - touchSwipe.x;
    const dy = t.clientY - touchSwipe.y;
    if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    const zone = touchSwipe.zone;
    touchSwipe = null;
    swipe = null;
    if (e.cancelable) e.preventDefault();
    runSwipe(zone, dx, "touch", t.clientX, t.clientY);
  }, { passive: false });
  document.addEventListener("touchend", () => { touchSwipe = null; });
  document.addEventListener("touchcancel", () => { touchSwipe = null; });

  /* ------------------------------------------------ события */
  document.addEventListener("click", (e) => {
    // гасим только тот клик, который браузер сам сгенерировал в конце жеста:
    // близко по месту и сразу по времени. Обычный тап рядом проходит.
    if (suppressClick && Date.now() < suppressClick.until &&
        Math.abs(e.clientX - suppressClick.x) < 26 &&
        Math.abs(e.clientY - suppressClick.y) < 26) {
      suppressClick = null;
      return;
    }
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act;

    switch (act) {
      case "tab":
        if (state.tab === el.dataset.tab) return;
        pushNav();
        state.tab = el.dataset.tab;
        state.returnMode = null;
        if (state.tab === "home") state.topic = null;
        // гриф показывает то, что выбрано в круге: аккорд или гамму
        if (state.tab === "neck") {
          state.neckMode = state.mode === "scale" ? "scale" : state.mode === "chord" ? "chord" : "notes";
        }
        render(false);
        break;

      case "topic":
        pushNav();
        state.topic = el.dataset.topic;
        state.tab = "home";
        render(false);
        break;

      case "open-circle":
        pushNav();
        state.mode = el.dataset.mode || state.mode;
        state.returnMode = null;
        state.tab = "circle";
        render(false);
        break;

      case "open-neck":
        pushNav();
        state.neckMode = "notes";
        state.tab = "neck";
        render(false);
        break;

      case "go":
        state.tab = el.dataset.tab || "circle";
        state.returnMode = null;
        if (el.dataset.mode) {
          if (el.dataset.mode === "notes") {
            state.tab = "neck";
            state.neckMode = "notes";
          } else {
            state.mode = el.dataset.mode;
            if (state.tab === "neck") state.neckMode = el.dataset.mode;
          }
        }
        render(false);
        break;

      case "mode":
        state.mode = el.dataset.mode;
        state.inv = 0;
        state.returnMode = null;
        render(true);
        break;

      case "root":
        state.root = +el.dataset.pc;
        state.inv = 0;
        render(true);
        if (state.mode === "chord" || state.mode === "interval") {
          const c = activeContext();
          if (state.sound) strum(c.notes.map((n) => n.midi || 60 + n.pc), 0.05, 1.4);
        }
        break;

      case "chord":
        state.chord = +el.dataset.i;
        state.inv = 0;
        render(true);
        if (state.sound) playCurrent();
        break;

      case "scale":
        state.scale = +el.dataset.i;
        render(true);
        break;

      case "inv":
        state.inv = +el.dataset.i;
        render(true);
        if (state.sound) playCurrent();
        break;

      case "play":
        playCurrent();
        break;

      case "play-day":
        strum([60, 64, 67, 71], 0.05, 2.1);
        break;

      case "arp":
        state.arp = !state.arp;
        toast(state.arp ? "Арпеджио включено" : "Аккорд целиком");
        render(true);
        break;

      case "tone":
        if (ensureAudio()) pluck(+el.dataset.midi + 12, undefined, 1.2, 0.16);
        break;

      case "wheel-note":
        if (ensureAudio()) pluck(60 + (+el.dataset.pc), undefined, 1.3, 0.16);
        break;

      case "neckmode":
        state.neckMode = el.dataset.mode;
        if (el.dataset.mode === "chord" || el.dataset.mode === "scale") state.mode = el.dataset.mode;
        render(false);
        break;

      case "naturals":
        state.naturalsOnly = el.dataset.v === "1";
        render(true);
        break;

      case "harmony": {
        state.returnMode = { scale: state.scale, root: state.root };
        state.mode = "chord";
        state.root = +el.dataset.pc;
        const q = el.dataset.quality;
        const idx = CHORDS.findIndex((c) => c.id === q);
        state.chord = idx >= 0 ? idx : 0;
        state.inv = 0;
        render(false);
        if (state.sound) playCurrent();
        break;
      }

      case "necklabels":
        state.neckLabels = el.dataset.v;
        render(true);
        applyNeckFlip(1);
        break;

      case "shapes-more":
        state.moreShapes = !state.moreShapes;
        render(true);
        break;

      case "shape": {
        const frets = el.dataset.frets.split(",").map((f) => (f === "x" ? null : +f));
        if (el.dataset.i !== undefined) state.neckShape = +el.dataset.i;
        const midis = frets.map((f, s) => (f === null ? null : TUNING[s] + f + 12)).filter((m) => m !== null);
        if (state.sound) strum(midis, 0.05, 1.9);
        if (state.neckLabels === "shape") render(true);
        break;
      }

      case "fret": {
        if (state.tab !== "train") {
          const name = ROOT_NAMES[(TUNING[+el.dataset.string] + +el.dataset.fret) % 12];
          const ro = $("#neckReadout");
          if (ro) ro.innerHTML = `<span>${6 - (+el.dataset.string)}-я струна · ${el.dataset.fret} лад</span><b>${name}</b>`;
          pluck(TUNING[+el.dataset.string] + +el.dataset.fret, undefined, 1.2, 0.15);
          break;
        }
        answerNote(+el.dataset.fret);
        break;
      }

      case "pick":
        togglePick(+el.dataset.pc);
        break;

      case "check":
        checkSet();
        break;

      case "ear":
        answerEar(+el.dataset.idx);
        break;

      case "replay":
        playEar();
        break;

      case "train-mode":
        train.mode = el.dataset.mode;
        render(true);
        break;

      case "train-level":
        train.level = +el.dataset.level;
        render(true);
        break;

      case "train-topic":
        train.topic = el.dataset.topic;
        render(true);
        break;

      case "train-start":
        startTrain();
        break;

      case "train-next":
        nextTrain();
        break;

      case "train-again":
        startTrain();
        break;

      case "train-setup":
        if (train.started && !train.finished) {
          state.confirmTrain = true;
          state.confirmFrom = "mode";
          render(true);
        } else {
          train.started = false;
          train.finished = false;
          render(true);
        }
        break;

      case "train-continue":
        state.confirmTrain = false;
        render(true);
        break;

      case "train-abort":
        state.confirmTrain = false;
        if (state.confirmFrom === "mode") {
          train.started = false;
          train.finished = false;
          render(true);
        } else {
          goHome();
        }
        break;
    }
  });

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.matches('[data-range="interval"]')) return;
    state.interval = +el.value;
    el.style.setProperty("--fill", (state.interval / 12) * 100 + "%");
    const iv = intervalData();
    const nameEl = $("#ivName"), semiEl = $("#ivSemi");
    if (nameEl) nameEl.textContent = iv.name;
    if (semiEl) semiEl.textContent = state.interval + " полутонов";
    const wrap = $(".wheel-wrap");
    if (wrap) {
      wrap.innerHTML = wheelHTML() + `<div class="wheel-center">${wheelCenterHTML()}</div>`;
    }
    const tones = $(".tones");
    if (tones) {
      const ctx = activeContext();
      tones.innerHTML = ctx.notes.map((n, i) => `<button class="tone is-${i + 1}" data-act="tone" data-midi="${n.midi}"><b>${n.name}</b><small>${n.deg}</small></button>`).join("");
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (!el.matches('[data-range="interval"]')) return;
    const iv = intervalData();
    strum([60 + state.root, 60 + state.root + iv.semi], 0.3, 2.1);
  });

  $("#soundBtn").addEventListener("click", () => {
    state.sound = !state.sound;
    render(true);
    if (state.sound) {
      ensureAudio();
      playCurrent();
    }
  });

  /* ------------------------------------------------ темы: светлая и тёмная */
  const THEME_KEY = "lad.theme";

  function systemTheme() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "air";
    } catch { return "air"; }
  }

  function applyTheme(name, save = true) {
    state.theme = name;
    app.dataset.theme = name;
    document.body.dataset.theme = name;
    const btn = $("#themeBtn");
    if (btn) {
      btn.innerHTML = name === "night" ? ICON.sun : ICON.moon;
      btn.setAttribute("aria-label", name === "night" ? "Включить светлую тему" : "Включить тёмную тему");
    }
    if (save) { try { localStorage.setItem(THEME_KEY, name); } catch { /* приватный режим */ } }
    // оболочка красит иконки статус-бара под тему (без optional chaining — старые WebView)
    try {
      if (window.LadHost && window.LadHost.onTheme) window.LadHost.onTheme(name === "night");
    } catch (e) { /* нет оболочки */ }
  }

  const theme = params.get("theme") || (() => {
    try { return localStorage.getItem(THEME_KEY) || systemTheme(); } catch { return systemTheme(); }
  })();

  // демонстрация для витрины: ?train=<режим>&demo=train|answered
  const trainParam = params.get("train");
  if (trainParam && TRAIN_MODES.some((m) => m.id === trainParam)) train.mode = trainParam;
  const lvlParam = +params.get("level");
  if (lvlParam >= 1 && lvlParam <= 3) train.level = lvlParam;
  const topicParam = params.get("topic");
  if (topicParam === "all" || topicParam === "natural") train.topic = topicParam;
  if (topicParam && THEORY[topicParam]) { state.topic = topicParam; state.tab = "home"; }

  if (params.get("demo") === "train" || params.get("demo") === "answered") {
    startTrain();
    if (params.get("demo") === "answered") {
      const q0 = train.q;
      if (q0.kind === "note") answerNote(q0.fret);
      else if (q0.kind === "set") { train.picked = q0.target.slice(); checkSet(); }
      else answerEar(q0.opts.indexOf(q0.kind === "earInt" ? q0.iv : q0.ch));
    }
  }

  // витрина: неверный ответ и итог серии
  if (params.get("demo") === "wrong") {
    startTrain();
    const q0 = train.q;
    if (q0.kind === "note") answerNote((q0.fret + 1) % 13);
    else if (q0.kind === "set") {
      const miss = q0.target[1] === undefined ? 1 : (q0.target[1] + 1) % 12;
      train.picked = [q0.target[0], miss];
      checkSet();
    } else answerEar((q0.opts.indexOf(q0.kind === "earInt" ? q0.iv : q0.ch) + 1) % q0.opts.length);
  }

  if (params.get("demo") === "confirm") {
    startTrain();
    state.confirmTrain = true;
  }

  if (params.get("demo") === "summary") {
    startTrain();
    train.round = TOTAL_Q;
    train.asked = 10;
    train.correct = 8;
    train.best = 6;
    train.streak = 2;
    train.totalMs = 64000;
    train.wrong = [
      { q: "Ноты аккорда Gm", a: "G · B♭ · D" },
      { q: "Интервал на слух", a: "Большая секста" }
    ];
    train.finished = true;
  }

  // для скриншотов витрины: ?demo=harmony показывает чип возврата к гамме
  if (params.get("demo") === "harmony" && state.mode === "chord") {
    state.returnMode = { scale: state.scale, root: state.root };
    state.root = (state.root + 9) % 12;
    state.chord = 1;
  }


  // самопроверка свайпа: ?test=swipe&tx=120&ty=700
  if (params.get("test") === "swipe") {
    setTimeout(() => {
      const tx = +(params.get("tx") || 200), ty = +(params.get("ty") || 600);
      const el = document.elementFromPoint(tx, ty) || document.body;
      const mk = (type, x) => new PointerEvent(type, { bubbles: true, clientX: x, clientY: ty, pointerId: 1, pointerType: "touch", isPrimary: true });
      el.dispatchEvent(mk("pointerdown", tx + 90));
      el.dispatchEvent(mk("pointermove", tx));
      el.dispatchEvent(mk("pointerup", tx));
      document.body.dataset.testSwipe = state.mode + "/" + (el.className || el.tagName);
    }, 0);
  }

  applyTheme(theme, false);

  render(false);

  // для скриншотов витрины: ?scroll=520 прокручивает экран к нижнему блоку
  const scrollParam = params.get("scroll");
  if (scrollParam) screenEl.scrollTop = +scrollParam;

  // самопроверка перетаскивания: ?test=drag
  if (params.get("test") === "drag") {
    const wrap = $("#wheelWrap");
    if (wrap) {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const fire = (type, x, y) => wrap.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 1, clientX: x, clientY: y
      }));
      fire("pointerdown", cx, cy - r.width * 0.4);
      fire("pointermove", cx + r.width * 0.4, cy);
      document.body.dataset.testRoot = String(state.root);
      fire("pointerup", cx + r.width * 0.4, cy);
    }
  }

  // корректная иконка звука при первом рендере
  // самопроверка аппликатур: ?test=shapes — у каждой формы точный состав нот
  if (params.get("test") === "shapes") {
    const fails = [];
    const savedRoot = state.root, savedChord = state.chord;
    CHORDS.forEach((ch, ci) => {
      if (!SHAPE_LIB[ch.id]) return;
      for (let r = 0; r < 12; r++) {
        state.root = r;
        state.chord = ci;
        const want = ch.notes.map((s) => (r + s[0]) % 12);
        const third = ch.notes.filter((n) => /3/.test(n[2]))[0];
        const seventh = ch.notes.filter((n) => /7/.test(n[2]))[0];
        libraryShapes(ch).forEach((s) => {
          const got = [];
          s.frets.forEach((f, str) => {
            if (f === null) return;
            const pc = (TUNING[str] + f) % 12;
            if (got.indexOf(pc) < 0) got.push(pc);
          });
          got.sort((a, b) => a - b);
          const foreign = got.filter((pc) => want.indexOf(pc) < 0);
          const miss = [];
          if (got.indexOf(r) < 0) miss.push("1");
          if (third && got.indexOf((r + third[0]) % 12) < 0) miss.push("3");
          if (seventh && got.indexOf((r + seventh[0]) % 12) < 0) miss.push("7");
          if (foreign.length || miss.length) {
            fails.push(ch.id + "/" + ROOT_NAMES[r] + " " + s.tag + " лишние:[" + foreign.join(",") + "] нет:[" + miss.join(",") + "]");
          }
        });
      }
    });
    state.root = savedRoot;
    state.chord = savedChord;
    document.body.dataset.testShapes = fails.length ? fails.slice(0, 8).join(" | ") : "ok";
  }


  $("#soundBtn").innerHTML = state.sound ? ICON.sound : ICON.mute;

  $("#themeBtn").addEventListener("click", () => {
    applyTheme(state.theme === "night" ? "air" : "night");
  });
})();
