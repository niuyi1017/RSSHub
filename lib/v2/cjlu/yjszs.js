// const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'https://yjszs.cjlu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = $('.tyt_bt').text() || '招生信息网';
    const list = $('.ny_list ul li a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.next().text().replace('[', '').replace(']', '');
            const itemTitle = item.attr('title') || item.text();
            const itemPath = item.attr('href');
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
        title: `中国计量大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `中国计量大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
