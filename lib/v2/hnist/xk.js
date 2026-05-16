const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://xk.hnist.cn',
  typeName: '研究生工作部',
  feedTitle: (typeName) => `湖南理工学院研究生工作部 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}.htm`,
  typeNameSelector: '.list_twidth .tit td a:last-child span',
  listSelector: '.box2 li[id^="line_u"]',
  gotOptions: { dnsLookupIpVersion: 'ipv4' },
  listItemParser: ($item, $, pageUrl) => {
    const $a = $item.find('a[href*="/info/"]').first();
    const href = $a.attr('href');
    let itemUrl = '';
    if (href) {
      itemUrl = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    }
    const date = $item.nextAll('span.dateR').first().text().trim();
    return {
      title: $a.text().trim(),
      link: itemUrl,
      date,
    };
  },
  fetchDetail: true,
  detailContentSelector: '.v_news_content',
});
