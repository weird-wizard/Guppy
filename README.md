# 🐟 孔雀鱼知识百科 (Guppy Wiki)

面向水族爱好者的孔雀鱼（*Poecilia reticulata* / 孔雀花鳉）现代中文知识百科与实用数字工作台。

---

## 🌟 核心模块

| 模块 | 路由 | 核心功能与亮点 |
|---|---|---|
| **品种图鉴** | `/breeds/` | 24 个主流与进阶代表品种，支持按颜色、鳍型、饲养难度组合即时筛选 |
| **饲养指南** | `/guide/` | 从零开缸养水、水质化学指标（pH/硬度/氨氮）、科学投喂、混养图谱到日常换水维护全生命周期指南 |
| **繁殖技术** | `/breeding/` | 母鱼待产征兆、幼鱼开口护理、种鱼优选挑选、品系纯化（近交衰退与回交）与难产避坑 |
| **疾病防治** | `/disease/` | **交互式临床工作台**：对症排查分诊、黄金急救三步法、老三样禁忌对照、**水体用药双模式计算器**（一键复制备忘）、常备药箱清单及 9 种单病专科处方 |
| **全站搜索** | 导航栏搜索 | 基于 Pagefind 的即时毫秒级全文搜索（构建期轻量静态索引，无需外部后端） |

---

## 🛠️ 技术栈

- **框架**：[Astro 7.2](https://astro.build/)（静态站点生成 SSG，极致加载性能）+ Content Layer API (Zod Schema 强类型校验)
- **样式**：[Tailwind CSS 4](https://tailwindcss.com/)（`@tailwindcss/vite`，Modern CSS-first 设计）
- **图标**：[@lucide/astro](https://lucide.dev/)（精致统一的轻量级矢量 Icon）
- **内容引擎**：MDX 原生解析与组件化渲染
- **搜索**：[Pagefind](https://pagefind.app/)（纯静态客户端全文分词检索）
- **交互过渡**：Astro ClientRouter（View Transitions 平滑无刷新路由）

---

## 💻 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动本地热重载开发服务器 (默认端口 http://localhost:4321)
npm run dev

# 3. 生产环境静态打包构建 (输出至 dist/)
npm run build

# 4. 本地预览打包产物 (测试 Pagefind 搜索索引)
npm run preview
```

---

## 📁 目录与内容结构

```
src/
├── components/          # 通用 Astro UI 组件 (图片占位、导航栏、搜索触发器等)
├── content/             # 核心 MDX 内容知识库
│   ├── breeds/          # 品种图鉴 (24 篇，含 color / finType / difficulty 元数据)
│   ├── guides/          # 饲养指南 (6 篇，含 waterQuality / tankSetup 等)
│   ├── breeding/        # 繁殖技术 (5 篇，含 pregnancy / fryCare 等)
│   └── disease/         # 疾病防治 (9 篇单病处方 + 1 篇综合检疫指南)
├── layouts/             # 页面通用布局 (BaseLayout.astro，包含 SEO、导航与页脚)
├── pages/               # 页面路由与交互工作台
└── styles/              # 全局样式与 Tailwind 4 设计系统配置
```

> **提示**：新增品种或文章只需在 `src/content/` 对应目录下创建 `.mdx` 文件，Frontmatter 格式由 `src/content.config.ts` 中的 Zod 规则自动校验。

---

## 📷 品种图片补充说明

品种封面支持通过 `image` 字段配置真实图片，未配置时将自动调用 `src/components/BreedImage.astro` 中的动态多重渐变占位。

1. 生成或拍摄对应品种的高清图片
2. 图片放置于 `src/content/breeds/` 对应目录或 `src/assets/`
3. 在品种 MDX 的 frontmatter 填入 `image: ./your-image.png`
4. 编译时 Astro 将自动执行 WebP 格式转码与响应式尺寸优化

---

## 🚀 部署（推荐 Cloudflare Pages）

本项目为 100% 纯静态站点（Zero Server Overhead），可直接将 `dist/` 目录部署于任意静态托管平台：

### 推荐方案：Cloudflare Pages (Git 自动集成)
1. 将代码仓库推送到 GitHub / GitLab；
2. 在 Cloudflare 控制台新建 Pages 项目，关联该 Git 仓库；
3. 配置构建命令：`npm run build`，产物目录：`dist`；
4. 部署成功后绑定自定义域名即可极速访问。

---

## 🗺️ 项目路线图

- [x] **疾病防治数字工作台**：对症部位排查、急救三步法流向、水体/粗盐双模式计算器、常备药箱
- [x] **饲养体系全书**：新手开缸、水质管理、投喂、混养、日常维护 6 篇完整落地
- [x] **繁殖与提纯指南**：产前产后护理、开口粮、优选选育、品系纯化 5 篇完整落地
- [x] **品种图鉴库**：覆盖主流与热门 24 大经典品种
- [x] **移动端交互适配**：2x2 自适应导航网格、单手横滑部位胶囊、全端响应式触控
- [ ] 为品种图鉴补充 AI / 摄影高清实拍图

---

## 📜 免责声明

本知识库内容由专业养殖资料、学术文献与水族从业经验整理而成，仅供水族爱好者学习参考。针对疾病防治，请以市售正规观赏鱼药品说明书为准；不同鱼缸水质与环境存在客观差异，请结合实际情况科学调整。
