const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yzb.btbu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `北京工商大学研究生院 - ${typeName}`,
    typeNameSelector: '.add h2',
    listSelector: '.page .title .list ul li',
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
