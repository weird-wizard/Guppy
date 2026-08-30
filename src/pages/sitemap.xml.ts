import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// 全站 URL 清单：sitemap.xml 由内容集合动态生成
const SITE = 'https://guppy.qichiyoufeng.top';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(SITE);

  // 收集全部内容条目的 slug
  const breeds = await getCollection('breeds');
  const guides = await getCollection('guides');
  const breeding = await getCollection('breeding');
  const disease = await getCollection('disease');

  // 静态页面（首页 + 4 个栏目）
  const staticPages = ['', 'breeds/', 'guide/', 'breeding/', 'disease/'];

  const urls = [
    ...staticPages.map((p) => ({
      loc: new URL(p, baseUrl).toString(),
      changefreq: 'weekly',
      priority: p === '' ? '1.0' : '0.8',
      lastmod: undefined as string | undefined,
    })),
    ...breeds.map((b) => ({
      loc: new URL(`breed/${b.id}/`, baseUrl).toString(),
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: b.data.updatedDate?.toISOString() ?? b.data.pubDate.toISOString(),
    })),
    ...guides.map((g) => ({
      loc: new URL(`guide/${g.id}/`, baseUrl).toString(),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: g.data.updatedDate?.toISOString() ?? g.data.pubDate.toISOString(),
    })),
    ...breeding.map((b) => ({
      loc: new URL(`breeding/${b.id}/`, baseUrl).toString(),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: b.data.updatedDate?.toISOString() ?? b.data.pubDate.toISOString(),
    })),
    ...disease.map((d) => ({
      loc: new URL(`disease/${d.id}/`, baseUrl).toString(),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: d.data.updatedDate?.toISOString() ?? d.data.pubDate.toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
