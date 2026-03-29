const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const puppeteer = require('@/utils/puppeteer');

const host = 'https://yjsc.sus.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;

    const browser = await puppeteer({ stealth: true });
    try {
        const page = await browser.newPage();
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('.newlist ul li', { timeout: 10000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        const typeName = $('.location h1').text().trim() || '研究生院';
        const list = $('.newlist ul li');
        const items = Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.date').text().trim();
            const aTag = item.find('a');
            const itemTitle = (aTag.attr('title') || aTag.text()).trim();
            const itemPath = aTag.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return {
                title: itemTitle,
                link: itemUrl,
                pubDate: timezone(parseDate(itemDate), 8),
                description: itemTitle,
            };
        });
        ctx.state.data = {
            title: `上海体育大学研究生院 - ${typeName}`,
            link: pageUrl,
            description: `上海体育大学研究生院 - ${typeName}`,
            item: items,
        };
    } finally {
        await browser.close();
    }
};
