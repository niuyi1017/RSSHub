const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://yjszs.njnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}.htm`;

    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);

    const $ = cheerio.load(content);
    const typeName = '研究生招生网';
    let list = $('.sy-con ul li');
    if (list && list.length) {
        list = list.slice(0, 10); // Limit to the first 10 items
    }

    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.find('i').text();
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
    });

    ctx.state.data = {
        title: `南京师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `南京师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
