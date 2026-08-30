// 方案B：不从"下载按钮"下载，而是直接从页面 DOM 里提取生成的图片数据
// Gemini 生成的图片在 DOM 中是 <img>，可以通过 CDP 抓取二进制
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

  // 1. 查找页面里所有生成图片的 <img> 元素
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const imgs = [...document.querySelectorAll('img')];
      return imgs.map((img, i) => ({
        i,
        src: img.src.slice(0, 120),
        w: img.naturalWidth,
        h: img.naturalHeight,
        alt: img.alt?.slice(0, 50) || '',
        visible: !!img.offsetParent,
        complete: img.complete,
      })).filter(x => x.w > 300);
    })()`,
    returnByValue: true,
  });
  const imgs = r.result?.value || [];
  console.log("大图 <img> 元素:");
  imgs.forEach((x) => console.log(`  [${x.i}] ${x.w}x${x.h} visible=${x.visible} complete=${x.complete} src=${x.src}`));

  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
