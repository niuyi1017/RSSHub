const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.gpnu.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `广东技术师范大学研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.windowstyle258609',
    listSelector: 'ul.n_listxx1 li',
    listParser: { dateSelector: 'span.time' },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
