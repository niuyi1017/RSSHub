const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.ahstu.edu.cn/yjs',
  typeName: '研究生处',
  feedTitle: (typeName) => `安徽科技学院研究生处 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.fl h2',
  listSelector: 'ul.notice_list li',
  listParser: {
    dateSelector: 'span',
    dateTransform: (d) => d.replace(/[年月]/g, '/').replace(/日/g, ''),
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
