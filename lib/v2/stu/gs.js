const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.gs.stu.edu.cn',
    typeName: '招生动态',
    feedTitle: (typeName) => `汕头大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/list/${type}`,
    typePreprocess: (type) => type,
    typeNameSelector: '.menu-line .title',
    listSelector: 'ul.data-list li.data-item',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a.link');
        const dateText = $item.find('span').text().trim();
        const href = a.attr('href');
        return {
            title: a.text().trim(),
            link: href ? (href.startsWith('http') ? href : new URL(href, pageUrl).href) : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.data-content',
});
