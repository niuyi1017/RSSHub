const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.qhmu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `青海民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.dpdq h2, .ny_dh_x b',
    listSelector: 'ul.list li',
    fetchDetail: true,
    detailContentSelector: '#vsb_content .v_news_content',
});
