const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://grs.sxau.edu.cn',
    typeName: '招生通知',
    feedTitle: (typeName) => `山西农业大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.sub_leftTitle h2, .inner-banner .text',
    listSelector: '.text-list ul li',
    listParser: { dateSelector: 'span', dateTransform: (d) => d.replace(/\./g, '-') },
    fetchDetail: true,
    detailContentSelector: '.detail-main',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
