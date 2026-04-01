const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.bbmu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `蚌埠医科大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zsjy/${type}.htm`,
    typeNameSelector: '.newslist_l h1',
    listSelector: '.newslist_r > ul > li[id^="line_u7_"]',
    listParser: {
        dateSelector: 'span.fr',
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
