const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsy.hnucm.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `湖南中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    listSelector: '.list-right .list li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('a div').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item.find('p').text().trim(),
    }),
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
