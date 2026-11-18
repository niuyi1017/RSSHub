const { createRoute } = require('@/v2/utils/news-list-template');

const config = {
  host: 'https://grs.zmu.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `遵义医科大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list-top h3',
  listSelector: 'ul.list li',
  listParser: { dateSelector: 'p' },
  fetchDetail: true,
  detailContentSelector: '#vsb_content',
};

const defaultRoute = createRoute(config);
const mastersAdmissionsRoute = createRoute({
  ...config,
  // The primary RSSHub node cannot reach the site's IPv6 address.
  gotOptions: {
    dnsLookupIpVersion: 'ipv4',
    https: { rejectUnauthorized: true },
  },
});

module.exports = (ctx) => (ctx.request.params.type === 'qrzzs-ssyjs' ? mastersAdmissionsRoute(ctx) : defaultRoute(ctx));
