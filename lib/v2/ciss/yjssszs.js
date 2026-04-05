const { createRoute } = require('@/v2/utils/news-list-template');

const inner = createRoute({
  host: 'https://www.ciss.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `国家体育总局体育科学研究所研究生教育网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/index.html`,
  typeNameSelector: '.lanmu_l',
  listSelector: '.list-news ul.mouse-color li',
  listParser: { dateSelector: 'span.right' },
  fetchDetail: true,
  detailContentSelector: '.xilan-content-main',
});

module.exports = async (ctx) => {
  ctx.params = { ...ctx.params, type: 'yjssszs' };
  return inner(ctx);
};
