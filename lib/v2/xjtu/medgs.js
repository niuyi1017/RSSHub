const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://medgs.xjtu.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `西安交通大学医学部研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.content_left_bttom a.clicka',
    listSelector: '.list_ ul li',
    listParser: {
        dateSelector: '.listriqi',
    },
});
