const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://admission.ucas.ac.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `中国科学院大学招生信息网 - ${typeName}`,
    typePreprocess: (type) => type,
    buildPageUrl: (host, type) => `${host}/ShowArticle/newslist1/${type}`,
    typeNameSelector: '.fxb ul li.erji_list',
    listSelector: 'ul.b-list li',
    listParser: { dateSelector: 'span.m-date' },
    fetchDetail: true,
    detailContentSelector: '.b-abody.sanji_content',
});
