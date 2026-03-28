const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.ncu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `南昌大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.channl-menu li.on a',
    listSelector: '.text-list ul li',
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
