const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.hfnu.edu.cn',
    typeName: '研究生招生',
    feedTitle: (typeName) => `合肥师范学院研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.right-list-tit h3',
    listSelector: '.list .lby-list > li',
    fetchDetail: true,
    detailContentSelector: '.content-content .v_news_content',
});
