const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://web.ymu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/yjsy/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = $('.ny-title h2').text() || '研究生招生信息网';
    const list = $('ul.list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text();
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.text();
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
                description: itemTitle,
                pubDate: timezone(parseDate(itemDate), 8),
            };
        })
    );
    ctx.state.data = {
        title: `云南民族大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `云南民族大学研究生院 - ${typeName}`,
        item: items,
    };
};
