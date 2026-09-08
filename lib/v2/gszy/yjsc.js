const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsc.gszy.edu.cn',
    typeName: '招生在线',
    feedTitle: (typeName) => `甘肃中医药大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/html/cid/${type}.html`,
    typePreprocess: (type) => (type === '11' ? '12' : type),
    fetchMethod: 'puppy',
    typeNameSelector: '.base_title h3 a',
    listSelector: '.list_news_li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('h3').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: $item.find('span').text().trim(),
    }),
});
