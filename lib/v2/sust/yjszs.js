const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjszs.sust.edu.cn',
    typeName: '研究生招生信息网',
    feedTitle: (typeName) => `陕西科技大学研究生招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '#cltop .titlestyle71566',
    listSelector: '.article-list li',
    listItemParser: ($item, $, pageUrl) => {
        const aTag = $item.find('a');
        const itemTitle = aTag.find('h3').text().trim();
        const itemPath = aTag.attr('href');
        const itemUrl = itemPath && itemPath.startsWith('http') ? itemPath : itemPath ? new URL(itemPath, pageUrl).href : '';
        const itemDate = `${$item.find('.ym').text().trim()}-${$item.find('.day').text().trim()}`;
        return { title: itemTitle, link: itemUrl, date: itemDate };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
