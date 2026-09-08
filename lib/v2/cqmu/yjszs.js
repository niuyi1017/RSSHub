const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjszs.cqmu.edu.cn',
    typeName: '招生通知',
    feedTitle: (typeName) => `重庆医科大学研究生招生网 - ${typeName}`,
    typePreprocess: (type) => (!type || type === 'tzgg-75' ? 'index/tzgg' : type.replace(/-/g, '/')),
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    listSelector: '.n_listxx1 li',
    listParser: { linkSelector: 'h2 a', dateSelector: '.time' },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
