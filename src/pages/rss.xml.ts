import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// RSS 订阅：汇总最新发布的品种/文章
const SITE = 'https://guppy.example.com';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(SITE);

  const breeds = await getCollection('breeds');
  const guides = await getCollection('guides');
  const breeding = await getCollection('breeding');
  const disease = await getCollection('disease');

  // 汇总所有内容并按时排序（新→旧）
  const items = [
    ...breeds.map((b) => ({
      title: `${b.data.title}（${b.data.family}）`,
      link: new URL(`breed/${b.id}/`, baseUrl).toString(),
      date: b.data.updatedDate ?? b.data.pubDate,
      desc: b.data.subtitle ?? `${b.data.title}品种介绍`,
    })),
    ...guides.map((g) => ({
      title: g.data.title,
      link: new URL(`guide/${g.id}/`, baseUrl).toString(),
      date: g.data.updatedDate ?? g.data.pubDate,
      desc: g.data.subtitle ?? `${g.data.title} - 饲养指南`,
    })),
    ...breeding.map((b) => ({
      title: b.data.title,
      link: new URL(`breeding/${b.id}/`, baseUrl).toString(),
      date: b.data.updatedDate ?? b.data.pubDate,
      desc: b.data.subtitle ?? `${b.data.title} - 繁殖技术`,
    })),
    ...disease.map((d) => ({
      title: `${d.data.title}（${d.data.enName ?? '疾病防治'}）`,
      link: new URL(`disease/${d.id}/`, baseUrl).toString(),
      date: d.data.updatedDate ?? d.data.pubDate,
      desc: d.data.subtitle ?? `${d.data.title} - 疾病防治`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>孔雀鱼百科</title>
    <link>${baseUrl.toString()}</link>
    <description>孔雀鱼（Poecilia reticulata）知识百科：品种图鉴、饲养指南、繁殖技术、疾病防治</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description><![CDATA[${item.desc}]]></description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
