const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.gszy.edu.cn',
    typeName: '招生在线',
    feedTitle: (typeName) => `甘肃中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/html/cid/${type}.html`,
    typePreprocess: (type) => type,
    typeNameSelector: '.base_title h3 a',
    listSelector: '.base_news_listli1',
    listParser: { dateSelector: 'span', titleAttr: 'title' },
    fetchDetail: true,
    detailContentSelector: '.base_news_main',
});
