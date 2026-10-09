const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.whu.edu.cn',
    typeName: '招生',
    feedTitle: (typeName) => `武汉大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.right-list .column .location a:nth-child(n+3)',
    listSelector: '.right-list .list > ul > li, .right-list .list-mulu > ul > li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('a p').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item
            .find('span')
            .text()
            .trim()
            .match(/^\d{4}-\d{2}-\d{2}$/)?.[0],
    }),
    fetchDetail: true,
    detailDateParser: ($) => $('meta[name="PubDate"]').attr('content'),
    detailParser: ($, itemUrl) => {
        const content = $('#vsb_content, #vsb_content_2').first();
        if (!content.length) {
            return null;
        }
        content.find('script').each((_, element) => {
            const script = $(element).html() || '';
            const pdf = script.match(/showVsbpdfIframe\(\s*['"]([^'"]+\.pdf(?:\?[^'"]*)?)['"]/i);
            if (pdf) {
                $(element).replaceWith($('<a>').attr('href', new URL(pdf[1], itemUrl).href).text('查看 PDF'));
            }
        });
        return content.html().trim();
    },
});
