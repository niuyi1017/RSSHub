const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.lyu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `临沂大学研究生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.column-title',
    listSelector: '.column-news-list .column-news-item',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('.column-news-title').text().trim(),
        link: new URL($item.attr('href'), pageUrl).href,
        date: $item.find('.column-news-date').text().trim(),
    }),
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
