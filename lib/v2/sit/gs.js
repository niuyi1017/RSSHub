const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.sit.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `上海应用技术大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.leftNav .on a',
    listSelector: '.text-list ul li',
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
