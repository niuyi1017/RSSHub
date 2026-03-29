const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjszs.haut.edu.cn',
    typeName: '招生动态',
    feedTitle: (typeName) => `河南工业大学研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.title-tit',
    listSelector: 'ul.ul-pagenews li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a.con');
        const title = a.attr('title') || a.find('.tit').text().trim();
        const day = $item.find('.date .day').text().trim();
        const year = $item.find('.date .year').text().trim();
        const date = day ? `${year}/${day}` : '';
        const href = a.attr('href');
        return {
            title,
            link: href ? new URL(href, pageUrl).href : '',
            date,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
