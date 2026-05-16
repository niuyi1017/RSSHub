const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://gs.cupes.edu.cn',
  typeName: '招生通知',
  feedTitle: (typeName) => `首都体育学院研究生部 - ${typeName}`,
  listSelector: '.newsList li',
  fetchDetail: true,
  detailContentSelector: '.pageArticle .article',
});
