const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.sau.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `沈阳航空航天大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.channl-menu h2',
    listSelector: '.text-list ul li',
    fetchDetail: true,
    detailContentSelector: '.art-body',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
