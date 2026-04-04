const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.ecut.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `东华理工大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '#container_content .biaoti1 span',
  listSelector: '#wp_news_w6 .wp_article_list_table > tbody > tr > td > table',
  listParser: {
    dateSelector: 'tr:first-child > td:last-child',
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
