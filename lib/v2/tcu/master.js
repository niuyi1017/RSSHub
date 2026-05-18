const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://master.tcu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `天津城建大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.pageMainContent h2.tt',
  listSelector: '.pageMainContent ul > li',
  listParser: {
    linkSelector: 'a[href*="info/"]',
    dateSelector: 'span',
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  detailExtraSelectors: ['ul[style="list-style-type:none;"]'],
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
