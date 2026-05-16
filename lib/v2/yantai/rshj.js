const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://rshj.yantai.gov.cn',
  typeName: '事业单位公开招聘',
  feedTitle: (typeName) => `烟台市人力资源社会保障局 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  typeNameSelector: 'title',
  listSelector: '.common-news-lists li',
  limit: 20,
  listParser: { dateSelector: 'span' },
  fetchDetail: true,
  detailContentSelector: '.content-box',
});
