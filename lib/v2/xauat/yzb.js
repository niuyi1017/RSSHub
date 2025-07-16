const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://yzb.xauat.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = $('.con .tit_tou').text() || '研究生院';
    const list = $(' .list ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text();
            const aTag = item.find('a').last();
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
        title: `西安建筑科技大学研招网 - ${typeName}`,
        link: pageUrl,
        description: `西安建筑科技大学研招网 - ${typeName}`,
        item: items,
    };
};
