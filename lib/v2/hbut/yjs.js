const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.hbut.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `湖北工业大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.m_right .dqlm h6',
    listSelector: '.m_right .btlist > ul > li',
    listParser: { dateSelector: '.time', linkSelector: 'p a' },
    fetchDetail: true,
    detailContentSelector: '.wznr .v_news_content',
    detailExtraSelectors: ['.wznr ul[style="list-style-type:none;"]'],
});
