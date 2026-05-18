const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://hrss.dezhou.gov.cn',
    typeName: '招考信息',
    feedTitle: (typeName) => `德州市人社局 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type.replace(/-/g, '/')}/index.html`,
    listSelector: '.lb-z-r-content-b',
    listItemParser: ($item, $, pageUrl) => {
        const aTag = $item.find('a');
        const rawTitle = aTag.attr('title') || aTag.text();
        const title = rawTitle.replace(/^标题：/, '').trim();
        const href = aTag.attr('href') || '';
        const link = href.startsWith('http') ? href : new URL(href, pageUrl).href;
        const dateText = $item.find('td').eq(2).find('div').text().replace(/[\[\]]/g, '').trim();
        return { title, link, date: dateText };
    },
    fetchDetail: true,
    detailContentSelector: 'div[style*="1162px"]',
});
