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
        title: `Постройте гамму <em>${ROOT_NAMES[root]}</em>`, sub: sc.sub
      };
      return;
    }

    const ch = randOf(chordPool());
    const target = uniqPc(chordNotesOf(root, ch));
    train.q = mode === "chordNotes"
      ? { kind: "set", root, ch, target, title: `Отметьте ноты аккорда <em>${ROOT_NAMES[root]}${ch.sym}</em>`, sub: "только его ноты" }
      : { kind: "set", root, ch, target, title: `Постройте аккорд от <em>${ROOT_NAMES[root]}</em>`, sub: ch.notes.map((n) => n[2]).join(" · ") };
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
      <div class="pad-count">отмечено ${picked.length} · осталось ${Math.max(left, 0)}</div>`;
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
      body = stringStripHTML({ stringIdx: q.str, revealPc: answered ? q.pc : null, chosen: answered ? train.picked[0] : null });
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
            const label = isInt ? `${o.short} · ${o.name.toLowerCase()}` : `${ROOT_NAMES[q.root]}${o.sym} · ${o.label.toLowerCase()}`;
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
      <div style="height:6px"></div>
    `;
  }

  function trainScreen() {
    if (!train.started) return trainSetupScreen();
    if (train.finished) return trainSummaryScreen();
    return trainQuestionScreen();
  }

