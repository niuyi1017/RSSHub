const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yzb.jlu.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `吉林大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    listSelector: '.txtList li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('h4').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: `${$item.find('time').clone().children().remove().end().text().trim().replace('.', '-')}-${$item.find('time span').text().trim()}`,
    }),
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
