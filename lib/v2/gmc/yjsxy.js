const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsxy.gmc.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `贵州医科大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.sitemap1 h3 b',
  listSelector: 'ul.list-1 li',
  listParser: { dateSelector: 'span.fr' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
