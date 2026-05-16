const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsy.jisu.edu.cn';
const gotOpts = { dnsLookupIpVersion: 'ipv4' };

module.exports = async (ctx) => {
  let { type } = ctx.request.params;
  type = type.replace(/-/g, '/');
  const pageUrl = `${host}/${type}.htm`;

  const response = await got(pageUrl, gotOpts);
  const $ = cheerio.load(response.data);
  const typeName = $('.title h1').text() || '通知公告';
  const list = $('.right > ul > li');

  const items = await Promise.all(
    Array.from(list).map((item) => {
      item = $(item);
      const itemDate = item.find('span').text().trim();
      const aTag = item.find('a');
      const itemTitle = aTag.attr('title') || aTag.text();
      const itemPath = aTag.attr('href');
      const itemUrl = itemPath ? new URL(itemPath, pageUrl).href : '';

      return ctx.cache.tryGet(itemUrl, async () => {
        let description = itemTitle;
        try {
          const result = await got(itemUrl, gotOpts);
          const $ = cheerio.load(result.data);
          const content = $('#vsb_content .v_news_content');
          if (content.length > 0) {
            description = content.html().trim();
          }
        } catch (e) {
          description = itemTitle;
        }
        return {
          title: itemTitle,
          link: itemUrl,
          pubDate: timezone(parseDate(itemDate), 8),
          description,
        };
      });
    })
  );

  ctx.state.data = {
    title: `吉林外国语大学研究生院 - ${typeName}`,
    link: pageUrl,
    description: `吉林外国语大学研究生院 - ${typeName}`,
    item: items,
  };
};
