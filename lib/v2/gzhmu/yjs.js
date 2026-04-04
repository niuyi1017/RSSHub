const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.gzhmu.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `广州医科大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.pt',
  listSelector: 'table.lt tr',
  listParser: {
    dateSelector: 'td:last',
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['.att .dd'],
});
