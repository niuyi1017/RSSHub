const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://gs.swust.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `西南科技大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zs/${type}/list.htm`,
    typePreprocess: (type) => ({ 7797: '13185', 7796: '13183', 7798: '13184' }[type] || type),
    typeNameSelector: '.Column_Name',
    listSelector: '.content .mt-4 ul li',
    listParser: { dateSelector: 'span:last-child' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
