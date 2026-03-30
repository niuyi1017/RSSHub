const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.chnu.edu.cn',
    typeName: '新闻公告',
    feedTitle: (typeName) => `淮北师范大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}`,
    typeNameSelector: '.wHd h3 span',
    listSelector: '.content_left .infoList li:not(.split)',
    listParser: { dateSelector: 'span.date', titleAttr: null },
    fetchDetail: true,
    detailContentSelector: '#articleContnet',
});
