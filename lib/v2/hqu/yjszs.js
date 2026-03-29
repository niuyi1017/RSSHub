const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjszs.hqu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;

    // 该站点有 JS 浏览器环境检查，需要 stealth + networkidle2 等待挑战通过
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
        // JS 挑战需要 ~5 秒完成验证后跳转
        await new Promise((r) => setTimeout(r, 8000));

        const content = await page.content();
        const $ = cheerio.load(content);

        const typeName = $('.place a').last().text() || '研究生招生信息网';
        const items = $('.listbox .e2 li')
            .toArray()
            .map((item) => {
                item = $(item);
                const itemDate = item.find('.info').text().slice(3, 13);
                const itemTitle = item.find('.title').text();
                const itemPath = item.find('.title').attr('href');
                const itemUrl = itemPath && itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;

                return {
                    title: itemTitle,
                    link: itemUrl,
                    description: itemTitle,
                    pubDate: timezone(parseDate(itemDate), 8),
                };
            });

        ctx.state.data = {
            title: `华侨大学研究生招生信息网 - ${typeName}`,
            link: pageUrl,
            description: `华侨大学研究生招生信息网 - ${typeName}`,
            item: items,
        };
    } finally {
        await browser.close();
    }
};
