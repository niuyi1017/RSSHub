const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsxy.xjmu.edu.cn',
    typeName: '硕士生招生',
    feedTitle: (typeName) => `新疆医科大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.n_right h2 span',
    listSelector: 'ul.tit-list li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const date = a.find('span').text().trim();
        a.find('span').remove();
        const title = a.text().trim();
        const href = a.attr('href');
        return {
            title,
            link: href ? new URL(href, pageUrl).href : '',
            date,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
