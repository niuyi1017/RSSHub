const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://web.ymu.edu.cn';

module.exports = async (ctx) => {
  let { type } = ctx.request.params;
  type = type.replace(/-/g, '/');
  const pageUrl = `${host}/yjsy/${type}.htm`;

  // 该站点有「知道创宇云防御」WAF，需要 stealth + networkidle2 等待 JS 挑战通过
  const browser = await require('@/utils/puppeteer')({ stealth: true });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'media', 'font'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    // WAF 安全检查需要 ~5 秒完成 JS 挑战后跳转
    await new Promise((r) => setTimeout(r, 8000));

    const content = await page.content();
    const $ = cheerio.load(content);

    const typeName = $('.ny-title h3').text().trim() || '研究生院';

    const items = $('ul.list li')
      .toArray()
      .map((item) => {
        item = $(item);
        const aTag = item.find('a');
        const itemTitle = aTag.attr('title') || aTag.text().trim();
        const itemDate = item.find('span').text().trim();
        const itemPath = aTag.attr('href');
        const itemUrl = itemPath && itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;

        return {
          title: itemTitle,
          link: itemUrl,
          description: itemTitle,
          pubDate: timezone(parseDate(itemDate), 8),
        };
      });

    ctx.state.data = {
      title: `云南民族大学研究生院 - ${typeName}`,
      link: pageUrl,
      description: `云南民族大学研究生院 - ${typeName}`,
      item: items,
    };
  } finally {
    await browser.close();
  }
};
