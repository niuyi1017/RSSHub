const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.cauc.edu.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `中国民航大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.biaoTi span:first-child',
  listSelector: 'ul.ss li',
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});

