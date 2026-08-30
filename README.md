# 🐟 孔雀鱼知识百科

面向爱好者的孔雀鱼（*Poecilia reticulata* / 孔雀花鳉）中文知识百科网站。

## 栏目

| 栏目 | 路由 | 内容 |
|---|---|---|
| 品种图鉴 | `/breeds/` | 17 大品系 × 16 个代表品种，支持按颜色/鳍型/难度组合筛选 |
| 饲养指南 | `/guide/` | 开缸养水、水质管理等系统性饲养知识 |
| 繁殖技术 | `/breeding/` | 孕期管理、小鱼护理、品系提纯选育 |
| 疾病防治 | `/disease/` | 9 种常见病速查、用药指南、检疫预防 |
| 站内搜索 | 导航栏"搜索" | Pagefind 全文搜索（构建期索引） |

## 技术栈

- **Astro 7.2**（内容驱动静态站点）+ Content Layer API
- **Tailwind CSS 4**（`@tailwindcss/vite`，CSS-first 配置）
- **MDX** 内容（frontmatter 由 `src/content.config.ts` 的 Zod schema 校验）
- **Pagefind**（astro-pagefind 集成，构建期生成全文索引）
- **View Transitions**（ClientRouter，筛选/页面切换平滑过渡）

## 本地开发

```bash
npm install
npm run dev        # 开发服务器 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物（含 Pagefind 索引）
npx astro check    # 类型检查
```

## 内容结构

```
src/content/
├── breeds/*.mdx      # 品种图鉴（frontmatter 含 color/finType/difficulty 枚举）
├── guides/*.mdx      # 饲养指南
├── breeding/*.mdx    # 繁殖技术
└── disease/*.mdx     # 疾病防治
```

新增品种/文章 = 在对应目录添加一个 MDX 文件，frontmatter 字段见 `src/content.config.ts`。

## 📷 图片补充说明（TODO）

所有品种图片目前为**渐变占位**，待用 AI 生成（如 Gemini）补充。每个品种 MDX 文件正文开头有 `<!-- TODO(图片): ... -->` 注释：

1. 用 Gemini 等工具按注释说明生成品种图
2. 图片放入 `src/content/breeds/` 对应目录（或 `src/assets/`）
3. 在 MDX frontmatter 填入 `image: 图片路径`（需符合 `image()` schema）
4. 删除正文中的 TODO 注释

占位逻辑在 `src/components/BreedImage.astro`，渐变主色由 `COLOR_GRADIENTS` 按品种 color 枚举映射。

## 部署（Cloudflare Pages，推荐）

纯静态站，无需 adapter，直接把 `dist/` 作为静态资源部署：

### 方式一：Git 接入（推荐）

1. 将项目推送到 GitHub/GitLab
2. Cloudflare 控制台 → **Workers & Pages** → **Create application** → **Pages** → *Import an existing Git repository*
3. 配置：
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 部署完成后**绑定自定义域名**（`*.pages.dev` 二级域名在国内不稳定）

### 方式二：Wrangler CLI

```bash
npm i -D wrangler
npm run build
npx wrangler pages deploy dist --project-name guppy-wiki
```

### 中国大陆访问建议

- 不要依赖 `*.pages.dev` 免费二级域名（国内移动网络基本打不开）
- 绑定自有域名后国内可访问性显著提升（跨境 RTT 150-250ms 为 CF 免费档基线）
- 如需进一步提速：国内 DNS 分流 + Cloudflare 优选 IP，或国内 CDN 回源（需 ICP 备案）

## 路线图

- [ ] AI 生成全部品种图片并填入
- [ ] 品种扩充至全部 17 大品系代表品种
- [ ] 饲养指南补充：喂食、鱼缸设置、混养搭配、日常维护
- [ ] 繁殖技术补充：品系提纯实战
- [ ] 疾病防治补充：各病独立详情页

## 免责声明

网站内容整理自公开资料、水族论坛与专业文献，仅供学习交流。疾病用药请以药品说明书为准；饲养数据因个体差异，请以实际情况为准。
