const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://zhaosheng.lut.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/zslb/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = $('.subNav ul li.on a').text() || '招生办公室';
    const list = $('.textlist .info .box a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.dete').text();
            const aTag = item;
            const itemTitle = aTag.find('.title').text();
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
        title: `兰州理工大学招生工作办公室 - ${typeName}`,
        link: pageUrl,
        description: `兰州理工大学招生工作办公室 - ${typeName}`,
        item: items,
    };
};
