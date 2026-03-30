const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.nxmu.edu.cn/yjsy',
  typeName: '硕士生招生',
  feedTitle: (typeName) => `宁夏医科大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list-tit span',
  listSelector: 'table.winstyle1253 tr',
  listParser: { dateSelector: 'td:last-child' },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
