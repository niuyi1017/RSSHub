const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.zut.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `中原工学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.biaoTi > span:first-of-type',
  listSelector: 'ul.ss li',
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
