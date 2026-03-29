const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yzb.gdufe.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `广东财经大学研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: '.col_title h2',
    listSelector: 'ul.news_list li',
    listParser: { dateSelector: 'span.news_meta' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
