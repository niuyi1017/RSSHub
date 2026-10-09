const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yjsc.gszy.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `甘肃中医药大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/html/cid/${type}.html`,
    typePreprocess: (type) => type,
    fetchMethod: 'puppy',
    typeNameSelector: '.main_er_right .base_title h3',
    listSelector: '.main_er_right .list_news_ul > .list_news_li',
    listItemParser: ($item, $, pageUrl) => {
        const link = $item.find('a').first();
        return {
            title: link.find('h3').text().trim(),
            link: new URL(link.attr('href'), pageUrl).href,
            date: link.find('span').text().trim(),
        };
    },
});
