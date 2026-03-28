const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://yjsc.xjnu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `新疆师范大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.Column_Name',
  listSelector: '#wp_news_w4 tr[id]',
  listParser: { dateSelector: 'div' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
});
