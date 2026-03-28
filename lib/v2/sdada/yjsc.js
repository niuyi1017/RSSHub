const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.sdada.edu.cn',
    typeName: '研究生处',
    feedTitle: (typeName) => `山东工艺美术学院研究生处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjsc/${type}.htm`,
    typeNameSelector: '.n_sanji li.on a',
    listSelector: '.list15 li',
    listItemParser: ($item, $, pageUrl) => {
        const aTag = $item.find('a');
        const title = $item.find('h4').text();
        const date = $item.find('h6').text();
        const itemPath = aTag.attr('href');
        const link = itemPath.startsWith('http') ? itemPath : new URL(itemPath, pageUrl).href;
        return { title, link, date };
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content_2',
});
