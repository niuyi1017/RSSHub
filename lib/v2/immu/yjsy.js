const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yjsy.immu.edu.cn',
    typeName: '硕士招生',
    feedTitle: (typeName) => `内蒙古医科大学研究生院 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}.htm`,
    typeNameSelector: '.channl-menu h2 b',
    listSelector: 'ul.text-list2 li',
    listItemParser: ($item, $, pageUrl) => {
        const a = $item.find('a');
        const title = a.attr('title') || a.text().trim();
        const href = a.attr('href');
        const month = $item.find('.date2 span').text().trim();
        const day = $item.find('.date2 p').text().trim();
        const dateText = month && day ? `${month}-${day}` : '';
        return {
            title,
            link: href ? new URL(href, pageUrl).href : '',
            date: dateText,
        };
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
    detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
