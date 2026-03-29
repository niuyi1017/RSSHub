const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.ecjtu.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `华东交通大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.col_title .Column_Anchor',
    listSelector: 'ul.wp_article_list li',
    listParser: {
        linkSelector: '.Article_Title a',
        titleAttr: 'title',
        dateSelector: '.Article_PublishDate',
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['ul.contentattach'],
});
