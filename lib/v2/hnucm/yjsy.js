const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.hnucm.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `湖南中医药大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.list-dq h3',
    listSelector: '.list-right > ul.list > li',
    listParser: { dateSelector: 'a > p' },
    fetchDetail: true,
    detailParser: ($, itemUrl) => {
        const content = $('#vsb_content .v_news_content').first();
        content.find('script').each((_, element) => {
            const script = $(element).html() || '';
            const pdf = script.match(/showVsbpdfIframe\(\s*['"]([^'"]+\.pdf(?:\?[^'"]*)?)['"]/i);
            if (pdf) {
                $(element).replaceWith($('<a>').attr('href', new URL(pdf[1], itemUrl).href).text('查看 PDF'));
            }
        });
        const attachments = $('.content ul[style="list-style-type:none;"]').first();
        return `${content.html()?.trim() || ''}${attachments.html()?.trim() || ''}` || null;
    },
});
