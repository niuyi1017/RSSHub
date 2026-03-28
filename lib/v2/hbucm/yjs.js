const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjs.hbucm.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `湖北中医药大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.lm_name h2',
  listSelector: '.fy-list ul li',
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
