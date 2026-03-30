const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.gsau.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `甘肃农业大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.list-content .header h1',
    listSelector: '.content ul li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const title = $item.find('h1').attr('title') || $item.find('h1').text().trim();
        const href = a.attr('href');
        const dateText = $item.find('.desc em').first().text().trim()
            .replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, '');
        return {
            title,
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
