const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://yjsglxt.swun.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/index.jhtml`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);

    const $ = cheerio.load(content);
    const typeName = $('#list .title a').last().text() || '研究生招生信息网';
    const list = $('#list .news .news-list tbody tr .columnStyle').slice(0, -1);
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.find('.postTime').text();
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
        title: `西南民族大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `西南民族大学研究生院 - ${typeName}`,
        item: items,
    };
};
