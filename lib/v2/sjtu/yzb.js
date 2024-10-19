const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzb.sjtu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.menu-body .active').last().text() || '研究生招生网';
    const list = $('.announcement-list a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.month').text() + '-' + item.find('.day').text().trim();
            const itemTitle = item.find('.title').text();
            const itemPath = item.attr('href');
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
                    const content = $('.mce-content-body');
                    if (content.length > 0) {
                        description = content.html().trim();
                        const attachments = $('ul[style="list-style-type:none;"]');
                        if (attachments.length > 0) {
                            description += attachments.html().trim();
                        }
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
        title: `上海交通大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `上海交通大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
