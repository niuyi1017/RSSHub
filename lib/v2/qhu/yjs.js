const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.qhu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `青海大学研究生院 - ${typeName}`,
    typeNameSelector: '.listTitle h2',
    listSelector: '.articleList ul li',
    listItemParser: ($item, $, pageUrl) => {
        const dateText = $item.find('span').text().replace(/[\[\]]/g, '');
        const aTag = $item.find('a');
        const title = aTag.attr('title') || aTag.text();
        const itemPath = aTag.attr('href');
        const link = itemPath && itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;
        return { title, link, date: dateText };
    },
    fetchDetail: true,
    detailContentSelector: '.article',
});
