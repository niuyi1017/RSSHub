const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.qztc.edu.cn',
  typeName: '招生动态',
  feedTitle: (typeName) => `泉州师范学院研究生招生网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.col_title h2',
  listSelector: 'ul.wp_article_list li',
  listParser: { dateSelector: '.Article_PublishDate' },
  fetchDetail: true,
  detailContentSelector: '.news_content',
});
