const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yz.bua.edu.cn',
    typeName: '通知公告',
    feedTitle: (typeName) => `北京农学院研究生招生网 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/index/${type}.htm`,
    typeNameSelector: '.current a[style*="color:#29B0CA"]',
    listSelector: '.tr-ri ul li',
    listParser: {
        dateSelector: 'span',
    },
    fetchDetail: true,
    detailContentSelector: '.v_news_content',
});
