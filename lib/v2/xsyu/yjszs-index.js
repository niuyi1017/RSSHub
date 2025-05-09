const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjszs.xsyu.edu.cn';
module.exports = async (ctx) => {
    // let { type } = ctx.request.params;
    // type = type.replace(/-/g, '/');
    const pageUrl = `${host}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生信息网首页';
    const list = $('.list-menu .list1-item');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.time-ym').text() + '-' + item.find('.time-d').text();
            const aTag = item.find('a').last();
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
                    const content = $('#vsb_content');
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
        title: `西安石油大学 - ${typeName}`,
        link: pageUrl,
        description: `西安石油大学 - ${typeName}`,
        item: items,
    };
};
