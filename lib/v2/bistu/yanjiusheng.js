const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yanjiusheng.bistu.edu.cn',
    typeName: '硕士生招生',
    feedTitle: (typeName) => `北京信息科技大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/index.html`,
    typeNameSelector: '.chnl-title .chnl-brb a',
    listSelector: 'ul.list3 li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const title = $item.find('span.list3-title').text().trim();
        const href = a.attr('href');
        const dateText = $item.find('span.list3-time').text().trim();
        return {
            title,
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.artcon',
});
