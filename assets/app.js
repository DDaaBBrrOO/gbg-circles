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
    returnMode: null,
    quiz: null
  };

  const screenParam = params.get("screen");
  if (["home", "circle", "neck", "train"].includes(screenParam)) state.tab = screenParam;
  if (screenParam === "chords") { state.tab = "circle"; state.mode = "chord"; }
  if (screenParam === "scales") { state.tab = "circle"; state.mode = "scale"; }
  if (screenParam === "intervals") { state.tab = "circle"; state.mode = "interval"; }
  const modeParam = params.get("mode");
  if (["chord", "scale", "interval"].includes(modeParam)) {
    state.mode = modeParam;
    if (state.tab === "home") state.tab = "circle";
  }

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
      notes = null,          // массив 12: {name, deg, cls} | null
      interactive = false,
      onlyPc = null,
      onlyString = null,
      chosen = null,
      showNames = true
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
    if (notes) {
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
          out.push(`<g class="fb-dot ${info.cls || "d1"}">
            <circle class="fill" cx="${x}" cy="${y.toFixed(2)}" r="${R}"/>
            ${showNames ? `<text x="${x}" y="${(y + 3.6).toFixed(2)}" text-anchor="middle" style="font-size:${FS}px">${info.name}</text>` : ""}
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

  function noteMap(notes) {
    const map = new Array(12).fill(null);
    const classes = ["d1", "d2", "d3", "d4"];
    const seen = new Map();
    notes.forEach((n) => {
      if (seen.has(n.pc)) return;
      const idx = seen.size;
      seen.set(n.pc, true);
      map[n.pc] = { name: n.name, deg: n.deg, cls: classes[Math.min(idx, 3)] };
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
    { n: "01", name: "Интервалы", count: "13 · от примы до октавы", tab: "circle", mode: "interval", glyph: SVG('<circle cx="8" cy="17" r="3"/><circle cx="16" cy="7" r="3"/><path d="M10.4 15.2c1.8-2.6 3.4-4.5 4.6-5.6"/>', 26) },
    { n: "02", name: "Аккорды", count: "12 · трезвучия и септы", tab: "circle", mode: "chord", glyph: SVG('<path d="M12 4.5 20.2 19H3.8L12 4.5Z"/><circle cx="12" cy="4.5" r="1.9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="19" r="1.9" fill="currentColor" stroke="none"/><circle cx="3.8" cy="19" r="1.9" fill="currentColor" stroke="none"/>', 26) },
    { n: "03", name: "Гаммы", count: "12 ладов · от ионийского", tab: "circle", mode: "scale", glyph: SVG('<path d="M4 20v-5M9.3 20V9M14.6 20v-7M20 20V4"/>', 26) },
    { n: "04", name: "Ноты на грифе", count: "6 струн · 12 ладов", tab: "neck", mode: "notes", glyph: SVG('<path d="M3 7h18M3 12h18M3 17h18M7.5 4v16M12 4v16M16.5 4v16"/>', 26) }
  ];

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
      <p class="lead">Двенадцать нот — и всё, что из них строится: интервалы, аккорды, гаммы. Начните с круга.</p>

      <div class="mod-grid">
        ${MODULES.map((m) => `
          <button class="mod" data-act="go" data-tab="${m.tab}" data-mode="${m.mode}">
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

  function tonesHTML() {
    const ctx = activeContext();
    const scale = state.mode === "scale" ? " is-scale" : "";
    return `<div class="tones${ctx.notes.length >= 6 ? " dense" : ""}${scale}">
      ${ctx.notes.map((n, i) => `<button class="tone is-${i + 1}" data-act="tone" data-midi="${n.midi}"><b>${n.name}</b><small>${n.deg}</small></button>`).join("")}
    </div>`;
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

    const back = state.returnMode
      ? `<button class="back-chip" data-act="back">${ICON.back}<span>К гамме ${ROOT_NAMES[state.returnMode.root]} ${SCALES[state.returnMode.scale].label.toLowerCase()}</span></button>`
      : "";

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
      ${back}
      <div class="wheel-wrap" id="wheelWrap">
        ${wheelHTML()}
        <div class="wheel-center">${wheelCenterHTML()}</div>
      </div>
      <div class="wheel-hint">тяните фигуру, чтобы сменить тональность</div>
      ${tonesHTML()}
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
    let map, legend = "", metaLine = "";
    if (mode === "notes") {
      map = state.naturalsOnly ? naturalMap() : allMap();
      metaLine = state.naturalsOnly ? "натуральные" : "все 12";
      legend = `<div class="legend"><span><i style="background:var(--accent)"></i>C — точка отсчёта</span><span><i style="background:var(--deg-5)"></i>натуральные ноты</span></div>`;
    } else if (mode === "scale") {
      const s = scaleData();
      map = noteMap(s.notes);
      legend = `<div class="legend">${s.notes.slice(0, 4).map((n) => `<span><i style="background:${n.pc === s.notes[0].pc ? "var(--accent)" : "var(--accent-2)"}"></i>${n.deg} — ${n.name}</span>`).join("")}</div>`;
      metaLine = s.label;
    } else {
      const c = chordData();
      map = noteMap(c.notes);
      legend = `<div class="legend">${c.notes.map((n, i) => `<span><i style="background:${["var(--accent)", "var(--accent-2)", "var(--deg-5)", "var(--deg-7)"][i]}"></i>${n.deg} — ${n.name}</span>`).join("")}</div>`;
      metaLine = c.label;
    }
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
      </div>` : `<div class="chips" style="margin-top:10px">
        <span class="chip is-static">${mode === "chord" ? chordData().symbol : scaleData().rootName + " · " + scaleData().label}</span>
      </div>`}
      <div class="card neck-card" style="margin-top:10px">
        ${fretboardHTML({ notes: map, interactive: true })}
      </div>
      <div class="neck-readout" id="neckReadout"><span>Нажми на точку грифа, чтобы услышать ноту</span><b></b></div>
      ${legend}
      ${mode === "chord" ? shapesBlock() : ""}
      <div style="height:10px"></div>
    `;
  }

  /* аппликатуры выбранного аккорда */
  function shapesBlock() {
    const c = chordData();
    const shapes = chordShapes(c);
    if (!shapes.length) return "";
    return `
      <div class="slabel"><span>Аппликатуры</span><span>${shapes.length} варианта</span></div>
      <div class="shapes">
        ${shapes.map((s) => {
          const base = Math.min(...s.filter((f) => f !== null)) || 0;
          return `<button class="shape" data-act="shape" data-frets="${s.map((f) => f === null ? "x" : f).join(",")}">
            ${shapeSVG(s)}
            <span class="shape-lbl">${base === 0 ? "открытая" : base + " лад"}</span>
          </button>`;
        }).join("")}
      </div>`;
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
    result: null
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

  function finishQuestion(ok) {
    train.asked += 1;
    if (ok) {
      train.correct += 1;
      train.streak += 1;
      train.best = Math.max(train.best, train.streak);
    } else {
      train.streak = 0;
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
    train.started = true;
    train.finished = false;
    train.round = 1;
    train.asked = 0;
    train.correct = 0;
    train.streak = 0;
    train.best = 0;
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
        <div class="result-verdict">${verdict}</div>
        <div class="stats inside">
          <div class="stat"><b>${train.correct}</b><span>верно</span></div>
          <div class="stat"><b>${train.asked - train.correct}</b><span>ошибок</span></div>
          <div class="stat"><b>${train.best}</b><span>лучшая серия</span></div>
        </div>
        <button class="btn-primary wide" data-act="train-again">Ещё серию ${ICON.arrow}</button>
        <button class="btn-ghost wide" data-act="train-setup">Сменить режим</button>
      </div>
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

    const tones = $(".tones");
    if (tones) tones.outerHTML = tonesHTML();

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
    centerActiveChip();
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
  let suppressClick = false;
  const drag = { active: false, id: null, startAngle: 0, startRoot: 0, lastStep: 0, moved: false };

  function wheelAngle(e) {
    const wrap = $("#wheelWrap");
    if (!wrap) return null;
    const r = wrap.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  }

  document.addEventListener("pointerdown", (e) => {
    if (state.tab !== "circle") return;
    if (!e.target.closest("#wheelWrap")) return;
    const a = wheelAngle(e);
    if (a === null) return;
    drag.active = true;
    drag.id = e.pointerId;
    drag.startAngle = a;
    drag.startRoot = state.root;
    drag.lastStep = 0;
    drag.moved = false;
    document.body.classList.add("is-dragging");
  }, { passive: true });

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
    drag.active = false;
    drag.id = null;
    drag.moved = false;
    drag.lastStep = 0;
    document.body.classList.remove("is-dragging");
    if (moved) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 80);
      if (state.sound) playCurrent();
    }
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  /* ------------------------------------------------ события */
  document.addEventListener("click", (e) => {
    if (suppressClick) { suppressClick = false; return; }
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act;

    switch (act) {
      case "tab":
        if (state.tab === el.dataset.tab) return;
        state.tab = el.dataset.tab;
        state.returnMode = null;
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

      case "back": {
        const r = state.returnMode;
        if (!r) break;
        state.mode = "scale";
        state.scale = r.scale;
        state.root = r.root;
        state.returnMode = null;
        render(false);
        break;
      }

      case "shape": {
        const frets = el.dataset.frets.split(",").map((f) => (f === "x" ? null : +f));
        const midis = frets.map((f, s) => (f === null ? null : TUNING[s] + f + 12)).filter((m) => m !== null);
        if (state.sound) strum(midis, 0.05, 1.9);
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
        train.started = false;
        train.finished = false;
        render(true);
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

  if (params.get("demo") === "summary") {
    startTrain();
    train.round = TOTAL_Q;
    train.asked = 10;
    train.correct = 8;
    train.best = 6;
    train.streak = 2;
    train.finished = true;
  }

  // для скриншотов витрины: ?demo=harmony показывает чип возврата к гамме
  if (params.get("demo") === "harmony" && state.mode === "chord") {
    state.returnMode = { scale: state.scale, root: state.root };
    state.root = (state.root + 9) % 12;
    state.chord = 1;
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
  $("#soundBtn").innerHTML = state.sound ? ICON.sound : ICON.mute;

  $("#themeBtn").addEventListener("click", () => {
    applyTheme(state.theme === "night" ? "air" : "night");
  });
})();
