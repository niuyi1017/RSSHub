const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.fosu.edu.cn/yjszs',
  typeName: '研究生招生网',
  feedTitle: (typeName) => `佛山大学研究生招生网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}`,
  typeNameSelector: '.right-map .left',
  listSelector: 'ul.essay-list > a',
  listItemParser: ($item, $, pageUrl) => {
    const $a = $item.is('a') ? $item : $item.find('a').first();
    const href = $a.attr('href');
    let itemUrl = '';
    if (href) {
      itemUrl = href.startsWith('http') ? href : new URL(href, pageUrl).href;
    }
    return {
      title: $a.find('.list-title').text().trim(),
      link: itemUrl,
      date: $a.find('.list-time').text().trim(),
    };
  },
  fetchMethod: 'puppy',
  fetchDetail: true,
  detailFetchMethod: 'puppy',
  detailContentSelector: '.essay-field',
});
