const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yzb.jlu.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `吉林大学研究生招生信息网 - ${typeName}`,
    typePreprocess: () => '',
    buildPageUrl: (host) => `${host}/index.htm`,
    listSelector: '.homea .left > ul.list > li',
    listParser: {
        dateSelector: '.time',
        dateTransform: (date) => date.trim().replace(/^(\d{1,2})\s*(\d{4})\.(\d{2})$/, '$2-$3-$1'),
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['.nyArc ul[style="list-style-type:none;"]'],
});
