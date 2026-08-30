// 通过 CDP 测试下载行为：设置下载目录后点击下载按钮
// 用法: node test-download.mjs
const CDP_WS = "http://127.0.0.1:9222/json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDPSession {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); } }, 30000);
    });
  }
  onMessage(msg) {
    const m = JSON.parse(msg);
    if (m.id && this.pending.has(m.id)) {
      const p = this.pending.get(m.id); this.pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
  }
}

async function getPageWS() {
  const list = await fetch(CDP_WS).then((r) => r.json());
  const gemini = list.find((t) => t.url.includes("gemini.google.com"));
  if (!gemini) throw new Error("未找到 Gemini 标签页");
  return gemini.webSocketDebuggerUrl;
}

async function main() {
  const pageWS = await getPageWS();
  const ws = new WebSocket(pageWS);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  const cdp = new CDPSession(ws);
  ws.onmessage = (e) => cdp.onMessage(e.data);
  console.log("✅ 已连接");

  // 1. 启用 Page 域并设置下载行为 - 直接下载到 Downloads 目录，不弹窗
  await cdp.send("Page.enable");
  await cdp.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: "C:/Users/13737/Downloads",
    eventsEnabled: true,
  });
  console.log("✅ 下载行为已设置: allow → Downloads");

  // 2. 找到第一个下载按钮并点击
  const r = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const btns = [...document.querySelectorAll('button')];
      const dl = btns.find(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
      if (!dl) return 'NO_DL_BTN';
      dl.click();
      return 'CLICKED';
    })()`,
    returnByValue: true,
  });
  console.log("点击结果:", r.result?.value);

  // 3. 等待并检查下载
  await sleep(5000);
  const fs = await import("node:fs");
  const files = fs.readdirSync("C:/Users/13737/Downloads").filter((f) => f.startsWith("Gemini_Generated_Image"));
  console.log("Downloads 中 Gemini 图片:", files.length);
  if (files.length > 0) {
    const newest = files.map((f) => ({ f, t: fs.statSync("C:/Users/13737/Downloads/" + f).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    console.log("最新:", newest.f, new Date(newest.t).toLocaleTimeString());
  }
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
