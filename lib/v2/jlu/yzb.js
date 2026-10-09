const { createRoute } = require('@/v2/utils/news-list-template');

const sharedConfig = {
    admission: true,
    host: 'https://yzb.jlu.edu.cn',
    feedTitle: (typeName) => `吉林大学研究生招生信息网 - ${typeName}`,
    fetchDetail: true,
};

const homepageRoute = createRoute({
    ...sharedConfig,
    typeName: '通知公告',
    typePreprocess: () => '',
    buildPageUrl: (host) => `${host}/index.htm`,
    listSelector: '.homea .left > ul.list > li',
    listParser: {
        dateSelector: '.time',
        dateTransform: (date) => date.trim().replace(/^(\d{1,2})\s*(\d{4})\.(\d{2})$/, '$2-$3-$1'),
    },
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['.nyArc ul[style="list-style-type:none;"]'],
});

const columnRoute = createRoute({
    ...sharedConfig,
    typeName: '硕士招生',
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    listSelector: '.txtList > li',
    listItemParser: ($item, $, pageUrl) => ({
        title: $item.find('a').attr('title') || $item.find('h4').text().trim(),
        link: new URL($item.find('a').attr('href'), pageUrl).href,
        date: `${$item.find('time').clone().children().remove().end().text().trim().replace('.', '-')}-${$item.find('time span').text().trim()}`,
    }),
    detailContentSelector: '.v_news_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});

module.exports = (ctx) => (ctx.params.type && ctx.params.type !== 'index' ? columnRoute(ctx) : homepageRoute(ctx));
