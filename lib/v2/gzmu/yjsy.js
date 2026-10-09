const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.gzmu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `贵州民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}`,
    typeNameSelector: '.mainContent .mHd h3 span',
    listSelector: '.mainContent .newsList > li',
    listParser: { dateSelector: '.date', titleAttr: '' },
    fetchDetail: true,
    detailContentSelector: '.articleCon .conTxt',
    detailDateParser: ($) => $('meta[name="PubDate"]').attr('content'),
});
