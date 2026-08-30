// 图片就绪验证脚本：检查 24 个品种的图片是否全部就位
// 用法: node scripts/verify-images.mjs
// 输出: 每个品种的图片状态（✅有图 / ❌缺图），以及总览
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const breedsDir = path.join(__dirname, "..", "src", "content", "breeds");
const imagesDir = path.join(breedsDir, "images");

// 读取所有品种 MDX，提取 slug
const mdxFiles = fs.readdirSync(breedsDir).filter((f) => f.endsWith(".mdx"));
const breeds = mdxFiles
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort();

// 读取已存在的图片
const existingImages = new Set(
  fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    : []
);

console.log("=== 孔雀鱼品种图片就绪检查 ===\n");
console.log(`品种总数: ${breeds.length}`);
console.log(`图片目录: ${imagesDir}\n`);

let ok = 0, missing = 0;
for (const breed of breeds) {
  const expected = `${breed}.jpg`;
  const has = existingImages.has(expected);
  if (has) {
    ok++;
    console.log(`✅ ${breed}.mdx -> ${expected}`);
  } else {
    missing++;
    console.log(`❌ ${breed}.mdx -> 缺 ${expected}`);
  }
}

console.log(`\n=== 结果: ${ok} 张就位, ${missing} 张缺失 ===`);

// 额外检查: images 目录里是否有不属于任何品种的孤儿图片
const orphans = [...existingImages].filter(
  (img) => !breeds.some((b) => img === `${b}.jpg`)
);
if (orphans.length > 0) {
  console.log(`\n⚠️ 孤儿图片（不在品种清单中）: ${orphans.join(", ")}`);
}
