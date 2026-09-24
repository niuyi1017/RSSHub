const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjs.hebut.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `河北工业大学研究生院 - ${typeName}`,
    typePreprocess: (type) => (type === 'ssyjszszl' ? 'ssyjszszl/tzgg3_0' : type.replace(/-/g, '/')),
    buildPageUrl: (host, type) => `${host}/zsgz/${type}/index.htm`,
    listSelector: '.block-list64 li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('.gpArticleTitle').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item.find('.gpArticleDate').text().trim(),
    }),
    fetchDetail: true,
    detailContentSelector: '.gp-article',
});
