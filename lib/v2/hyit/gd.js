const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
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
