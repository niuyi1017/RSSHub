const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.gzhu.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `广州大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.channl-menu li.on a',
    listSelector: '.text-list ul li',
    listItemParser: ($item, $, pageUrl) => {
        const aTag = $item.find('a');
        const title = aTag.find('.tx h3').text().trim();
        const day = aTag.find('.date b').text().trim();
        const yearMonth = aTag.find('.date span').text().trim();
        const date = `${yearMonth}-${day.padStart(2, '0')}`;
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
    detailContentSelector: '.v_news_content',
});
