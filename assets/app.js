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

    // струны
    for (let k = 0; k < 6; k++) {
      const x = X0 + k * SX;
      const thick = k === 0 ? " thick" : "";
      out.push(`<line class="fb-string${thick}" x1="${x}" y1="${Y0 - 4}" x2="${x}" y2="${BOT + 6}"/>`);
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
        const midiBase = TUNING[5 - s];
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
        out.push(`<rect class="fb-hit" data-act="fret" data-string="${5 - s}" data-fret="0" x="${(x + 2).toFixed(2)}" y="${Y0 - 38}" width="${SX - 4}" height="38"/>`);
        for (let f = 1; f <= 12; f++) {
          out.push(`<rect class="fb-hit" data-act="fret" data-string="${5 - s}" data-fret="${f}" x="${(x + 2).toFixed(2)}" y="${(Y0 + (f - 1) * FY).toFixed(2)}" width="${SX - 4}" height="${FY}"/>`);
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
    { n: "01", name: "Интервалы", count: "12 · от примы до октавы", tab: "circle", mode: "interval", glyph: SVG('<circle cx="8" cy="17" r="3"/><circle cx="16" cy="7" r="3"/><path d="M10.4 15.2c1.8-2.6 3.4-4.5 4.6-5.6"/>', 26) },
    { n: "02", name: "Аккорды", count: "12 · трезвучия и септы", tab: "circle", mode: "chord", glyph: SVG('<path d="M12 4.5 20.2 19H3.8L12 4.5Z"/><circle cx="12" cy="4.5" r="1.9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="19" r="1.9" fill="currentColor" stroke="none"/><circle cx="3.8" cy="19" r="1.9" fill="currentColor" stroke="none"/>', 26) },
    { n: "03", name: "Гаммы", count: "12 · лады и пентатоники", tab: "circle", mode: "scale", glyph: SVG('<path d="M4 20v-5M9.3 20V9M14.6 20v-7M20 20V4"/>', 26) },
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
          <h1>Привет, Аня<span class="dot-accent">.</span></h1>
        </div>
      </div>
      <p class="lead">Ещё четыре урока — и модуль «Трезвучия» закрыт.</p>

      <div class="card hero">
        <div class="hero-top">
          <span class="kicker">Модуль 02 · аккорды</span>
          <span class="mono">68%</span>
        </div>
        <div class="hero-title">Мажорные трезвучия</div>
        <div class="bar"><i style="width:68%"></i></div>
        <div class="hero-foot">
          <span>Урок 4 из 12 · 6 мин</span>
          <button class="btn-sm" data-act="go" data-tab="circle" data-mode="chord">Продолжить</button>
        </div>
      </div>

      <div class="slabel"><span>Модули</span><span>4 из 4</span></div>
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
      <div style="height:6px"></div>
    `;
  }

  function circleScreen() {
    const ctx = activeContext();
    const seg = `
      <div class="seg" role="tablist">
        <button data-act="mode" data-mode="interval" class="${state.mode === "interval" ? "on" : ""}">Интервалы</button>
        <button data-act="mode" data-mode="chord" class="${state.mode === "chord" ? "on" : ""}">Аккорды</button>
        <button data-act="mode" data-mode="scale" class="${state.mode === "scale" ? "on" : ""}">Гаммы</button>
      </div>`;

    const meta = state.mode === "chord" ? `${ctx.notes.length} нот${ctx.notes.length > 4 ? "" : "ы"}<br>тон: ${ROOT_NAMES[state.root]}`
      : state.mode === "scale" ? `${ctx.notes.length} ступеней<br>${scaleData().sub}`
      : `${intervalData().semi} полутонов<br>${intervalData().feel}`;

    return `
      <div class="shead">
        <div>
          <div class="kicker">12 нот · 12 часов</div>
          <h1>Круг</h1>
        </div>
        <div class="meta">${meta}</div>
      </div>
      ${seg}
      <div class="wheel-wrap">
        ${wheelHTML()}
        <div class="wheel-center">${wheelCenterHTML()}</div>
      </div>
      <div class="tones">
        ${ctx.notes.map((n, i) => `<button class="tone is-${i + 1}" data-act="tone" data-midi="${n.midi}"><b>${n.name}</b><small>${n.deg}</small></button>`).join("")}
      </div>
      <div class="play-row">
        <button class="btn-primary" data-act="play">${ICON.play}<span>${state.mode === "chord" ? "Слушать аккорд" : state.mode === "scale" ? "Слушать гамму" : "Слушать интервал"}</span></button>
        <button class="btn-square ${state.arp ? "on" : ""}" data-act="arp" aria-label="Арпеджио по нотам" title="Арпеджио">${ICON.arp}</button>
      </div>
      <div class="controls card">
        ${state.mode === "interval" ? intervalControls() : state.mode === "scale" ? scaleControls() : chordControls()}
      </div>
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
      <div style="height:10px"></div>
    `;
  }

  /* одна струна, 13 ладов — компактный ответ вместо целого грифа */
  function stringStripHTML({ stringIdx, revealPc = null, chosen = null }) {
    const W = 340, H = 92;
    const X0 = 6, X1 = W - 6, N = 13;
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

  function trainScreen() {
    if (!state.quiz) newQuestion(true);
    const q = state.quiz;
    const targetName = ROOT_NAMES[q.pc];
    const stringNo = 6 - q.str;
    const answered = q.chosen !== null;
    const accuracy = q.asked ? Math.round((q.correct / q.asked) * 100) : 100;

    const fb = answered
      ? `<div class="fb-text ${q.ok ? "ok" : "no"}">${q.ok ? ICON.check : ICON.close}<span>${q.ok ? "Верно — " + targetName + " именно здесь." : "Мимо: " + targetName + " на " + q.diffForString + "."}</span></div>`
      : `<div class="fb-text" style="color:var(--ink-3)">Нажми на лад, где живёт эта нота</div>`;

    return `
      <div class="shead">
        <div>
          <div class="kicker">Найди ноту на грифе</div>
          <h1>Тренажёр</h1>
        </div>
        <div class="meta">серия ${q.streak}<br>вопрос ${q.round}</div>
      </div>
      <div class="stats">
        <div class="stat"><b>${accuracy}%</b><span>точность</span></div>
        <div class="stat"><b>${q.correct}</b><span>верно</span></div>
        <div class="stat"><b>${q.best}</b><span>лучшая серия</span></div>
      </div>
      <div class="card quiz-card">
        <div class="kicker">Вопрос ${q.round} · ${["E", "A", "D", "G", "B", "e"][q.str]}</div>
        <div class="quiz-q">Где нота <em>${targetName}</em><br>на ${stringNo}-й струне?</div>
        ${stringStripHTML({ stringIdx: q.str, revealPc: answered ? q.pc : null, chosen: answered ? q.chosen : null })}
        <div class="quiz-fb">
          ${fb}
          ${answered ? `<button class="btn-sm" data-act="next">Дальше ${ICON.arrow}</button>` : ""}
        </div>
      </div>
      <div class="card tip">
        <span class="num">5</span>
        <p><b>Строй гитары — E A D G B E.</b> Квинты между струнами (кроме G–B) дают одинаковые рисунки аккордов по всему грифу.</p>
      </div>
      <div style="height:6px"></div>
    `;
  }

  function newQuestion(silent = false) {
    const prev = state.quiz || { asked: 0, correct: 0, streak: 0, best: 0, round: 0 };
    let pc, str;
    do {
      pc = Math.floor(Math.random() * 12);
      str = Math.floor(Math.random() * 6);
    } while (prev.pc === pc && prev.str === str);
    const diff = ((pc - (TUNING[str] % 12)) % 12 + 12) % 12;
    state.quiz = {
      pc, str,
      asked: prev.asked,
      correct: prev.correct,
      streak: prev.streak,
      best: prev.best,
      round: prev.round + 1,
      chosen: null,
      ok: null,
      diffForString: diff === 0 ? "открытой струне" : diff + "-м ладу"
    };
  }

  /* ------------------------------------------------ экраны-таблицы */
  const screens = { home: homeScreen, circle: circleScreen, neck: neckScreen, train: trainScreen };

  /* ------------------------------------------------ рендер */
  const app = $("#app");
  const screenEl = $("#screen");

  function render(keepScroll = true) {
    const top = keepScroll ? screenEl.scrollTop : 0;
    screenEl.innerHTML = screens[state.tab]();
    screenEl.scrollTop = top;
    screenEl.classList.remove("screen-enter");
    void screenEl.offsetWidth;
    screenEl.classList.add("screen-enter");
    $$(".tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
    $("#soundBtn").innerHTML = state.sound ? ICON.sound : ICON.mute;
    $("#soundBtn").classList.toggle("is-muted", !state.sound);
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

  /* ------------------------------------------------ события */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act;

    switch (act) {
      case "tab":
        if (state.tab === el.dataset.tab) return;
        state.tab = el.dataset.tab;
        if (state.tab === "train" && !state.quiz) newQuestion();
        render(false);
        break;

      case "go":
        state.tab = el.dataset.tab || "circle";
        if (el.dataset.mode) {
          if (el.dataset.mode === "notes") {
            state.tab = "neck";
            state.neckMode = "notes";
          } else {
            state.mode = el.dataset.mode;
            if (state.tab === "neck") state.neckMode = el.dataset.mode;
          }
        }
        if (state.tab === "train" && !state.quiz) newQuestion();
        render(false);
        break;

      case "mode":
        state.mode = el.dataset.mode;
        state.inv = 0;
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

      case "fret": {
        if (state.tab !== "train") {
          const pcs = (state.neckMode === "scale" ? scaleData().notes : chordData().notes).map((n) => n.pc);
          const name = ROOT_NAMES[(TUNING[+el.dataset.string] + +el.dataset.fret) % 12];
          const ro = $("#neckReadout");
          if (ro) ro.innerHTML = `<span>${+el.dataset.string + 1}-я струна · ${el.dataset.fret} лад</span><b>${name}</b>`;
          pluck(TUNING[+el.dataset.string] + +el.dataset.fret, undefined, 1.2, 0.15);
          break;
        }
        const q = state.quiz;
        if (!q || q.chosen !== null) return;
        const fret = +el.dataset.fret;
        const pc = (TUNING[q.str] + fret) % 12;
        q.chosen = fret;
        q.asked += 1;
        q.ok = pc === q.pc;
        if (q.ok) {
          q.correct += 1;
          q.streak += 1;
          q.best = Math.max(q.best, q.streak);
          pluck(TUNING[q.str] + fret, undefined, 1.4, 0.16);
        } else {
          q.streak = 0;
          buzz();
        }
        render(true);
        break;
      }

      case "next":
        newQuestion();
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

  /* ------------------------------------------------ запуск */
  const theme = params.get("theme") || "air";
  app.dataset.theme = theme;
  document.body.dataset.theme = theme;

  if (state.tab === "train") newQuestion(true);

  // демонстрация ответа для витрины дизайна
  if (params.get("demo") === "answered" && state.quiz && state.quiz.chosen === null) {
    const q = state.quiz;
    const diff = ((q.pc - (TUNING[q.str] % 12)) % 12 + 12) % 12;
    q.chosen = diff;
    q.ok = true;
    q.asked = 1;
    q.correct = 1;
    q.streak = 1;
    q.best = 1;
  }

  render(false);

  // корректная иконка звука при первом рендере
  $("#soundBtn").innerHTML = state.sound ? ICON.sound : ICON.mute;
})();
