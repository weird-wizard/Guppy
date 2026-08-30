// 监听浏览器下载事件，点击下载按钮，观察下载是否真正发生
const CDP_WS = "http://127.0.0.1:9222/json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageWS() {
  const list = await fetch(CDP_WS).then((r) => r.json());
  return list.find((t) => t.url.includes("gemini.google.com")).webSocketDebuggerUrl;
}

async function main() {
  const ws = new WebSocket(await getPageWS());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  const events = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
    else if (m.method && (m.method.includes("download") || m.method.includes("Download"))) {
      events.push({ method: m.method, params: m.params });
      console.log("事件:", m.method, JSON.stringify(m.params).slice(0, 200));
    }
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send("Page.enable");
  await send("Browser.setDownloadBehavior", { behavior: "allowAndName", downloadPath: "C:/Users/13737/Downloads", eventsEnabled: true });

  // 点击第一个下载按钮
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const btns = [...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
      if (btns.length === 0) return 'NONE';
      btns[0].click();
      return 'CLICKED_' + btns.length;
    })()`,
    returnByValue: true,
  });
  console.log("点击:", r.result?.value);

  await sleep(8000);
  console.log("捕获事件数:", events.length);
  if (events.length === 0) console.log("⚠️ 没有捕获到任何下载事件 - 下载可能被浏览器策略拦截");

  const fs = await import("node:fs");
  const files = fs.readdirSync("C:/Users/13737/Downloads").filter((f) => f.startsWith("Gemini"));
  console.log("Downloads 文件数:", files.length);
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
