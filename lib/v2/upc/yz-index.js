const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.upc.edu.cn';
module.exports = async (ctx) => {
    const pageUrl = host;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生网-首页';
    const notices = $('[frag="窗口16"] .news_list > li.news');
    const list = notices.length ? notices : $('.wp_article_list li.list_item');
    const items = await Promise.all(
        Array.from(list).flatMap((item) => {
            item = $(item);
            const dateParts = item.find('.dateBox .news_meta');
            const itemDate = dateParts.length === 2 ? `${dateParts.eq(1).text().trim()}-${dateParts.eq(0).text().trim()}` : item.find('.Article_PublishDate').text();
            const aTag = item.find('.news_title a[href], .Article_Title a[href]').first();
            const itemTitle = (aTag.attr('title') || aTag.text()).trim();
            const itemPath = aTag.attr('href');
            if (!itemPath || !itemTitle || !itemDate) {
                return [];
            }
            const url = new URL(itemPath, pageUrl);
            const itemUrl = url.href;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    if (url.origin === host) {
                        const result = await got(itemUrl);
                        const $ = cheerio.load(result.data);
                        const content = $('.wp_articlecontent').first().html()?.trim();
                        const attachments = $('ul[style="list-style-type:none;"]').first().html()?.trim();
                        description = (content || itemTitle) + (attachments || '');
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
        title: `中国石油大学 - ${typeName}`,
        link: pageUrl,
        description: `中国石油大学 - ${typeName}`,
        item: items,
    };
};
