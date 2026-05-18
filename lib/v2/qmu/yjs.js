const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.qmu.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `齐齐哈尔医学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.Column_Anchor',
  listSelector: '.wp_article_list li',
  listParser: { dateSelector: '.Article_PublishDate' },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
