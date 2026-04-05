const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://grs.gdou.edu.cn',
  typeName: '硕士生招生信息',
  feedTitle: (typeName) => `广东海洋大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.nytit a:last',
  listSelector: '.Newslist ul li',
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
