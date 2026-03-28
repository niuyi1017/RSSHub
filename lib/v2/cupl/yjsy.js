const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.cupl.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `中国政法大学研究生院 - ${typeName}`,
    fetchMethod: 'puppy',
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.left_lanmu > ul > li > a',
    listSelector: '.list_con li',
    fetchDetail: true,
    detailFetchMethod: 'puppy',
    detailContentSelector: '#vsb_content .v_news_content',
});
