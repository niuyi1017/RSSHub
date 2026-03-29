const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.cueb.edu.cn',
    typeName: '研招办',
    feedTitle: (typeName) => `首都经济贸易大学研招办 - ${typeName}`,
    typeNameSelector: '.position',
    listSelector: '.news_list .box li',
    fetchDetail: true,
    detailContentSelector: '#text',
});
