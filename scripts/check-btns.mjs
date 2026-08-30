const CDP_WS = "http://127.0.0.1:9222/json";
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
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const btns = [...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
      return btns.map((b, i) => ({ i, visible: !!(b.offsetParent), aria: b.getAttribute('aria-label'), disabled: b.disabled }));
    })()`,
    returnByValue: true,
  });
  console.log(JSON.stringify(r.result?.value, null, 2));
  ws.close(); process.exit(0);
}
main();
