// 批量生成孔雀鱼图片：通过 CDP 直接驱动 Chrome（无需 playwright 库）
// 用法: node gemini-batch.mjs
// 前置: Chrome 已开 --remote-debugging-port=9222，已登录 Gemini，tab 0 = 新对话页面

const PROMPTS = [
  { slug: "moscow-blue", prompt: "Moscow Blue guppy, entire body covered in deep metallic blue iridescence including the head, deep sapphire blue with subtle violet sheen, large triangular tail fin, glowing blue metal reflection, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "moscow-green", prompt: "Moscow Green guppy, metallic emerald green body with blue-green iridescence, head covered in metal green sheen, slight neon glow effect, large triangular tail, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "panda-moscow", prompt: "Panda Moscow guppy, front half of body silver white, rear half deep blue-black, panda-like coloring, clear color boundary line, round tail fin, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "blue-grass", prompt: "Blue Grass guppy, wide tail fin covered in fine black round spots, blue body with black diamond patches, spots not connected, delicate peppered tail, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "red-grass", prompt: "Red Grass guppy, vivid red body, wide tail fin covered in fine black round spots, red and black contrast, delicate peppered pattern, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "full-red", prompt: "Full Red guppy, entire body and all fins uniformly deep crimson red, no other colors, solid red from head to tail, elegant triangular tail, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "red-cap-albino", prompt: "Red Albino guppy, red eyes, albino body with translucent red coloration, soft semi-transparent crimson glow, white-pink body with red fins, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "hongyun-head", prompt: "Red Cap guppy, bright red head, milky white body, red tail fin, red top white body coloring, auspicious look, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "blue-white-tuxedo", prompt: "Blue Tail Tuxedo Albino guppy, sky blue tail fin, dark tuxedo band on rear body, albino body with red eyes, clean solid blue tail, elegant, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "german-yellow-tuxedo", prompt: "German Yellow Tuxedo guppy, dark tuxedo band on rear half of body, clean solid yellow tail fin, no spots on tail, elegant simple coloring, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "red-mosaic", prompt: "Red Mosaic guppy, red tail with bold black mosaic patterns, ring and lightning shaped markings, dark blue patch at tail base, bold graphic pattern, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "blue-snakeskin", prompt: "Blue King Cobra guppy, snakeskin pattern all over body, blue-green metallic sheen, snake-like scale pattern, medium bold markings, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "yellow-lace", prompt: "Yellow Lace guppy, yellow body with fine delicate lace filigree pattern, intricate connected mesh markings more refined than snakeskin, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "metal-snakeskin", prompt: "Metal Snakeskin guppy, metallic blue patch on front half of body, snakeskin pattern on rear half, metal head effect, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "japan-blue-double-sword", prompt: "Japan Blue Double Sword guppy, bright blue reflective patch at tail base, double sword tail with upper and lower elongated fin rays, sharp sword extensions, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "japan-blue-snakeskin", prompt: "Japan Blue Snakeskin guppy, bright blue reflective patch at tail base, snakeskin pattern body, blue metallic spot, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "leopard-moscow", prompt: "Leopard Moscow guppy, dark metallic Moscow base color with fine leopard spots, deep blue-black background with small round spots, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "platinum-tuxedo", prompt: "Platinum Tuxedo guppy, silvery white reflective scales covering body, platinum sheen, tuxedo body structure with clean tail, metallic white glow, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "coral-double-sword", prompt: "Coral Double Sword guppy, long red coral patch along body side, double sword tail, red stripe marking, larger body size, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "galaxy-red-tail", prompt: "Galaxy Red Tail guppy, bold snakeskin pattern with platinum white patches, red tail fin, galaxy starry effect, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "medusa", prompt: "Medusa guppy, combination of metal sheen lace pattern and platinum, tail fin with three segments orange-red transparent and lace pattern, mythical look, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "santa-maria-snakeskin", prompt: "Santa Maria Snakeskin guppy, black patch on upper front half of body, snakeskin pattern, black and light contrast, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "martelly-yellow-tuxedo", prompt: "Martelly Yellow Tuxedo guppy, heavy rich yellow body color block, tuxedo structure, intense yellow pigment, clean tail, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
  { slug: "old-fashion-mosaic", prompt: "Old Fashion Mosaic guppy, blurry soft mosaic pattern on tail, subdued snake markings on body, vintage look, muted colors, deep navy blue gradient background, subtle blurred aquarium plants, professional fish showcase photography, side view, 4:3 composition" },
];

const CDP_WS = "ws://127.0.0.1:9222/devtools/browser";
const DOWNLOAD_DIR = "C:/Users/13737/Downloads";
const OUTPUT_DIR = "E:/project/fish/src/content/breeds";

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
  const list = await fetch("http://127.0.0.1:9222/json").then((r) => r.json());
  const gemini = list.find((t) => t.url.includes("gemini.google.com"));
  if (!gemini) throw new Error("未找到 Gemini 标签页");
  return gemini.webSocketDebuggerUrl;
}

async function evaluate(cdp, expression) {
  const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("JS 异常: " + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result?.value;
}

// 在页面上下文中运行的辅助函数（通过 CDP 注入）
const PAGE_HELPERS = `
  window.__guppy = {
    inputBox() { return document.querySelector('rich-textarea .ql-editor, rich-textarea[contenteditable="true"], .ql-editor'); },
    sendBtn() {
      const btns = [...document.querySelectorAll('button')];
      return btns.find(b => b.getAttribute('aria-label') === '发送消息' || (b.closest('div') && b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('发送')));
    },
    downloadBtn() {
      const btns = [...document.querySelectorAll('button')];
      return btns.find(b => (b.getAttribute('aria-label') || '').includes('下载完整尺寸'));
    },
    creatingImage() { return document.body.innerText.includes('Creating your image'); },
  };
`;

async function waitForDownloadBtn(cdp, timeoutMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const has = await evaluate(cdp, `!!window.__guppy.downloadBtn()`);
    if (has) return true;
    await sleep(5000);
  }
  return false;
}

async function main() {
  // 1. 连接浏览器
  const pageWS = await getPageWS();
  const ws = new WebSocket(pageWS);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  const cdp = new CDPSession(ws);
  ws.onmessage = (e) => cdp.onMessage(e.data);
  console.log("✅ 已连接 Gemini 页面");

  // 2. 注入辅助函数
  await evaluate(cdp, PAGE_HELPERS);
  console.log("✅ 辅助函数已注入");

  // 可选：从指定索引开始（调试用）
  const startIndex = process.env.START_INDEX ? parseInt(process.env.START_INDEX, 10) : 0;

  // 3. 检查当前是否在图片模式
  const inImageMode = await evaluate(cdp, `!!document.querySelector('.ql-editor') && document.body.innerText.includes('生成图片')`);
  console.log(`图片模式: ${inImageMode ? "是" : "否（需要先手动启用）"}`);

  // 4. 逐张生成
  const fs = await import("node:fs");
  for (let i = startIndex; i < PROMPTS.length; i++) {
    const { slug, prompt } = PROMPTS[i];
    console.log(`\n[${i + 1}/${PROMPTS.length}] 生成 ${slug}...`);

    // 聚焦输入框并输入
    const typed = await evaluate(cdp, `(async () => {
      const box = window.__guppy.inputBox();
      if (!box) return 'NO_INPUT';
      box.focus();
      document.execCommand('insertText', false, ${JSON.stringify(prompt)});
      return 'OK';
    })()`);
    if (typed !== "OK") { console.log(`  输入框定位失败: ${typed}`); break; }
    await sleep(500);

    // 发送（回车）
    await evaluate(cdp, `(async () => {
      const box = window.__guppy.inputBox();
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      box.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      return 'OK';
    })()`);
    console.log("  已发送，等待生成...");

    // 等待下载按钮出现
    const ready = await waitForDownloadBtn(cdp, 240000);
    if (!ready) { console.log(`  ⚠️ ${slug} 生成超时（240s），继续下一个`); continue; }
    await sleep(3000);

    // 点击下载
    await evaluate(cdp, `(async () => { const b = window.__guppy.downloadBtn(); if (b) b.click(); return 'OK'; })()`);
    console.log("  已点击下载，等待文件落盘...");

    // 等待下载完成（Downloads 目录出现新文件）
    const dlStart = Date.now();
    let downloaded = false;
    while (Date.now() - dlStart < 30000) {
      await sleep(3000);
      const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith("Gemini_Generated_Image"));
      if (files.length > 0) {
        const newest = files.map((f) => ({ f, t: fs.statSync(DOWNLOAD_DIR + "/" + f).mtimeMs }))
          .sort((a, b) => b.t - a.t)[0];
        if (Date.now() - newest.t < 15000) {
          downloaded = true;
          break;
        }
      }
    }
    if (!downloaded) { console.log(`  ⚠️ ${slug} 下载检测超时`); continue; }
    console.log(`  ✅ ${slug} 生成并下载完成`);
    await sleep(2000);
  }

  console.log("\n🎉 批量生成流程结束");
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
