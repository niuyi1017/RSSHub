const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://zsks.whcm.edu.cn',
    typeName: '动态信息',
    feedTitle: (typeName) => `武汉音乐学院招生信息网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zslb/${type}.htm`,
    typeNameSelector: '.ggtop .lm',
    listSelector: 'ul.listul > li[id^="line_u10_"]',
    listParser: {
        dateSelector: '.sj',
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content_2 .v_news_content',
});
