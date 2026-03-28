const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.xtu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `湘潭大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.position h3',
    listSelector: '.lists ul li',
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
