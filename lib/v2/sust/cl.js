const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://cl.sust.edu.cn',
  typeName: '通知公告',
  feedTitle: (typeName) => `陕西科技大学材料科学与工程学院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.position a:last-child li.on',
  listSelector: '.essay-list li',
  listParser: { dateSelector: '.list-time' },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
