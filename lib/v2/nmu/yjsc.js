const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.nmu.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `北方民族大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.main_conLT dt',
    listSelector: '.main_conRCb ul li',
    listParser: {
        dateSelector: 'span',
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
