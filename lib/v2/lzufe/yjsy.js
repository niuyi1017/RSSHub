const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.lzufe.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `兰州财经大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zsgz/${type}.htm`,
    typeNameSelector: '.windowstyle1092724',
    listSelector: '.winstyle1092723 tr',
    listParser: {
        dateSelector: '.timestyle1092723',
        linkSelector: 'a.c1092723',
        dateTransform: (date) => date.trim(),
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content .v_news_content',
    detailExtraSelectors: ['a[href*="download.jsp"]'],
});
