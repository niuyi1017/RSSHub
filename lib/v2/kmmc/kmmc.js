const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.kmmc.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `昆明医科大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/list${type}.aspx`,
    typePreprocess: (type) => type,
    typeNameSelector: '.nav-item a.on',
    listSelector: 'ul.list_style li',
    fetchDetail: true,
    detailContentSelector: 'div.article',
});
