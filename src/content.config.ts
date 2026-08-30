import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─── 品种图鉴集合 ─────────────────────────────────────────────
const breeds = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/breeds' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),                    // 品种名称
      enName: z.string().optional(),        // 国际通用英文名
      subtitle: z.string().optional(),      // 一句话简介
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // 品种分类字段（图鉴筛选核心）
      color: z.enum(['red', 'blue', 'green', 'yellow', 'purple', 'white', 'black', 'snake', 'multi']),
      finType: z.enum(['delta', 'fan', 'sword', 'crown', 'ribbon', 'round', 'flag', 'veil']),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      family: z.string(),                   // 品系（礼服系/马赛克系…）
      genetics: z.string().optional(),      // 遗传方式（伴X/伴Y…）
      size: z.string().optional(),          // 体长描述
      temp: z.string().optional(),          // 适宜水温
      tags: z.array(z.string()).default([]),
      image: image().optional(),            // AI 生成图后期补充，前期留空
    }),
});

// ─── 饲养指南集合 ─────────────────────────────────────────────
const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('饲养指南'),
    order: z.number().optional(),          // 栏目内排序
    tags: z.array(z.string()).default([]),
  }),
});

// ─── 繁殖技术集合 ─────────────────────────────────────────────
const breeding = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/breeding' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('繁殖技术'),
    order: z.number().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// ─── 疾病防治集合 ─────────────────────────────────────────────
const disease = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/disease' }),
  schema: z.object({
    title: z.string(),
    enName: z.string().optional(),
    subtitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('疾病防治'),
    order: z.number().optional(),
    pathogen: z.string().optional(),       // 病原体
    pathogenType: z.enum(['parasite', 'bacteria', 'fungus', 'water', 'mixed']).optional(), // 病原类型
    severity: z.enum(['critical', 'warning', 'mild', 'guide']).default('warning'), // 紧急程度分级
    bodyParts: z.array(z.string()).default([]), // 患病部位: body, fin, belly, eye, behavior, all
    isolationRequired: z.boolean().default(false), // 是否必须隔离治疗
    emergencyAction: z.string().optional(), // 核心黄金处置建议
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { breeds, guides, breeding, disease };
