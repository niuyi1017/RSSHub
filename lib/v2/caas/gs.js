const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.caas.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `中国农业科学院研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zsgz/${type}/index.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: 'ul.sub_nav li.active a',
    listSelector: 'ul.list01 li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const dateText = $item.find('span.rightDate').text().replace(/[\[\]]/g, '').trim();
        const href = a.attr('href');
        return {
            title: a.text().trim(),
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.article2',
});
