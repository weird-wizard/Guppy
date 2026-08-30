// 用 Page.captureScreenshot 截取 Gemini 生成的图片元素（clip 到元素坐标）
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
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send("Page.enable");

  // 找到生成图片的 img，获取视口坐标
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const imgs = [...document.querySelectorAll('img')].filter(x => x.naturalWidth > 300 && x.complete);
      if (imgs.length === 0) return null;
      const img = imgs[imgs.length - 1]; // 最新的
      img.scrollIntoView({ block: 'center', inline: 'center' });
      return { count: imgs.length };
    })()`,
    returnByValue: true,
  });
  console.log("图片数:", JSON.stringify(r.result?.value));
  await sleep(1000);

  const r2 = await send("Runtime.evaluate", {
    expression: `(() => {
      const imgs = [...document.querySelectorAll('img')].filter(x => x.naturalWidth > 300 && x.complete);
      const img = imgs[imgs.length - 1];
      const rect = img.getBoundingClientRect();
      return {
        x: rect.x, y: rect.y, w: rect.width, h: rect.height,
        nw: img.naturalWidth, nh: img.naturalHeight,
        src: img.src.slice(0, 50),
      };
    })()`,
    returnByValue: true,
  });
  const b = r2.result?.value;
  console.log("元素位置:", JSON.stringify(b));

  // 用 device scale 2 截图（高分辨率）
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 2 },
    captureBeyondViewport: true,
  });
  const fs = await import("node:fs");
  const fname = `C:/Users/13737/Downloads/shot-${b.nw}x${b.nh}.png`;
  fs.writeFileSync(fname, Buffer.from(shot.data, "base64"));
  console.log(`✅ 已保存 ${fname}`);

  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
