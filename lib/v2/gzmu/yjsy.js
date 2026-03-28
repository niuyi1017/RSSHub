const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.gzmu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `贵州民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.section-name',
    listSelector: 'ul.list li.clr',
    listParser: { dateSelector: 'em' },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
