const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://hrss.shandong.gov.cn',
  typeName: '省属事业单位公开招聘服务平台',
  feedTitle: (typeName) => `山东省人力资源和社会保障厅 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/`,
  typeNameSelector: 'title',
  limit: 20,
  listSelector: '.news_box01_con ul li',
  listParser: { dateSelector: 'span:last-child' },
  fetchDetail: true,
  detailContentSelector: '.side_news',
});
