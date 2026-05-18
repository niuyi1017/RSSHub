const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.hrbcu.edu.cn',
  typeName: '硕士研究生',
  feedTitle: (typeName) => `哈尔滨商业大学研究生学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list-bt',
  listSelector: '.list-con ul li',
  listParser: { dateSelector: 'i' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content .v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
});
