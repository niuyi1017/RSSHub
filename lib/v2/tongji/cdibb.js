const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://cdibb.tongji.edu.cn',
    typeName: '研究生招生',
    feedTitle: (typeName) => `同济大学职业技术教育学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    listSelector: '.data-list2 li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('a').clone().children().remove().end().text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item.find('span').text().trim(),
    }),
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
