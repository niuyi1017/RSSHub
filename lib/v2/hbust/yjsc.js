const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.hbust.edu.cn',
  typeName: '研究生处',
  feedTitle: (typeName) => `湖北科技学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.ny_left_top h2',
  listSelector: '.Newslist ul li',
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
