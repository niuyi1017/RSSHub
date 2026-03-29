const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://grc.sxnu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `山西师范大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: '.main-right h2',
    listSelector: 'div.txt-list ul li',
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
