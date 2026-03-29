const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://yzb.sntcm.edu.cn',
    typeName: '招生动态',
    feedTitle: (typeName) => `陕西中医药大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/info/iList.jsp?cat_id=${type}`,
    typePreprocess: (type) => type,
    typeNameSelector: '.list_xwdtt h1',
    listSelector: '.list_r_t ul li',
    fetchDetail: true,
    detailContentSelector: '#wrapper',
});
