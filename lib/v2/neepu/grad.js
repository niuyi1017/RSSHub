const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://grad.neepu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `东北电力大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: 'ul.n_nav li a.cur',
    listSelector: 'ul.n_listxx1 li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const dateText = $item.find('span.time').text().trim();
        const href = a.attr('href');
        return {
            title: a.attr('title') || a.text().trim(),
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
