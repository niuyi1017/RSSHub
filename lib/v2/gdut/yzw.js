const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzw.gdut.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.channl-menu h2').text() || '研究生招生信息网';
    const list = $('.text-list ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateYYYY = item.find('.tl-data span').text();
            const itemDateMMDD = item.find('.tl-data p').text();
            const itemDate = `${itemDateYYYY}-${itemDateMMDD}`;
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.find('em').text();
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
                    const content = $('.v_news_content');
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
        title: `广东工业大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `广东工业大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
