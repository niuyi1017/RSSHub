const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://gs.swust.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `西南科技大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zs/${type}/list.htm`,
    typeNameSelector: '.Column_Name',
    listSelector: 'div[frag="窗口37"] ul li',
    listParser: { dateSelector: 'span:last-child' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
