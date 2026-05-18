const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  const { type } = ctx.params;
  const pageUrl = `https://hrss.rizhao.gov.cn/col/${type}/index.html`;

  const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
  const $ = cheerio.load(response.data);

  const typeName = $('meta[name="ColumnName"]').attr('content') || '事业单位公开招聘';

  // List items are embedded as CDATA records inside <script type="text/xml"> (Hanweb CMS)
  const scriptText = $('script[type="text/xml"]').html() || '';
  const records = [...scriptText.matchAll(/<record><!\[CDATA\[([\s\S]*?)\]\]><\/record>/g)];

  const parsedItems = records.slice(0, 20).map(([, itemHtml]) => {
    const $li = cheerio.load(itemHtml);
    const a = $li('a');
    const title = a.attr('title') || a.text().trim();
    const href = a.attr('href') || '';
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    const date = $li('span').text().trim();
    return { title, link, date };
  });

  const items = await Promise.all(
    parsedItems.map((parsed) =>
      ctx.cache.tryGet(parsed.link, async () => {
        let description = parsed.title;
        try {
          const resp = await got(parsed.link, { https: { rejectUnauthorized: false } });
          const $d = cheerio.load(resp.data);
          const content = $d('#zoom');
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
    title: `日照市人力资源和社会保障局 - ${typeName}`,
    link: pageUrl,
    description: `日照市人力资源和社会保障局 - ${typeName}`,
    item: items,
  };
};
