// const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getInstance } = require('@/utils/puppy');

const host = 'http://yjs.ahau.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const scraper = getInstance();
    const { html: content } = await scraper.scrapeUrl(pageUrl);

    const $ = cheerio.load(content);
    const typeName = $('.ny-newslist_l h1').text() || '研究生招生信息网';
    const list = $('.newslist_r ul li');

    const items = Array.from(list).map((item) => {
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
    });
    ctx.state.data = {
        title: `安徽农业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `安徽农业大学研究生院 - ${typeName}`,
        item: items,
    };
};
