const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    admission: true,
    host: 'https://yz.bua.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `北京农学院研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${['zsjz', 'ksdg', 'zsdt'].includes(type) ? '' : 'index/'}${type}.htm`,
    typeNameSelector: '.current a[style*="color:#29B0CA"]',
    listSelector: '.text-list ul li',
    listParser: {
        dateSelector: 'span',
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
