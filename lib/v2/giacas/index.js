const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gia.cas.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '中国科学院赣江创新研究院';
    const list = $('#content ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = '20' + item.find('.time').text().replace('[', '').replace(']', '').trim();
            const aTag = item.find('a');
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
                    const content = $('.cas-article');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const attachments = $('ul[style="list-style-type:none;"]');
                    if (attachments.length > 0) {
                        description += attachments.html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `中国科学院赣江创新研究院 - ${typeName}`,
        link: pageUrl,
        description: `中国科学院赣江创新研究院 - ${typeName}`,
        item: items,
    };
};
