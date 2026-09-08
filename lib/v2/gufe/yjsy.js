const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsy.gufe.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `贵州财经大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.PTitle',
    listSelector: '.inner_s1 li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('h3').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: `${$item.find('time').clone().children().remove().end().text().trim()}-${$item.find('time span').text().trim()}`,
    }),
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
