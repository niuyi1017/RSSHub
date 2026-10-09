const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.cmu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `中国医科大学研究生院 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/cmuyjs/${type}.htm`,
    fetchMethod: 'puppy',
    typeNameSelector: '.currentfontstyle1022520',
    listSelector: 'table.winstyle1022523 > tbody > tr:has(a.c1022523)',
    listParser: {
        linkSelector: 'a.c1022523',
        dateSelector: '.timestyle1022523',
        dateTransform: (date) => date.replace(/\u00a0/g, '').trim(),
    },
});
