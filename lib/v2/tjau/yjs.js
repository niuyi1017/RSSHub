const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjs.tjau.edu.cn',
    typeName: '信息查询',
    feedTitle: (typeName) => `天津农学院党委研究生工作部（研究生院）- ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zsgz/${type}.htm`,
    typeNameSelector: '.windowstyle130112',
    listSelector: 'table.winstyle130131 tr:has(a.c130131)',
    listParser: {
        dateSelector: '.timestyle130131',
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
