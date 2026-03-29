const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.guet.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `桂林电子科技大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjszs/${type}/list.htm`,
    typePreprocess: (type) => type,
    listSelector: 'div.lby table.winstyle165557 tr[height="26"]',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a.c165557');
        const title = a.attr('title') || a.text().trim();
        const href = a.attr('href');
        const link = href ? new URL(href, pageUrl).href : '';
        const dateText = $item.next('tr[height="1"]').length
            ? $item.find('td.timestyle165557').text().trim()
            : $item.find('td.timestyle165557').text().trim();
        return { title, link, date: dateText };
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
