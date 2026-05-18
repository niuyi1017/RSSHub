const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  let { type } = ctx.params;
  type = type.replace(/-/g, '/');
  const pageUrl = `https://rsj.taian.gov.cn/${type}/index.html`;

  const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
  const $ = cheerio.load(response.data);

  const typeName = $('meta[name="ColumnName"]').attr('content') || '事业单位公开招聘专栏';

  // List items are embedded as CDATA records inside <script type="text/xml"> (Hanweb CMS)
  const scriptText = $('script[type="text/xml"]').html() || '';
  const records = [...scriptText.matchAll(/<record><!\[CDATA\[([\s\S]*?)\]\]><\/record>/g)];

  const parsedItems = records.slice(0, 20).map(([, itemHtml]) => {
    const $li = cheerio.load(itemHtml);
    const a = $li('a');
    const title = a.text().trim();
    const href = a.attr('href') || '';
    const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    const date = $li('.bt-right').text().trim();
    return { title, link, date };
  });

  const items = await Promise.all(
    parsedItems.map((parsed) =>
      ctx.cache.tryGet(parsed.link, async () => {
        let description = parsed.title;
        try {
          const resp = await got(parsed.link, { https: { rejectUnauthorized: false } });
          const $d = cheerio.load(resp.data);
          const content = $d('.main-fl > div[style="text-align:left"]');
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
    title: `泰安市人力资源和社会保障局 - ${typeName}`,
    link: pageUrl,
    description: `泰安市人力资源和社会保障局 - ${typeName}`,
    item: items,
  };
};
