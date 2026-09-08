const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsy.gzmu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `贵州民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}`,
    typeNameSelector: '.section-name',
    listSelector: '.newsList li',
    listParser: { dateSelector: '.date', titleAttr: false },
    fetchDetail: true,
    detailContentSelector: '.conTxt',
});
