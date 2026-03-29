const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.hactcm.edu.cn',
    typeName: '硕士研究生招生',
    feedTitle: (typeName) => `河南中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${type}`,
    typePreprocess: (type) => type,
    typeNameSelector: '.right_name',
    listSelector: '.right_content_item',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('.item_content_con').text().trim(),
        link: new URL($item.attr('href'), pageUrl).href,
        date: $item.find('.item_day').attr('date'),
    }),
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
