const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.mnnu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `闽南师范大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.main_conLT a.cur',
    listSelector: '.main_conR .main_conRCb > ul > li',
    fetchDetail: true,
    detailContentSelector: '.main_content .main_conDiv',
});
