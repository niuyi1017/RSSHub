const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://opt.cas.cn',
  typeName: '招生动态',
  feedTitle: (typeName) => `中国科学院西安光机所人事教育处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  typeNameSelector: '.column1_l',
  listSelector: '.list-news ul li',
  fetchDetail: true,
  detailContentSelector: '.xilan-content-main',
});
