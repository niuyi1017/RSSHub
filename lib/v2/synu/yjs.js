const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.synu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `沈阳师范大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '.col_column.selected .column-name',
    listSelector: 'ul.news_list li.news',
    listItemParser: ($item, $, pageUrl) => {
        const day = $item.find('.tm-1').text().trim();
        const yearMonth = $item.find('.tm-2').text().trim();
        const a = $item.find('.news_title a');
        const href = a.attr('href');
        return {
            title: a.attr('title') || a.text(),
            link: href && href.startsWith('http') ? href : new URL(href, pageUrl).href,
            date: `${yearMonth}-${day}`,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
