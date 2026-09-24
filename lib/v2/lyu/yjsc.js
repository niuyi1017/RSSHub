const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsc.lyu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `临沂大学研究生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.column-title',
    listSelector: '.wp_article_list li',
    listParser: { dateSelector: '.Article_PublishDate' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
