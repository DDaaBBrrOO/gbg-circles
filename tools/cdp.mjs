// Оценивает JS в WebView приложения на телефоне (USB).
// Использование: node tools/cdp.mjs "выражение" [порт]
// Перед запуском нужен adb forward tcp:<порт> localabstract:webview_devtools_remote_<pid>
const port = process.argv[3] || "9333";
const expr = process.argv[2] || "JSON.stringify(window.__lad && window.__lad())";

const res = await fetch(`http://127.0.0.1:${port}/json`);
const pages = await res.json();
const page = pages.find((p) => (p.url || "").includes("app.html")) || pages[0];
if (!page) {
  console.error("no page");
  process.exit(2);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
const done = new Promise((resolve) => {
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id !== 1) return;
    const r = m.result && m.result.result;
    resolve(r && "value" in r ? r.value : JSON.stringify(r));
  };
});
ws.onopen = () => {
  ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, returnByValue: true, awaitPromise: true } }));
};
const out = await Promise.race([done, new Promise((r) => setTimeout(() => r("timeout"), 5000))]);
console.log(typeof out === "string" ? out : JSON.stringify(out));
ws.close();
