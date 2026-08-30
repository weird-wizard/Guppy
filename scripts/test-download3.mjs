// 用 CDP Input 域模拟真实鼠标点击（物理坐标级），解决 .click() 不生效问题
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
    else if (m.method && m.method.toLowerCase().includes("download")) {
      events.push(m.method);
      console.log("下载事件:", m.method);
    }
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send("Page.enable");
  await send("Browser.setDownloadBehavior", { behavior: "allowAndName", downloadPath: "C:/Users/13737/Downloads", eventsEnabled: true });

  // 获取下载按钮的真实坐标
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const btns = [...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
      if (btns.length === 0) return null;
      const b = btns[0];
      const rect = b.getBoundingClientRect();
      b.scrollIntoView({ block: 'center' });
      // 需要重新获取 rect（滚动后位置变化）
      setTimeout(() => {}, 0);
      return { x: rect.x, y: rect.y, w: rect.width, h: rect.height, count: btns.length };
    })()`,
    returnByValue: true,
  });
  const info = r.result?.value;
  console.log("按钮信息:", JSON.stringify(info));
  if (!info) { console.log("无按钮"); ws.close(); process.exit(1); }

  // 滚动后重新计算坐标
  await sleep(800);
  const r2 = await send("Runtime.evaluate", {
    expression: `(() => {
      const btns = [...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
      const b = btns[0];
      const rect = b.getBoundingClientRect();
      return { cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 };
    })()`,
    returnByValue: true,
  });
  const { cx, cy } = r2.result?.value;
  console.log(`点击坐标: (${cx}, ${cy})`);

  // 真实鼠标事件序列
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cx, y: cy });
  await sleep(200);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, button: "left", clickCount: 1 });
  await sleep(200);
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cx, y: cy, button: "left", clickCount: 1 });
  console.log("已发送真实鼠标点击");

  await sleep(8000);
  console.log("下载事件数:", events.length);

  const fs = await import("node:fs");
  const files = fs.readdirSync("C:/Users/13737/Downloads").filter((f) => f.startsWith("Gemini"));
  console.log("Downloads 文件:", files.length);
  if (files.length > 0) {
    const newest = files.map((f) => ({ f, t: fs.statSync("C:/Users/13737/Downloads/" + f).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    console.log("最新:", newest.f, new Date(newest.t).toLocaleTimeString());
  }
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
