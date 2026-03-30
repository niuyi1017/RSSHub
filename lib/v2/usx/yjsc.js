const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsc.usx.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `绍兴文理学院研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yzw/${type}.htm`,
    typeNameSelector: '.right_tit h2',
    listSelector: 'ul.news_list li',
    listParser: {
        dateSelector: 'div.date',
        dateTransform: (d) => d.replace(/[\[\]]/g, ''),
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
