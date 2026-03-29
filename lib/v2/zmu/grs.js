const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://grs.zmu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `遵义医科大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list-top h3',
  listSelector: 'ul.list li',
  listParser: { dateSelector: 'p' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
