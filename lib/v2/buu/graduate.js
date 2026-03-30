const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
  const { type } = ctx.params;
  const pageType = type.replace(/-/g, '/');
  const pageUrl = `https://graduate.buu.edu.cn/${pageType}/index.html`;

  const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
  const $ = cheerio.load(response.data);

  // 列表数据嵌在 script[type="text/xml"] 的 CDATA 中
  const xmlScript = $('div[id] script[type="text/xml"]').first().html() || '';
  const $xml = cheerio.load(xmlScript, { xmlMode: true });
  const records = $xml('record').toArray();

  const typeName = $('.lm_tit .name').text().trim() || '通知公告';

  const items = await Promise.all(
    records.map(async (rec) => {
      const cdataHtml = $xml(rec).text();
      const $li = cheerio.load(cdataHtml);
      const a = $li('a');
      const title = a.text().trim();
      const href = a.attr('href');
      const dateStr = $li('.date').text().trim().replace(/[年月]/g, '/').replace(/日/g, '');
      const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;

      return ctx.cache.tryGet(link, async () => {
        let description = title;
        try {
          const detail = await got(link, { https: { rejectUnauthorized: false } });
          const $d = cheerio.load(detail.data);
          const content = $d('.article_con').html();
          if (content) description = content.trim();
        } catch {
          // fallback to title
        }
        return {
          title,
          link,
          pubDate: timezone(parseDate(dateStr), 8),
          description,
        };
      });
    })
  );

  ctx.state.data = {
    title: `北京联合大学研究生处 - ${typeName}`,
    link: pageUrl,
    description: `北京联合大学研究生处 - ${typeName}`,
    item: items,
  };
};
