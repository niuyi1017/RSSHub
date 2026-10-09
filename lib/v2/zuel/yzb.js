const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://yzb.zuel.edu.cn',
    typeName: '研究生招生网',
    feedTitle: (typeName) => `中南财经政法大学研究生招生网 - ${typeName.trim()}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    fetchMethod: 'puppy',
    typeNameSelector: '.col_title h2',
    listSelector: '#wp_news_w6 .news_list > .news',
    listParser: {
        dateSelector: '.news_meta',
        linkSelector: '.news_title a',
    },
});
