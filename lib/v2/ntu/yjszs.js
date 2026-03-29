const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.ntu.edu.cn',
    typeName: '信息公告',
    feedTitle: (typeName) => `南通大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: 'li.col_title h2',
    listSelector: 'ul.news_list li.news',
    listParser: { dateSelector: 'span.news_meta' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
