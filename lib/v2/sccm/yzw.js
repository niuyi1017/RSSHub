const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'http://yzw.sccm.cn',
  typeName: '公告',
  feedTitle: (typeName) => `四川音乐学院研究生招生 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/info/site/more?category=${type}`,
  typeNameSelector: '.left-nav-g .am-nav .am-active a',
  listSelector: '.am-list.cy .am-list-item-dated',
  listParser: {
    dateSelector: '.am-list-date',
    linkSelector: '.am-list-item-hd',
  },
  fetchDetail: true,
  detailContentSelector: '.blog-content',
});
