const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.swfu.edu.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `西南林业大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.channl-menu h2 b',
  listSelector: '.list ul li',
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
