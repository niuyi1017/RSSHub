const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://gs.yangtzeu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `长江大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.inner_right .local h2',
    listSelector: '.inner_right .newlist1 > ul.list > li',
    fetchDetail: true,
    detailParser: ($, itemUrl) => {
        const content = $('#vsb_content').first();
        content.find('script').each((_, element) => {
            const pdf = ($(element).html() || '').match(/showVsbpdfIframe\(\s*['"]([^'"]+\.pdf(?:\?[^'"]*)?)['"]/i);
            if (pdf) {
                $(element).replaceWith($('<a>').attr('href', new URL(pdf[1], itemUrl).href).text('查看 PDF'));
            }
        });
        const attachments = $('.article ul[style="list-style-type:none;"]').first();
        return `${content.html()?.trim() || ''}${attachments.html()?.trim() || ''}` || null;
    },
});
