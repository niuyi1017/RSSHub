const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsxy.lnut.edu.cn',
  typeName: '招生动态',
  feedTitle: (typeName) => `辽宁工业大学研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.fontstyle129853:last',
  listSelector: '.columns-left > ul > li',
  listParser: { dateSelector: '.timea' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
