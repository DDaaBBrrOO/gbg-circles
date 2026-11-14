/* Скачивает шрифты Google Fonts в assets/fonts и собирает локальный fonts.css,
   чтобы приложение работало без интернета (в APK шрифты лежат внутри). */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT_DIR = path.join(__dirname, "..", "assets", "fonts");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FAMILIES = [
  { css: "Unbounded:wght@200..900", slug: "unbounded" },
  { css: "Manrope:wght@200..800", slug: "manrope" },
  { css: "JetBrains+Mono:wght@100..800", slug: "jetbrains-mono" },
  { css: "Playfair+Display:ital,wght@0,400..900;1,400..900", slug: "playfair" },
];

// оставляем только кириллицу и латиницу — этого хватает интерфейсу
const KEEP = [/U\+0400/, /U\+0000-00FF/];

function subsetsOf(block) {
  const m = block.match(/unicode-range:\s*([^;}]+)/);
  if (!m) return true;
  return KEEP.some((re) => re.test(m[1]));
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const faces = [];

  for (const fam of FAMILIES) {
    const url = `https://fonts.googleapis.com/css2?family=${fam.css}&display=swap`;
    const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
    const blocks = css.match(/@font-face\s*{[^}]+}/g) || [];

    for (const block of blocks) {
      if (!subsetsOf(block)) continue;

      const src = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
      if (!src) continue;

      const range = block.match(/unicode-range:\s*([^;}]+)/)?.[1].trim() || "";
      const weight = block.match(/font-weight:\s*([^;}]+)/)?.[1].trim() || "400";
      const style = block.match(/font-style:\s*([^;}]+)/)?.[1].trim() || "normal";
      const cyr = /U\+0400/.test(range);
      const name = `${fam.slug}-${cyr ? "cyr" : "lat"}${style === "italic" ? "-italic" : ""}.woff2`;

      if (!faces.some((f) => f.name === name)) {
        const buf = Buffer.from(await (await fetch(src[1], { headers: { "User-Agent": UA } })).arrayBuffer());
        fs.writeFileSync(path.join(OUT_DIR, name), buf);
        console.log("saved", name, (buf.length / 1024).toFixed(1) + " KB");
      }

      faces.push({ name, weight, style, range, family: fam.slug });
    }
  }

  // один @font-face на семейство+подмножество, с диапазоном весов (variable font)
  const groups = new Map();
  for (const f of faces) {
    const key = `${f.family}|${f.name}|${f.style}`;
    const g = groups.get(key);
    if (!g) groups.set(key, { ...f, weights: new Set([f.weight]) });
    else g.weights.add(f.weight);
  }

  const display = {
    unbounded: "Unbounded",
    manrope: "Manrope",
    "jetbrains-mono": "JetBrains Mono",
    playfair: "Playfair Display",
  };

  const css = [...groups.values()]
    .map((f) => {
      const w = [...f.weights].sort().join(" ");
      return `@font-face {
  font-family: "${display[f.family]}";
  font-style: ${f.style};
  font-weight: ${w};
  font-display: swap;
  src: url("${f.name}") format("woff2");
  unicode-range: ${f.range};
}`;
    })
    .join("\n\n");

  fs.writeFileSync(path.join(OUT_DIR, "fonts.css"), css + "\n");
  console.log("\nfonts.css:", groups.size, "faces");
})();
