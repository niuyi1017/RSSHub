const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.wtu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `武汉纺织大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.right_top h3',
    listSelector: '.list ul li',
    listParser: { dateSelector: '.date1' },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
