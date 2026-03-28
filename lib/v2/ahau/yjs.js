const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://yjs.ahau.edu.cn',
    typeName: '研究生招生信息网',
    feedTitle: (typeName) => `安徽农业大学研究生院 - ${typeName}`,
    fetchMethod: 'puppy',
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.ny-newslist_l h1',
    listSelector: '.newslist_r ul li',
});
