const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://zyd.cdutcm.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `成都中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjs/${type.replace(/-/g, '/')}`,
    typeNameSelector: '.mHd h3 span',
    listSelector: '.pageTPList li',
    listParser: {
        dateSelector: '.date',
        dateTransform: (d) => d.slice(-10),
    },
    fetchDetail: true,
    detailContentSelector: '.conTxt',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
