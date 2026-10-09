const { createRoute } = require('@/v2/utils/news-list-template');

const columns = {
    ssyjszszl: 'ssyjszszl/tzgg3_0',
    bsyjszszl: 'bsyjszszl/tzgg5',
};

module.exports = createRoute({
    host: 'https://yjs.hebut.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `河北工业大学研究生院 - ${typeName.trim()}`,
    typePreprocess: (type) => columns[type] || type.replace(/-/g, '/'),
    buildPageUrl: (host, type) => `${host}/zsgz/${type}/index.htm`,
    typeNameSelector: '.block-list78 h2',
    listSelector: '.page-list18 > ul.block-list64 > li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('.gpArticleTitle').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item.find('.gpArticleDate').text().trim(),
    }),
    fetchDetail: true,
    detailParser: ($) => $('.gp-article, .tncontent, .wenzhang2').first().html()?.trim() || null,
});
