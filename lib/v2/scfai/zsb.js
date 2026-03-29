const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.scfai.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `四川美术学院招生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zsb/${type}.htm`,
    typeNameSelector: '.z3_1_nav',
    listSelector: '.z3_1 ul li',
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
