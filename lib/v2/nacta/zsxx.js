const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.nacta.edu.cn',
  typeName: '招生信息',
  feedTitle: (typeName) => `中国戏曲学院 - ${typeName}`,
  typeNameSelector: '.listTitle span',
  listSelector: 'ul.Nacta-list09 li',
  listParser: {
    dateSelector: 'span.rightDate',
    dateTransform: (d) => d.replace(/\./g, '/'),
  },
  fetchDetail: true,
  detailContentSelector: '.article02',
  detailExtraSelectors: ['.Annex'],
});
