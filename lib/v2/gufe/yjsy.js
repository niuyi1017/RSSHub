const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsy.gufe.edu.cn',
  typeName: '招生工作',
  feedTitle: (typeName) => `贵州财经大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.PTitle',
  listSelector: '.liebiao li',
  listParser: {
    dateSelector: 'span',
  },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
