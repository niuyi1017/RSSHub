const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://gs.swust.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `西南科技大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zs/${type}/list.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: '.Column_Name',
    listSelector: 'div[frag="窗口37"] > ul > li',
    listParser: { dateSelector: 'span:last-child' },
    fetchDetail: true,
    detailParser: ($, itemUrl) => {
        const content = $('.wp_articlecontent').first();
        content.find('[pdfsrc]').each((_, element) => {
            const pdfSrc = $(element).attr('pdfsrc');
            if (pdfSrc) {
                $(element).replaceWith($('<a>').attr('href', new URL(pdfSrc, itemUrl).href).text('查看 PDF'));
            }
        });
        return content.html()?.trim() || null;
    },
});
