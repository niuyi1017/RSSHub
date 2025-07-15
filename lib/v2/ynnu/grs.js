const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://grs.ynnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = $('.position h3').text() || '研究生招生网';
    const list = $('.text-list ul li');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDateDD = item.find('.time span').text().trim();
        const itemDateDDYYMM = item.find('.time').text().trim();
        const itemDate = itemDateDDYYMM.replace(itemDateDD, '').trim() + '-' + itemDateDD;
        const aTag = item.find('a');
        const itemTitle = aTag.attr('title') || aTag.find('.titline').text();
        const itemPath = aTag.attr('href');
        const description = item.find('.line2').text();
        let itemUrl = '';
        if (itemPath.startsWith('http')) {
            itemUrl = itemPath;
        } else {
            itemUrl = new URL(itemPath, pageUrl).href;
        }
        return {
            title: itemTitle,
            link: itemUrl,
            description,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `云南师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `云南师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
