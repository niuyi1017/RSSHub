// const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const WebScraper = require('@/utils/puppy');

const host = 'https://yzb.bupt.edu.cn';
module.exports = async (ctx) => {
    const pageUrl = `${host}/index.htm`;
    const scraper = new WebScraper();
    const { html: content } = await scraper.scrapeUrl(pageUrl);
    const $ = cheerio.load(content);
    const typeName = '研究生招生网';
    const list = $('.home2 .h2-b .tab1').first().find('.tab li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemYYYYMM = item.find('.date p').text().trim();
            const itemDD = item.find('.date span').text().trim();
            const itemDate = `${itemYYYYMM}.${itemDD}`;
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.find('.con h3').text();
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
        title: `北京邮电大学 - ${typeName}`,
        link: pageUrl,
        description: `北京邮电大学 - ${typeName}`,
        item: items,
    };
};
