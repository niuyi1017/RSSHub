const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsb.ahtcm.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `安徽中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.channl-menu h2',
    listSelector: '.text-list ul li',
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
