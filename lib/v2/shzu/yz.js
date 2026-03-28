const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yz.shzu.edu.cn',
    typeName: '研究生招生信息网',
    feedTitle: (typeName) => `石河子大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '.Column_Name',
    listSelector: '.wp_article_list .list_item',
    listParser: { dateSelector: '.Article_PublishDate' },
    fetchDetail: true,
    detailContentSelector: '.Article_Content',
});
