const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.whsu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `武汉体育学院研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.partTitle h3',
  listSelector: '.titleList li',
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
