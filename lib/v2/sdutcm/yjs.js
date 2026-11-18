const { createRoute } = require('@/v2/utils/news-list-template');

const options = {
    host: 'https://yjs.sdutcm.edu.cn',
    typeName: '招生通知',
    feedTitle: (typeName) => `山东中医药大学研究生招生信息网 - ${typeName.trim()}`,
    fetchDetail: true,
    gotOptions: { https: { rejectUnauthorized: true } },
    detailParser: ($, itemUrl) => {
        const content = $('#vsb_content .v_news_content').first();
        content.find('iframe[src]').each((_, element) => {
            const src = $(element).attr('src');
            if (/\.pdf(?:\?|$)/i.test(src)) {
                $(element).replaceWith($('<a>').attr('href', new URL(src, itemUrl).href).text('查看 PDF'));
            }
        });
        const attachments = $('ul[style="list-style-type:none;"]').first();
        return `${content.html()?.trim() || ''}${attachments.html()?.trim() || ''}` || null;
    },
};

const category = createRoute({
    ...options,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '#place a:last-child',
    listSelector: '#list > ul > li',
});

const admissions = createRoute({
    ...options,
    buildPageUrl: (host) => `${host}/zsgz/`,
    listSelector: '#hang_1 .news_con > ul > li:has(> a[href])',
    listItemParser: ($item, $, pageUrl) => {
        const article = $item.children('a');
        const dateLabel = article.children('span');
        const day = dateLabel.children('p').text().trim();
        const yearMonth = dateLabel.clone().children().remove().end().text().trim();
        return {
            title: article.attr('title') || article.children('p').text().trim(),
            link: new URL(article.attr('href'), pageUrl).href,
            date: `${yearMonth}-${day}`,
        };
    },
});

module.exports = (ctx) => (ctx.params.type === 'zsgz' ? admissions(ctx) : category(ctx));
