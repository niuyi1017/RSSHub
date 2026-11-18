const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://cdibb.tongji.edu.cn';
module.exports = async (ctx) => {
    const type = ctx.request.params.type.replace(/-/g, '/');
    const pageUrl = `${host}/${type === '17655' ? '37920' : type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = ($('.insideh2').text() || $('.nav-path a').last().text()).trim() || '职业技术教育学院';
    const currentList = $('.main-right .data-list2 > li > a[href]');
    const list = currentList.length ? currentList : $('.data-list li a[href]');
    const items = await Promise.all(
        Array.from(list).map((element) => {
            const article = $(element);
            const itemDate = (currentList.length ? article.children('span').first().text() : article.parent().find('.data-list-time').text()).trim();
            const articleText = currentList.length ? article.clone().children('span').remove().end().text() : article.text();
            const itemTitle = (article.attr('title') || articleText).trim();
            const url = new URL(article.attr('href'), pageUrl);
            const itemUrl = url.href;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    if (url.origin === host) {
                        const result = await got(itemUrl);
                        const $ = cheerio.load(result.data);
                        const content = $('.view-cnt, .wp_articlecontent').first().html()?.trim();
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
        title: `同济大学职业技术教育学院 - ${typeName}`,
        link: pageUrl,
        description: `同济大学职业技术教育学院 - ${typeName}`,
        item: items,
    };
};
