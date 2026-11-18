const { createRoute } = require('@/v2/utils/news-list-template');

const legacyRoute = createRoute({
  host: 'https://gd.hyit.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `淮阴工学院研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '#index a:last-of-type',
  listSelector: '#Result li',
  listParser: {
    linkSelector: 'span.title a',
    dateSelector: 'span.posttime',
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});

const admissionsRoute = createRoute({
  host: 'https://gd.hau.edu.cn',
  typeName: '招生通知公告',
  feedTitle: (typeName) => `淮安大学研究生院 - ${typeName}`,
  buildPageUrl: (host) => `${host}/zsxx/tzgg.htm`,
  listSelector: '.ny-right .list > ul > li',
  listParser: { dateSelector: 'em' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
  gotOptions: { https: { rejectUnauthorized: true } },
});

module.exports = (ctx) => (ctx.request.params.type === 'zsgz' ? admissionsRoute(ctx) : legacyRoute(ctx));
