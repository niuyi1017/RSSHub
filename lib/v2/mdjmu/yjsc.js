const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.mdjmu.cn',
    typeName: '研究生招生考试',
    feedTitle: (typeName) => `牡丹江医科大学研究生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjsc/zsks/${type}.htm`,
    typeNameSelector: '.wape-right .biaoTi > span:first-child',
    listSelector: 'ul.ss > li',
    listParser: {
        dateSelector: 'span',
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
