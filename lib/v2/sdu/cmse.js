const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'http://www.cmse.sdu.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `山东大学材料科学与工程学院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/rcpy_new25/${type}.htm`,
    typeNameSelector: '#sub_right_top_l',
    listSelector: '#list ul li',
    listItemParser: ($item, $, pageUrl) => {
        const dateText = $item.find('span.date').text().replace(/[[\]]/g, '');
        const a = $item.find('a');
        const title = a.attr('title') || a.text();
        const href = a.attr('href');
        const link = href && href.startsWith('http') ? href : href ? new URL(href, pageUrl).href : '';
        return { title, link, date: dateText };
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
