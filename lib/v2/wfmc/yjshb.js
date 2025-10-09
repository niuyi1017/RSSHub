const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjshb.wfmc.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl, {
        // 忽略证书错误
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.possplit').parent().find('a').last().text() || '研究生处';
    const list = $('.wp_article_list .list_item ');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.Article_PublishDate').text();
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
                    const result = await got(itemUrl, {
                        // 忽略证书错误
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const $ = cheerio.load(result.data);
                    const content = $('.wp_articlecontent');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const attachments = $('.wp_articlecontent[style="list-style-type:none;"]');
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
        title: `山东第二医科大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `山东第二医科大学研究生处 - ${typeName}`,
        item: items,
    };
};
