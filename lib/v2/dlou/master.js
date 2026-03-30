const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
    host: 'https://master.dlou.edu.cn',
    typeName: '招生工作',
    feedTitle: (typeName) => `大连海洋大学研究生与学科建设处 - ${typeName}`,
    buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
    typePreprocess: (type) => type,
    typeNameSelector: '.col_title h2',
    listSelector: 'ul.news_list li.news',
    listParser: { dateSelector: 'span.news_meta' },
    fetchDetail: true,
    detailContentSelector: '.wp_articlecontent',
});
