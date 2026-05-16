const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://zzhrss.zaozhuang.gov.cn',
    typeName: '招聘信息',
    feedTitle: (typeName) => `枣庄市人力资源和社会保障局 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/`,
    typeNameSelector: '.loc a:last-of-type',
    listSelector: 'ul.news-list span.newstxt',
    limit: 20,
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const rawTitle = a.text().trim();
        const title = rawTitle.replace(/^[\u00b7\u00a0\s]+/, '');
        const href = a.attr('href') || '';
        const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
        const date = $item.next('span.date').text().trim();
        return { title, link, date };
    },
    fetchDetail: true,
    detailContentSelector: '.zwnr',
});
