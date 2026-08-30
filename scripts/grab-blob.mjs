// 抓取页面中所有 blob: 图片，保存为文件
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

  // 提取所有 blob 图片的 base64
  const r = await send("Runtime.evaluate", {
    expression: `(async () => {
      const imgs = [...document.querySelectorAll('img')].filter(x => x.naturalWidth > 300);
      const results = [];
      for (const img of imgs) {
        try {
          if (img.src.startsWith('blob:')) {
            const resp = await fetch(img.src);
            const buf = await resp.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let bin = '';
            for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
            results.push({
              w: img.naturalWidth, h: img.naturalHeight,
              base64: btoa(bin),
              mime: resp.headers.get('content-type') || 'image/png',
            });
          }
        } catch (e) { results.push({ error: e.message }); }
      }
      return results;
    })()`,
    returnByValue: true,
    awaitPromise: true,
  });
  const results = r.result?.value || [];
  console.log("抓取结果数:", results.length);
  results.forEach((x, i) => {
    if (x.base64) {
      const fs = require("node:fs");
      const ext = x.mime.includes("jpeg") ? "jpg" : "png";
      const fname = `C:/Users/13737/Downloads/captured-${i}-${x.w}x${x.h}.${ext}`;
      fs.writeFileSync(fname, Buffer.from(x.base64, "base64"));
      console.log(`  ✅ 已保存 ${fname} (${x.w}x${x.h}, ${Math.round(x.base64.length * 0.75 / 1024)}KB)`);
    } else {
      console.log(`  ❌ [${i}] 失败: ${x.error || '无base64'}`);
    }
  });

  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
