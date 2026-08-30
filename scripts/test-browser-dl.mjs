// 诊断：Chrome 下载功能本身是否工作（下载一个测试文件）
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
      events.push({ method: m.method, params: m.params });
      console.log("📥 下载事件:", m.method, JSON.stringify(m.params).slice(0, 150));
    }
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send("Page.enable");
  await send("Browser.setDownloadBehavior", { behavior: "allowAndName", downloadPath: "C:/Users/13737/Downloads", eventsEnabled: true });

  // 在新标签页打开一个直接下载的 URL（测试文件）
  const r = await send("Target.createTarget", { url: "https://www.w3.org/TR/PNG/iso_8859-1.txt" });
  const targetId = r.targetId;
  console.log("测试下载目标已创建:", targetId);

  // 等待下载
  await sleep(10000);
  console.log("捕获下载事件数:", events.length);

  const fs = await import("node:fs");
  const files = fs.readdirSync("C:/Users/13737/Downloads").filter((f) => f.toLowerCase().includes("iso") || f.includes("w3"));
  console.log("下载目录匹配文件:", files.length, files.join(", "));

  // 关闭测试标签
  await send("Target.closeTarget", { targetId });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
