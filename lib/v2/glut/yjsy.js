const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.glut.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `桂林理工大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/xwgl/${type}.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: '.ejdh a.left-current',
    listSelector: '.right-list ul li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const dateText = $item.find('i').text().trim();
        const href = a.attr('href');
        return {
            title: a.text().trim(),
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
