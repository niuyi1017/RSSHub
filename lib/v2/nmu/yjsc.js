const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.nmu.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `北方民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.main_conLT dl dt',
    listSelector: '.main_conRCb ul li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const title = a.find('em').text().trim() || a.text().trim();
        const date = a.find('span').text().trim();
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
