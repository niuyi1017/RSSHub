const { createRoute } = require('@/v2/utils/news-list-template');

const legacyRoute = createRoute({
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

const admissionsRoute = createRoute({
    host: 'http://yjs.dep.dlpu.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `大连工业大学研究生学院 - ${typeName}`,
    buildPageUrl: (host) => `${host}/6.html`,
    typeNameSelector: '.totitle a',
    listSelector: '.main.List1 .m > ul.list > li',
    listItemParser: ($item, $, pageUrl) => {
        const anchor = $item.children('a');
        const href = anchor.attr('href');
        return {
            title: anchor.find('.stitle').text().trim(),
            link: href ? new URL(href, pageUrl).href : '',
            date: $item.children('.sdate').text().trim(),
        };
    },
    fetchDetail: true,
    detailContentSelector: '.minfo > .content',
    gotOptions: { https: { rejectUnauthorized: true } },
});

module.exports = (ctx) => (ctx.request.params.type === '4' ? admissionsRoute(ctx) : legacyRoute(ctx));
