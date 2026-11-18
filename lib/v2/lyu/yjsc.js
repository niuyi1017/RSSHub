const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.lyu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `临沂大学研究生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.column-title',
    listSelector: '.column-news-list .column-news-item, .column-news-list .wp_article_list > li.list_item',
    listItemParser: ($item, $, pageUrl) => {
        const article = $item.find('.Article_Title a');
        const href = $item.attr('href') || article.attr('href');
        return {
            title: (article.attr('title') || article.text() || $item.find('.column-news-title').text()).trim(),
            link: href ? new URL(href, pageUrl).href : undefined,
            date: $item.find('.Article_PublishDate, .column-news-date').first().text().trim(),
        };
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
