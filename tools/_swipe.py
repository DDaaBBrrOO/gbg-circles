import io

p = r"C:\projects\chords\assets\app.js"
s = io.open(p, encoding="utf-8").read()

start = s.index("  let neckSwipe = null;")
end = s.index("  /* ------------------------------------------------ события */")

new = '''  // горизонтальный свайп — в тех же зонах, где страница листается вертикально
  let swipe = null;

  function swipeZone(target) {
    if (target.closest(".wheel-wrap, .chips, .pad, input, textarea, select")) return null;
    if (state.tab === "circle") return "mode";
    if (state.tab === "neck" && state.neckMode !== "notes" && state.neckLabels !== "shape") return "labels";
    return null;
  }

  function flipNeckStyle(dir) {
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
    suppressClick = true;
    if (zone === "mode") {
      if (switchModeBy(dx < 0 ? 1 : -1)) { render(true); animateWheel(dx < 0 ? 1 : -1); }
    } else if (cycleNeckLabels(dx)) {
      render(true);
      flipNeckStyle(dx < 0 ? 1 : -1);
    }
  });
  document.addEventListener("pointerup", () => { swipe = null; });
  document.addEventListener("pointercancel", () => { swipe = null; });

'''

s = s[:start] + new + s[end:]
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
