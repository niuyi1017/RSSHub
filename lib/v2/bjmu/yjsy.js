const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.bjmu.edu.cn',
    typeName: '招生动态',
    feedTitle: (typeName) => `北京大学医学部研究生院 - ${typeName}`,
    typeNameSelector: '.subTitle h2',
    listSelector: '.sub_list li',
    listParser: {
        dateSelector: '.rightDate',
    },
    fetchDetail: true,
    detailContentSelector: '.subArticleCon',
});
