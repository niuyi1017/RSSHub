const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.cmu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `中国医科大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/cmuyjs/${type}.htm`,
    fetchMethod: 'puppy',
    typeNameSelector: '.currentfontstyle1022520',
    listSelector: 'table.winstyle1022523 tr',
    listItemParser: ($item, $, pageUrl) => {
        const aTag = $item.find('a.c1022523');
        const itemPath = aTag.attr('href');
        const itemUrl = itemPath ? new URL(itemPath, pageUrl).href : '';

        return {
            title: aTag.attr('title') || aTag.text().trim(),
            link: itemUrl,
            date: $item.find('.timestyle1022523').text().replace(/\u00a0/g, '').trim(),
        };
    },
    fetchDetail: false
});
