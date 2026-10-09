const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.sdutcm.edu.cn',
    typeName: '招生通知',
    feedTitle: (typeName) => `山东中医药大学研究生招生信息网 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '#place a:last-child',
    listSelector: '#list > ul > li',
    fetchDetail: true,
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
});
