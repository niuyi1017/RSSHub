const { createRoute } = require('@/v2/utils/news-list-template');

module.exports = createRoute({
  host: 'https://www.htu.edu.cn',
  typeName: '硕士招生',
  feedTitle: (typeName) => `河南师范大学研究生招生网 - ${typeName}`,
  buildPageUrl: (host, type) => `${host}/${type}/list.htm`,
  typeNameSelector: '.tabs .item.selected a',
  listSelector: '.list .item',
  listItemParser: ($item, $, pageUrl) => {
    const title = $item.find('.name').text().trim();
    const date = $item.find('.time').text().trim();
    const href = $item.attr('href');
    const link = href && href.startsWith('http') ? href : new URL(href, pageUrl).href;
    return { title, link, date };
  },
  fetchDetail: true,
  detailContentSelector: '.wp_articlecontent',
});
