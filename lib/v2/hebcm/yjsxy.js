const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsxy.hebcm.edu.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `河北中医药大学研究生学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  listSelector: '.tza-listbt',
  listParser: { dateSelector: '.tza-listday' },
  encoding: 'gb2312',
  fetchDetail: true,
  detailContentSelector: '#conN',
});
