const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.hainnu.edu.cn',
    typeName: '研究生招生',
    feedTitle: (typeName) => `海南师范大学研究生学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '.page-title .Column_Anchor',
    listSelector: '.news-page-section .news-block-two',
    listParser: {
        dateSelector: '.post-info li',
        linkSelector: 'h4 a',
        dateTransform: (date) => date.trim(),
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
