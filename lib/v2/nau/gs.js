const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.nau.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `南京审计大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: 'li.col_title h2',
    listSelector: 'ul.wp_article_list li.list_item',
    listParser: { dateSelector: 'span.Article_PublishDate' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
