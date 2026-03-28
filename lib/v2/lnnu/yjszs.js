const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.lnnu.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `辽宁师范大学研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.ny_right .t > span',
    listSelector: '.list02 .item',
    listItemParser: ($item, $, pageUrl) => {
        const title = $item.find('.txt h2').text().trim();
        const itemPath = $item.find('a[target="_blank"]').attr('href');
        const day = $item.find('.date span').text().trim();
        const yearMonth = $item.find('.date').text().replace(day, '').replace('/', '').trim();
        const date = `${yearMonth}-${day}`;
        let link = '';
        if (itemPath && itemPath.startsWith('http')) {
            link = itemPath;
        } else if (itemPath) {
            link = new URL(itemPath, pageUrl).href;
        }
        return { title, link, date };
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content .v_news_content',
});
