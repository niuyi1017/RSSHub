const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.yz.gxnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.col_title').text() || '研究生招生网';
    const list = $('.col_news_list a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item;
            const itemDateYYYYMM = aTag.find('.tm-6').text().trim();
            const itemDateDD = aTag.find('.tm-5').text().trim();
            const itemDate = `${itemDateYYYYMM}-${itemDateDD}`;
            const itemTitle = aTag.find('.lbbt-2').text().trim();
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
                    const content = $('.read');
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
        title: `广西师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `广西师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
