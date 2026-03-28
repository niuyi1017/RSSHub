const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsh.sdut.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `山东理工大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.Column_Name',
  listSelector: '.list-column li',
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
