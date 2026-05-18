const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  let { type } = ctx.params;
  // type uses '-' as path separator, e.g. 'index-kstd-sydwgkzp'
  const pagePath = type.replace(/-/g, '/');
  const pageUrl = `https://rsj.linyi.gov.cn/${pagePath}.htm`;

  const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
  const $ = cheerio.load(response.data);

  const typeName = $('META[Name="ColumnName"]').attr('Content') || $('meta[name="ColumnName"]').attr('content') || '事业单位公开招聘';

  // Each list item uses invalid HTML: <li <span class="date">...
  // Reliably select article links by their title attribute pattern
  const parsedItems = [];
  $('.ul_textlie a[title*="主题："]').each((_, el) => {
    const a = $(el);
    const titleAttr = a.attr('title') || '';
    // Title format: "主题：{actual_title} 日期：YYYY-MM-DD"
    const title = titleAttr.replace(/^主题：/, '').replace(/\s+日期：[\d-]+\s*$/, '').trim();
    const dateMatch = titleAttr.match(/日期：([\d-]+)/);
    const date = dateMatch ? dateMatch[1] : '';
    const href = a.attr('href') || '';
    if (!title || !href) {
      return;
    }
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    parsedItems.push({ title, link, date });
  });

  const items = await Promise.all(
    parsedItems.slice(0, 20).map((parsed) =>
      ctx.cache.tryGet(parsed.link, async () => {
        let description = parsed.title;
        try {
          const resp = await got(parsed.link, { https: { rejectUnauthorized: false } });
          const $d = cheerio.load(resp.data);
          const content = $d('.v_news_content');
          if (content.length) {
            description = content.html().trim();
          }
        } catch {
          // fall back to title if detail fetch fails
        }
        return {
          title: parsed.title,
          link: parsed.link,
          pubDate: timezone(parseDate(parsed.date), 8),
          description,
        };
      })
    )
  );

  ctx.state.data = {
    title: `临沂市人力资源和社会保障局 - ${typeName}`,
    link: pageUrl,
    description: `临沂市人力资源和社会保障局 - ${typeName}`,
    item: items,
  };
};
