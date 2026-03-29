const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://graduate.sisu.edu.cn',
    typeName: '招生信息',
    feedTitle: (typeName) => `四川外国语大学研究生院 - ${typeName}`,
    typeNameSelector: '.erji a[href="index.htm"]',
    listSelector: 'UL.li-1 LI',
    listParser: { dateSelector: 'SPAN' },
    fetchDetail: true,
    detailContentSelector: '.in-det-det',
});
