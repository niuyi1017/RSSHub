const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  const { type } = ctx.params;
  const baseUrl = 'https://www.weihai.gov.cn';

  // The listing is loaded via a POST search API (xxgk disclosure platform)
  const response = await got.post(`${baseUrl}/module/xxgk/search.jsp`, {
    form: {
      infotypeId: type,
      jdid: '78',
      divid: 'div74499',
      standardXxgk: '1',
      vc_title: '',
      vc_number: '',
      currpage: '',
      area: '',
    },
    https: { rejectUnauthorized: false },
  });

  const $ = cheerio.load(response.data);

  const parsedItems = [];
  $('li').each((_, el) => {
    const a = $(el).find('a');
    const title = a.attr('title') || a.text().trim();
    const href = a.attr('href') || '';
    if (!title || !href) {
      return;
    }
    const link = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    const date = $(el).find('b').text().trim();
    parsedItems.push({ title, link, date });
  });

  const items = await Promise.all(
    parsedItems.slice(0, 20).map((parsed) =>
      ctx.cache.tryGet(parsed.link, async () => {
        let description = parsed.title;
        try {
          const resp = await got(parsed.link, { https: { rejectUnauthorized: false } });
          const $d = cheerio.load(resp.data);
          const content = $d('.art_con');
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
    title: `威海市人民政府 - 事业单位招考`,
    link: `${baseUrl}/col/col74500/index.html`,
    description: `威海市人民政府 - 事业单位招考`,
    item: items,
  };
};
