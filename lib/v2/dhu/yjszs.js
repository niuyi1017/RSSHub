const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.dhu.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `东华大学研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typeNameSelector: '.col_title h2',
    listSelector: '.news_list li.news',
    listItemParser: ($item, $, pageUrl) => {
        const yearMonth = $item.find('.news_year').text().trim();
        const day = $item.find('.news_day').text().trim();
        const date = `${yearMonth}-${day}`;
        const aTag = $item.find('a.news_box');
        const title = $item.find('.news_title').text().trim();
        const itemPath = aTag.attr('href');
        let link = '';
        if (itemPath && itemPath.startsWith('http')) {
            link = itemPath;
        } else if (itemPath) {
            link = new URL(itemPath, pageUrl).href;
        }
        return { title, link, date };
    },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
