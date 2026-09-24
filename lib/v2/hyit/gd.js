const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://gd.hau.edu.cn',
    typeName: '研究生院',
    feedTitle: (typeName) => `淮安大学（原淮阴工学院）研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '#index a:last-of-type',
    typePreprocess: (type) => ({ zsgz: 'zsxx/tzgg', 'zsgz-tzgg': 'zsxx/tzgg', 'zsgz-zswj': 'zsxx/zswj' }[type] || type.replace(/-/g, '/')),
    listSelector: '.ny-right .list li',
    listParser: {
        linkSelector: 'a',
        dateSelector: 'em',
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
    gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
