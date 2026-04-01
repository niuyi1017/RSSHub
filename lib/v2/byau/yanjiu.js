const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yanjiu.byau.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `黑龙江八一农垦大学研究生与学科建设处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '.column-title',
    listSelector: 'ul.wp_article_list > li.list_item',
    listParser: {
        dateSelector: '.Article_PublishDate',
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
