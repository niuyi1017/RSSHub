const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { getLimit, mapItems, compactDescription } = require('@/v2/utils/admission-feed');

const host = 'https://yjsy.gzucm.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.winstyle71432 a').last().text() || '研究生院';
    const list = $('.winstyle71392 tr .c71392').slice(0, getLimit(ctx));
    const items = await mapItems(Array.from(list), (item) => {
        item = $(item);
        const itemDate = item.parent().next().text().replace('&nbsp;', '').replace(/\//g, '-').trim();
        const aTag = item;
        const itemTitle = aTag.attr('title') || aTag.text();
        const itemPath = aTag.attr('href');
        let itemUrl = '';
        if (itemPath.startsWith('http')) {
            itemUrl = itemPath;
        } else {
            itemUrl = new URL(itemPath, pageUrl).href;
        }
        return ctx.cache.tryGet(itemUrl, async () => {
            let description = itemTitle;
            try {
                const result = await got(itemUrl);
                const $ = cheerio.load(result.data);
                if ($('.v_news_content').length > 0) {
                    description = $('.v_news_content').html().trim();
                } else {
                    description = itemTitle;
                }
            } catch (e) {
                description = itemTitle;
            }
            return {
                title: itemTitle,
                link: itemUrl,
                pubDate: timezone(parseDate(itemDate), 8),
                description: compactDescription(description, itemUrl),
            };
        });
    });
    ctx.state.data = {
        title: `广州中医药大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `广州中医药大学研究生院 - ${typeName}`,
        item: items.map((item) => ({ ...item, description: compactDescription(item.description, item.link) })),
    };
};
