const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://www.imufe.edu.cn',
    typeName: '招生就业',
    feedTitle: (typeName) => `内蒙古财经大学学科建设处（研究生院） - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/yjs/${type}.htm`,
    typeNameSelector: '.CurrChnlCls:last',
    listSelector: 'ul[id^="line_u7_"]',
    listParser: {
        dateSelector: 'li:last-child',
        linkSelector: 'li:nth-child(2) a',
        dateTransform: (d) => d.replace(/\[|\]/g, ''),
    },
    fetchDetail: true,
    detailContentSelector: '#vsb_content',
});
