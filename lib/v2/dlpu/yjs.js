const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://yjs.dep.dlpu.edu.cn',
    typeName: '研究生学院',
    feedTitle: (typeName) => `大连工业大学研究生学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/zs.asp?f_menu_id=${type}`,
    typeNameSelector: '.totitle a',
    listSelector: '.infolist21 .info',
    listParser: {
        dateSelector: '.sdate',
        linkSelector: '.stitle a',
        titleAttr: 'title',
    },
    encoding: 'gb2312',
    fetchDetail: true,
    detailContentSelector: '.listword-px14-22',
    detailExtraSelectors: ['.ke-insertfile'],
});
