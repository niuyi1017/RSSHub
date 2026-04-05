const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://gra.hutb.edu.cn',
  typeName: '研究生院',
  feedTitle: (typeName) => `湖南工商大学研究生院 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}`,
  typeNameSelector: '.neiye-top p a:last-of-type',
  listSelector: '.neiye-right ul > li',
  listParser: {
    linkSelector: 'a',
    dateSelector: 'span',
  },
  fetchDetail: true,
  detailParser: ($) => {
    const box = $('.neiye-right.fr').first();
    return box.length ? box.html().trim() : null;
  },
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
});
