const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.dlu.edu.cn',
    typeName: '招生管理',
    feedTitle: (typeName) => `大连大学研究生学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.hd span',
    listSelector: '.lstbox .listUl li[id^="line_"]',
    listParser: { dateSelector: 'span', linkSelector: 'a:nth-of-type(2)' },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
