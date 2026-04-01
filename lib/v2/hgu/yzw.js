const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.hgu.edu.cn/yzw',
    typeName: '通知公告',
    feedTitle: (typeName) => `河北地质大学研招网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/index/${type}.htm`,
    typeNameSelector: '.inner_left h2 p',
    listSelector: '.newlist1 ul.list > li',
    listParser: {
        dateSelector: 'span',
        linkSelector: 'a',
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content_6 .v_news_content',
});
