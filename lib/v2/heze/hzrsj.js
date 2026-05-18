const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://hzrsj.heze.gov.cn';
const dwid = '2c908088819842f701819a1930070001';

module.exports = async (ctx) => {
  const { type } = ctx.params;

  // Get category name
  let typeName = '人事考试';
  try {
    const cataResp = await got.post(`${host}/sys-service/webdwcata/dwcataByShow/${type}`, { json: {} });
    typeName = cataResp.data?.data?.name || typeName;
  } catch {
    // fallback to default
  }

  // Get article list
  const listResp = await got.post(`${host}/els-service/article/1/15`, {
    json: { type: [1], fwzt: '3', order: 'up', catas: [type], dw: [dwid] },
  });
  const articles = listResp.data?.data?.contents || [];

  const items = await Promise.all(
    articles.map((article) => {
      const link = article.url || `${host}/${article.dwid || dwid}/${article.xxid}.html`;
      return ctx.cache.tryGet(link, async () => {
        let description = article.subject;
        if (!article.url) {
          try {
            const resp = await got(link);
            const $ = cheerio.load(resp.data);
            const content = $('#mainText');
            if (content.length) {
              description = content.html().trim();
            }
          } catch {
            // fallback to title
          }
        }
        return {
          title: article.subject,
          link,
          pubDate: timezone(parseDate(article.fwdate), 8),
          description,
        };
      });
    })
  );

  ctx.state.data = {
    title: `菏泽市人社局 - ${typeName}`,
    link: `${host}/rskslby/?catas=${type}`,
    description: `菏泽市人社局 - ${typeName}`,
    item: items,
  };
};
